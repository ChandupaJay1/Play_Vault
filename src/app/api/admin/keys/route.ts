import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateActivationKey } from "@/lib/generateKey";

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

    if (gameId) {
      where.gameId = gameId;
    }

    if (status) {
      where.status = status;
    }

    const keys = await prisma.activationKey.findMany({
      where,
      include: { game: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("GET /api/admin/keys error:", error);
    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keys, gameId, generate, count } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    let keysToCreate: string[] = [];

    if (generate && count && count > 0) {
      const existingKeys = await prisma.activationKey.findMany({
        where: { gameId },
        select: { key: true },
      });
      const existingSet = new Set(existingKeys.map((k) => k.key));

      while (keysToCreate.length < count) {
        const newKey = generateActivationKey();
        if (!existingSet.has(newKey)) {
          keysToCreate.push(newKey);
          existingSet.add(newKey);
        }
      }
    } else if (keys && Array.isArray(keys) && keys.length > 0) {
      keysToCreate = keys;
    } else {
      return NextResponse.json(
        { error: "Provide keys array or generate with count" },
        { status: 400 }
      );
    }

    const existingKeys = await prisma.activationKey.findMany({
      where: { gameId },
      select: { key: true },
    });
    const existingSet = new Set(existingKeys.map((k) => k.key));
    const uniqueKeys = keysToCreate.filter((k) => !existingSet.has(k));

    if (uniqueKeys.length === 0) {
      return NextResponse.json(
        { error: "All keys already exist" },
        { status: 400 }
      );
    }

    const created = await prisma.activationKey.createMany({
      data: uniqueKeys.map((key: string) => ({
        key,
        gameId,
        status: "available",
      })),
    });

    return NextResponse.json(
      { message: `${created.count} keys added successfully`, keys: generate ? keysToCreate : undefined },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/keys error:", error);
    return NextResponse.json(
      { error: "Failed to add keys" },
      { status: 500 }
    );
  }
}
