import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalOrders,
      totalGames,
      pendingOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.game.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["approved", "completed"] } },
      }),
      prisma.order.findMany({
        take: 5,
        include: { game: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalGames,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      pendingOrders,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
