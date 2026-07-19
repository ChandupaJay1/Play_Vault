import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(
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

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("paymentProof") as File | null;
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const transactionId = formData.get("transactionId") as string | null;

    let paymentProofPath: string | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${file.name}`;
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      paymentProofPath = `/uploads/${fileName}`;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "payment_submitted",
        ...(paymentProofPath && { paymentProof: paymentProofPath }),
        ...(paymentMethod && { paymentMethod }),
        ...(transactionId && { transactionId }),
      },
      include: { game: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/orders/[id]/payment error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    );
  }
}
