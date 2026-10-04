import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const gamesCount = await prisma.game.count({
      where: { inStock: true },
    });

    const usersCount = await prisma.user.count({
      where: { role: "user" },
    });

    const reviews = await prisma.review.findMany({
      select: { rating: true },
    });
    
    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : "5.0";

    const keysDelivered = await prisma.activationKey.count({
      where: { status: { in: ["assigned", "used"] } },
    });

    return NextResponse.json({
      gamesAvailable: gamesCount,
      happyCustomers: usersCount,
      averageRating: `${averageRating}★`,
      keysDelivered: keysDelivered,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
