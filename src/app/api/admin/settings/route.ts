import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SETTINGS_KEY = "site_settings";

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
  };
  payment: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    paymentInstructions: string;
  };
  store: {
    defaultCurrency: string;
    taxRate: string;
    minOrderAmount: string;
  };
  smtp: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
  };
}

const defaultSettings: SiteSettings = {
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
  smtp: {
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
  },
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) {
      return NextResponse.json(defaultSettings);
    }

    const parsed = JSON.parse(row.value);
    const settings: SiteSettings = {
      general: { ...defaultSettings.general, ...parsed.general },
      payment: { ...defaultSettings.payment, ...parsed.payment },
      store: { ...defaultSettings.store, ...parsed.store },
      smtp: { ...defaultSettings.smtp, ...parsed.smtp },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const settings: SiteSettings = {
      general: {
        siteName: String(body.general?.siteName || defaultSettings.general.siteName),
        siteDescription: String(body.general?.siteDescription || defaultSettings.general.siteDescription),
        contactEmail: String(body.general?.contactEmail || defaultSettings.general.contactEmail),
      },
      payment: {
        bankName: String(body.payment?.bankName || ""),
        accountHolder: String(body.payment?.accountHolder || ""),
        accountNumber: String(body.payment?.accountNumber || ""),
        ifscCode: String(body.payment?.ifscCode || ""),
        upiId: String(body.payment?.upiId || ""),
        paymentInstructions: String(body.payment?.paymentInstructions || ""),
      },
      store: {
        defaultCurrency: String(body.store?.defaultCurrency || "LKR"),
        taxRate: String(body.store?.taxRate || "0"),
        minOrderAmount: String(body.store?.minOrderAmount || "1"),
      },
      smtp: {
        smtpHost: String(body.smtp?.smtpHost || ""),
        smtpPort: String(body.smtp?.smtpPort || "587"),
        smtpUser: String(body.smtp?.smtpUser || ""),
      },
    };

    await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(settings) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(settings) },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
