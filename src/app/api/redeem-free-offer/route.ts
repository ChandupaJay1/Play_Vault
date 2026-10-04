import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to claim a free offer." }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required." }, { status: 400 });
    }

    // Check if game is a free offer
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.isFreeOffer) {
      return NextResponse.json({ error: "This game is not available as a free offer." }, { status: 400 });
    }

    // Check if user already claimed this free offer
    const existingOrder = await prisma.order.findFirst({
      where: { userId, gameId, status: { in: ["completed", "approved"] } }
    });

    if (existingOrder) {
      return NextResponse.json({ error: "You have already claimed this game." }, { status: 400 });
    }

    // Find an available activation key and steam account
    const availableKey = await prisma.activationKey.findFirst({
      where: { gameId, status: "available" }
    });

    const availableSteamAccount = await prisma.steamAccount.findFirst({
      where: { gameId, status: "available" }
    });

    if (!availableKey || !availableSteamAccount) {
      return NextResponse.json({ error: "Sorry, we are out of stock for this free offer." }, { status: 400 });
    }

    // Claim the offer: Create Order, Update Key, Update Steam Account
    const order = await prisma.order.create({
      data: {
        userId,
        gameId,
        status: "completed",
        totalAmount: 0,
        paymentMethod: "Free Offer",
        adminNote: "Claimed via Free Offer"
      }
    });

    await prisma.$transaction([
      prisma.activationKey.update({
        where: { id: availableKey.id },
        data: { status: "used", orderId: order.id, userId, assignedAt: new Date() }
      }),
      prisma.steamAccount.update({
        where: { id: availableSteamAccount.id },
        data: { status: "assigned", orderId: order.id }
      })
    ]);

    return NextResponse.json({ message: "Free offer claimed successfully!" });
  } catch (error) {
    console.error("POST /api/redeem-free-offer error:", error);
    return NextResponse.json({ error: "Failed to claim free offer." }, { status: 500 });
  }
}
