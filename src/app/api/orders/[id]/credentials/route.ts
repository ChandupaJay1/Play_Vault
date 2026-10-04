import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

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
      include: { key: true, steamAccount: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (role !== "admin" && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.key?.status !== "used") {
      return NextResponse.json({ error: "Game account is not unlocked yet." }, { status: 400 });
    }

    const steamAccount = order.steamAccount;
    if (!steamAccount) {
      return NextResponse.json(
        { error: "No Steam account found for this game. Please contact support." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      steam: {
        email: steamAccount.email,
        password: steamAccount.password,
      },
    });
  } catch (error) {
    console.error("GET /api/orders/[id]/credentials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}
