import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SETTINGS_KEY = "site_settings";

const defaultSettings = {
  general: {
    siteName: "PlayVault",
    siteDescription: "Your one-stop digital game store",
    contactEmail: "support@playvault.com",
  },
  payment: {
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    paymentInstructions: "",
  },
  store: {
    defaultCurrency: "LKR",
    taxRate: "0",
    minOrderAmount: "1",
  },
};

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) {
      return NextResponse.json(defaultSettings);
    }

    const parsed = JSON.parse(row.value);
    const settings = {
      general: { ...defaultSettings.general, ...parsed.general },
      payment: { ...defaultSettings.payment, ...parsed.payment },
      store: { ...defaultSettings.store, ...parsed.store },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(defaultSettings);
  }
}
