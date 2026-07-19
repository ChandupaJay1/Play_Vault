import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        category: true,
        keys: {
          where: { status: "available" },
          select: { id: true },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...game,
      availableKeyCount: game.keys.length,
      keys: undefined,
    });
  } catch (error) {
    console.error("GET /api/games/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
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

    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = await prisma.game.update({
      where: { id },
      data: body,
      include: { category: true },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error("PUT /api/games/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    await prisma.activationKey.deleteMany({ where: { gameId: id } });
    await prisma.order.deleteMany({ where: { gameId: id } });
    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ message: "Game deleted" });
  } catch (error) {
    console.error("DELETE /api/games/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
