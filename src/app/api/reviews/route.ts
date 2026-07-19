import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (gameId) where.gameId = gameId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        game: { select: { title: true, imageUrl: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { gameId, rating, comment } = body;

    if (!gameId || !rating || !comment) {
      return NextResponse.json({ error: "gameId, rating, and comment are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        userId,
        gameId,
        status: { in: ["approved", "completed"] },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "You can only review games you have purchased" },
        { status: 403 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this game" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: { userId, gameId, rating: Number(rating), comment },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
