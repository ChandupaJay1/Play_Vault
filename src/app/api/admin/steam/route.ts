import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (gameId) where.gameId = gameId;
    if (status) where.status = status;

    const accounts = await prisma.steamAccount.findMany({
      where,
      include: { game: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("GET /api/admin/steam error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accounts, gameId, generate, count } = body;

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    let accountsToCreate: { email: string; password: string }[] = [];

    if (generate && count && count > 0) {
      for (let i = 0; i < count; i++) {
        const suffix = Math.random().toString(36).substring(2, 8);
        accountsToCreate.push({
          email: `steam_${suffix}@playvault.game`,
          password: `Pwd${Math.random().toString(36).substring(2, 10)}!`,
        });
      }
    } else if (accounts && Array.isArray(accounts) && accounts.length > 0) {
      accountsToCreate = accounts;
    } else {
      return NextResponse.json(
        { error: "Provide accounts array or generate with count" },
        { status: 400 }
      );
    }

    const created = await prisma.steamAccount.createMany({
      data: accountsToCreate.map((a) => ({
        email: a.email,
        password: a.password,
        gameId,
        status: "available",
      })),
    });

    return NextResponse.json({ message: `${created.count} Steam accounts added` }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/steam error:", error);
    return NextResponse.json({ error: "Failed to add accounts" }, { status: 500 });
  }
}
