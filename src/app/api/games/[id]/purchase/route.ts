import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ purchased: false });
    }

    const userId = (session.user as { id: string }).id;
    const { id: gameId } = await params;

    const order = await prisma.order.findFirst({
      where: {
        userId,
        gameId,
        status: { in: ["approved", "completed"] },
      },
      include: {
        key: { select: { id: true, key: true, status: true } },
        steamAccount: { select: { id: true, email: true, password: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ purchased: false });
    }

    return NextResponse.json({
      purchased: true,
      orderId: order.id,
      key: order.key?.key || null,
      keyStatus: order.key?.status || null,
      steam: order.steamAccount
        ? { email: order.steamAccount.email, password: order.steamAccount.password }
        : null,
    });
  } catch (error) {
    console.error("GET /api/games/[id]/purchase error:", error);
    return NextResponse.json({ purchased: false });
  }
}
