import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateActivationKey } from "@/lib/generateKey";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;
    const role = (session.user as { role?: string }).role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { game: true, key: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (role !== "admin" && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNote, keyId } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "approved") {
      const existingKey = await prisma.activationKey.findFirst({
        where: { orderId: id },
      });

      if (!existingKey) {
        const availableKey = await prisma.activationKey.findFirst({
          where: {
            gameId: order.gameId,
            status: "available",
          },
        });

        if (!availableKey) {
          return NextResponse.json(
            { error: "No available activation keys for this game" },
            { status: 400 }
          );
        }

        await prisma.activationKey.update({
          where: { id: availableKey.id },
          data: {
            status: "assigned",
            orderId: id,
            userId: order.userId,
            assignedAt: new Date(),
          },
        });

        const existingKeys = await prisma.activationKey.findMany({
          where: { gameId: order.gameId },
          select: { key: true },
        });
        const existingSet = new Set(existingKeys.map((k) => k.key));
        let newKey = generateActivationKey();
        let attempts = 0;
        while (existingSet.has(newKey) && attempts < 100) {
          newKey = generateActivationKey();
          attempts++;
        }

        await prisma.activationKey.create({
          data: {
            key: newKey,
            gameId: order.gameId,
            status: "available",
          },
        });
      }

      const existingSteam = await prisma.steamAccount.findFirst({
        where: { orderId: id },
      });

      if (!existingSteam) {
        const availableSteam = await prisma.steamAccount.findFirst({
          where: {
            gameId: order.gameId,
            status: "available",
          },
        });

        if (availableSteam) {
          await prisma.steamAccount.update({
            where: { id: availableSteam.id },
            data: {
              status: "assigned",
              orderId: id,
            },
          });
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(keyId && { keyId }),
      },
      include: { game: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
