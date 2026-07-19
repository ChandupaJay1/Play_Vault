"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, CreditCard, Store, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

const STORAGE_KEY = "playvault_settings";

function loadSettings(): SiteSettings {
  return defaultSettings;
}

function saveSettings(_settings: SiteSettings) {
  // no-op: saving is handled by API
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}

function SectionCard({ title, icon, children, onSave, saving }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#272836]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316]/20 to-[#eab308]/20 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  helpText?: string;
}

function Field({ label, value, onChange, type = "text", placeholder, readOnly, helpText }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${
          readOnly
            ? "bg-[#181926] border border-[#272836] text-text-muted cursor-not-allowed"
            : "bg-[#05050a] border border-[#272836] text-text-primary focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 placeholder:text-text-muted"
        }`}
      />
      {helpText && (
        <p className="text-xs text-text-muted mt-1">{helpText}</p>
      )}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}

function FieldRow({ label, value, onChange, type = "text", placeholder, readOnly }: FieldRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <div className="sm:col-span-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${
            readOnly
              ? "bg-[#181926] border border-[#272836] text-text-muted cursor-not-allowed"
              : "bg-[#05050a] border border-[#272836] text-text-primary focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 placeholder:text-text-muted"
          }`}
        />
      </div>
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 outline-none transition-all resize-none"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setMounted(true);
      })
      .catch(() => {
        setMounted(true);
      });
  }, []);

  const update = (section: keyof SiteSettings, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async (section: keyof SiteSettings) => {
    setSavingSection(section);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.settings) {
        setSettings(data.settings);
      }
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSavingSection(null);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm mt-1">Configure your store settings</p>
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[#0f1019] border border-[#272836] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Configure your store settings
        </p>
      </div>

      <SectionCard
        title="General Settings"
        icon={<Globe className="w-4 h-4 text-[#f97316]" />}
        onSave={() => handleSave("general")}
        saving={savingSection === "general"}
      >
        <Field
          label="Site Name"
          value={settings.general.siteName}
          onChange={(v) => update("general", "siteName", v)}
          placeholder="PlayVault"
        />
        <Field
          label="Site Description"
          value={settings.general.siteDescription}
          onChange={(v) => update("general", "siteDescription", v)}
          placeholder="Your one-stop digital game store"
        />
        <Field
          label="Contact Email"
          type="email"
          value={settings.general.contactEmail}
          onChange={(v) => update("general", "contactEmail", v)}
          placeholder="support@playvault.com"
        />
      </SectionCard>

      <SectionCard
        title="Payment Settings"
        icon={<CreditCard className="w-4 h-4 text-[#eab308]" />}
        onSave={() => handleSave("payment")}
        saving={savingSection === "payment"}
      >
        <FieldRow
          label="Bank Name"
          value={settings.payment.bankName}
          onChange={(v) => update("payment", "bankName", v)}
          placeholder="e.g. State Bank of India"
        />
        <FieldRow
          label="Account Holder"
          value={settings.payment.accountHolder}
          onChange={(v) => update("payment", "accountHolder", v)}
          placeholder="Account holder name"
        />
        <FieldRow
          label="Account Number"
          value={settings.payment.accountNumber}
          onChange={(v) => update("payment", "accountNumber", v)}
          placeholder="Account number"
        />
        <FieldRow
          label="IFSC Code"
          value={settings.payment.ifscCode}
          onChange={(v) => update("payment", "ifscCode", v)}
          placeholder="e.g. SBIN0001234"
        />
        <FieldRow
          label="UPI ID"
          value={settings.payment.upiId}
          onChange={(v) => update("payment", "upiId", v)}
          placeholder="e.g. username@upi"
        />
        <TextareaField
          label="Payment Instructions"
          value={settings.payment.paymentInstructions}
          onChange={(v) => update("payment", "paymentInstructions", v)}
          placeholder="Instructions shown to users after placing an order..."
          rows={4}
        />
      </SectionCard>

      <SectionCard
        title="Store Settings"
        icon={<Store className="w-4 h-4 text-[#f97316]" />}
        onSave={() => handleSave("store")}
        saving={savingSection === "store"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Default Currency
            </label>
            <select
              value={settings.store.defaultCurrency}
              onChange={(e) => update("store", "defaultCurrency", e.target.value)}
              className="w-full px-3 py-2 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 outline-none transition-all"
            >
              <option value="LKR">LKR - Sri Lankan Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={settings.store.taxRate}
              onChange={(e) => update("store", "taxRate", e.target.value)}
              className="w-full px-3 py-2 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Min Order Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.store.minOrderAmount}
              onChange={(e) => update("store", "minOrderAmount", e.target.value)}
              className="w-full px-3 py-2 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/40 outline-none transition-all"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="SMTP / Email Settings"
        icon={<Mail className="w-4 h-4 text-[#eab308]" />}
        onSave={() => handleSave("smtp")}
        saving={savingSection === "smtp"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="SMTP Host"
            value={settings.smtp.smtpHost}
            onChange={(v) => update("smtp", "smtpHost", v)}
            placeholder="smtp.gmail.com"
          />
          <Field
            label="SMTP Port"
            value={settings.smtp.smtpPort}
            onChange={(v) => update("smtp", "smtpPort", v)}
            placeholder="587"
          />
        </div>
        <Field
          label="SMTP Username (read-only)"
          value={settings.smtp.smtpUser}
          onChange={() => {}}
          placeholder="Configured in environment"
          readOnly
          helpText="For security, SMTP credentials are managed via environment variables."
        />
        <div className="p-3 rounded-lg bg-[#eab308]/5 border border-[#eab308]/20">
          <p className="text-xs text-[#eab308]">
            SMTP password is stored securely in environment variables and cannot
            be edited here. Update <code className="font-mono bg-[#05050a] px-1 py-0.5 rounded">SMTP_PASSWORD</code> in
            your .env file.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
