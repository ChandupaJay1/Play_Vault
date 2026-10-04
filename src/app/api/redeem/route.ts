import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const activationKey = await prisma.activationKey.findUnique({
      where: { key: key.trim() },
      include: { game: true, order: true },
    });

    if (!activationKey) {
      return NextResponse.json({ error: "Invalid activation key" }, { status: 404 });
    }

    if (activationKey.status === "available") {
      // Free offer claim logic
      const availableSteamAccount = await prisma.steamAccount.findFirst({
        where: { gameId: activationKey.gameId, status: "available" }
      });
      if (!availableSteamAccount) {
        return NextResponse.json({ error: "No Steam accounts left for this game to claim." }, { status: 400 });
      }

      // Create free order
      const order = await prisma.order.create({
        data: {
          userId,
          gameId: activationKey.gameId,
          status: "completed",
          totalAmount: 0,
          paymentMethod: "Free Offer Key",
          adminNote: "Redeemed free offer key"
        }
      });

      // Update Key and Steam Account
      await prisma.$transaction([
        prisma.activationKey.update({
          where: { id: activationKey.id },
          data: { status: "used", orderId: order.id, userId, assignedAt: new Date() }
        }),
        prisma.steamAccount.update({
          where: { id: availableSteamAccount.id },
          data: { status: "assigned", orderId: order.id }
        })
      ]);

      return NextResponse.json({
        game: {
          id: activationKey.game.id,
          title: activationKey.game.title,
          imageUrl: activationKey.game.imageUrl,
        },
        steam: {
          email: availableSteamAccount.email,
          password: availableSteamAccount.password,
        },
      });
    }

    if (activationKey.userId && activationKey.userId !== userId) {
      return NextResponse.json({ error: "This key does not belong to your account" }, { status: 403 });
    }

    if (activationKey.status !== "assigned" && activationKey.status !== "used") {
      return NextResponse.json({ error: "Key is not active" }, { status: 400 });
    }

    if (activationKey.status !== "used") {
      await prisma.activationKey.update({
        where: { id: activationKey.id },
        data: { status: "used" },
      });
    }

    const steamAccount = await prisma.steamAccount.findFirst({
      where: { orderId: activationKey.orderId },
    });

    if (!steamAccount) {
      return NextResponse.json(
        { error: "No Steam account available for this game. Please contact support." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      game: {
        id: activationKey.game.id,
        title: activationKey.game.title,
        imageUrl: activationKey.game.imageUrl,
      },
      steam: {
        email: steamAccount.email,
        password: steamAccount.password,
      },
    });
  } catch (error) {
    console.error("POST /api/redeem error:", error);
    return NextResponse.json(
      { error: "Failed to redeem key" },
      { status: 500 }
    );
  }
}
