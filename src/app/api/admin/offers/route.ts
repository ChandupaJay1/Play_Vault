import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { steamAccounts: { where: { status: "available" } }, keys: { where: { status: "available" } } }
        }
      }
    });
    
    return NextResponse.json(games);
  } catch (error) {
    console.error("GET /api/admin/offers error:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, isFreeOffer } = body;

    if (!gameId || typeof isFreeOffer !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { isFreeOffer }
    });

    return NextResponse.json({
      message: isFreeOffer ? "Game applied as Free Offer!" : "Free Offer removed successfully.",
      game: updatedGame
    });
  } catch (error) {
    console.error("POST /api/admin/offers error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}
