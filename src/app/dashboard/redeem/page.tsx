"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Gamepad2,
  Mail,
  Lock,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface RedeemResult {
  game: {
    id: string;
    title: string;
    imageUrl: string;
  };
  steam: {
    email: string;
    password: string;
  };
}

export default function RedeemPage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      toast.error("Please enter your activation key");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to redeem key");
      }

      const data = await res.json();
      setResult(data);
      toast.success("Key redeemed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to redeem key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center">
                <Key className="w-8 h-8 text-[#f97316]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Redeem Activation Key
              </h1>
              <p className="text-gray-400 text-sm">
                Enter your activation key to get your Steam account credentials
              </p>
            </div>

            {!result && (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activation Key
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="PV-XXXXX-XXXXX-XXXXX"
                    className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white font-mono text-center text-lg placeholder:text-gray-600 focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !key.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Redeem Key
                    </>
                  )}
                </button>
              </form>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">
                    Key Verified Successfully!
                  </p>
                </div>

                <div className="bg-[#0a0a1a] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-4">
                    {result.game.imageUrl && (
                      <img
                        src={result.game.imageUrl}
                        alt={result.game.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Game
                      </p>
                      <h3 className="text-lg font-semibold text-white">
                        {result.game.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a1a] rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#eab308]" />
                    <h3 className="text-sm font-semibold text-white">
                      Steam Account Credentials
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#111127] rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Steam Email
                          </p>
                          <p className="text-sm text-white font-mono">
                            {result.steam.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(result.steam.email, "email")
                        }
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#111127] rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Steam Password
                          </p>
                          <p className="text-sm text-white font-mono">
                            {showPassword
                              ? result.steam.password
                              : "•".repeat(
                                  result.steam.password.length
                                )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleCopy(
                              result.steam.password,
                              "password"
                            )
                          }
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedField === "password" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f97316]/5 rounded-xl p-4 border border-[#f97316]/10">
                  <h4 className="text-sm font-medium text-[#f97316] mb-2">
                    How to access:
                  </h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Open Steam and click &quot;Sign In&quot;</li>
                    <li>Enter the email and password above</li>
                    <li>If asked for verification, check the email inbox</li>
                    <li>The game will be in your Steam library</li>
                  </ol>
                </div>

                <button
                  onClick={() => {
                    setResult(null);
                    setKey("");
                  }}
                  className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Redeem Another Key
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
