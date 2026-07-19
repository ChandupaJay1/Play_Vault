"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ShoppingCart,
  CreditCard,
  Key,
  Shield,
  Gamepad2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Clock,
  Ban,
  LogIn,
  MonitorOff,
  CloudOff,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface StepItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: string[];
  image: string;
  important?: string;
}

const playSteps: StepItem[] = [
  {
    id: 1,
    title: "Get Locked Code",
    icon: <Key className="w-5 h-5" />,
    image: "/images/GET LOCK CODE.jpg",
    content: [
      "Copy the code from the game page after purchase.",
      "Paste it into the game page to access the Steam credentials (Email & Password).",
    ],
  },
  {
    id: 2,
    title: "Login to Steam",
    icon: <LogIn className="w-5 h-5" />,
    image: "/images/login.jpg",
    content: [
      "Copy the credentials from the game page (Email & Password).",
      "Log in to the Steam client using these details.",
    ],
    important: "Do not change the password or email.",
  },
  {
    id: 3,
    title: "Disable Remote Play",
    icon: <MonitorOff className="w-5 h-5" />,
    image: "/images/HOW TO DISABLE (REMOTE PLAY).jpg",
    content: [
      "Go to Settings > Remote Play.",
      'Untick "Disable Remote Play".',
      "This prevents streaming conflicts.",
    ],
  },
  {
    id: 4,
    title: "Disable Cloud Saves",
    icon: <CloudOff className="w-5 h-5" />,
    image: "/images/HOW TO DISABLE (STEAM CLOUD).jpg",
    content: [
      "Go to Settings > Cloud.",
      'Untick "Disable Steam Cloud".',
      "This ensures your save files are kept local on your PC and don't overwrite others'.",
    ],
  },
  {
    id: 5,
    title: "Go Offline & Play",
    icon: <Wifi className="w-5 h-5" />,
    image: "/images/HOW TO PLAY (OFFLINE).jpg",
    content: [
      "Click Steam > Go Offline... in the top menu.",
      "Launch the game.",
      "You can now play indefinitely without interruptions!",
    ],
    important: "If the game has DRM (Denuvo), launch it Online the first time before going offline.",
  },
];

const guides = [
  {
    id: 1,
    title: "How to Browse & Buy Games",
    icon: <ShoppingCart className="w-5 h-5" />,
    content: [
      "Visit our Shop page to browse all available PC games.",
      "Use the search bar or category filters to find specific games.",
      "Click on any game to view details, pricing, and description.",
      'Click "Add to Cart" to add games to your shopping cart.',
      'You can also click "Buy Now" to skip directly to checkout.',
      "Review your cart and click 'Proceed to Checkout' when ready.",
    ],
  },
  {
    id: 2,
    title: "Payment Process (Manual Transfer)",
    icon: <CreditCard className="w-5 h-5" />,
    content: [
      "We accept manual bank transfers and UPI payments.",
      "After placing your order, you will see our payment details.",
      "Transfer the exact amount to the provided bank account or UPI ID.",
      "Take a screenshot or photo of the payment confirmation.",
      "Upload the payment proof in your Dashboard under 'My Orders'.",
      "Include your transaction/reference ID for faster verification.",
    ],
  },
  {
    id: 3,
    title: "Payment Verification & Approval",
    icon: <Clock className="w-5 h-5" />,
    content: [
      "After you upload payment proof, our team will review it.",
      "Verification typically takes 1-4 hours during business hours.",
      "You will receive a notification once your payment is verified.",
      "If there are any issues, we will contact you via email.",
      "Do NOT create duplicate orders for the same purchase.",
      "Check your spam folder if you don't see confirmation emails.",
    ],
  },
  {
    id: 4,
    title: "Receiving Your Activation Key",
    icon: <Key className="w-5 h-5" />,
    content: [
      "Once payment is approved, your activation key is instantly assigned.",
      "Go to Dashboard > My Orders to view your key.",
      "Keys are partially hidden by default for security.",
      "Click 'Reveal' to see the full activation key.",
      "Use the copy button to copy the key to your clipboard.",
      "Each key is single-use and can only be redeemed once.",
    ],
  },
  {
    id: 5,
    title: "Redeeming Your Key on Steam",
    icon: <Gamepad2 className="w-5 h-5" />,
    content: [
      "Open the Steam client on your PC and log in to your account.",
      'Click "Games" in the top menu bar.',
      'Select "Activate a Product on Steam..." from the dropdown.',
      "Click 'Next' and accept the Steam Subscriber Agreement.",
      "Paste your activation key into the product code field.",
      'Click "Next" to activate the game. It will be added to your library.',
    ],
  },
  {
    id: 6,
    title: "Important Security Tips",
    icon: <Shield className="w-5 h-5" />,
    content: [
      "Never share your activation key with anyone.",
      "Do not attempt to use the same key on multiple accounts.",
      "Keys are tied to your account once redeemed.",
      "Contact support immediately if you suspect key compromise.",
      "Always verify you are on playvault.com before entering credentials.",
      "Enable Steam Guard for additional account security.",
    ],
  },
];

export default function RulesPage() {
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [openGuide, setOpenGuide] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full text-[#fb923c] text-sm font-medium mb-6">
              <Gamepad2 className="w-4 h-4" />
              Player Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How to{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
                Play
              </span>
            </h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
              Follow these 5 simple steps to start playing your games instantly.
            </p>
          </motion.div>
        </div>

        {/* How to Play Steps */}
        <div className="space-y-4 mb-16">
          {playSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
              className="bg-[#0f1019]/80 border border-[#272836] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#f97316]/30"
            >
              <button
                onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {step.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#f97316]">{step.icon}</span>
                    <span className="text-sm font-semibold text-white">{step.title}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#64748b] transition-transform duration-300 shrink-0 ${
                    openStep === step.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openStep === step.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-[#272836]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          {step.content.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-[#94a3b8] leading-relaxed list-none">
                              <CheckCircle2 className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                          {step.important && (
                            <div className="flex items-start gap-3 text-sm text-[#eab308] leading-relaxed mt-3 p-3 bg-[#eab308]/5 border border-[#eab308]/20 rounded-lg">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              {step.important}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#272836]">
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Additional Guides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Additional Guides
          </h2>
        </div>

        <div className="space-y-3">
          {guides.map((guide, i) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
              className="bg-[#0f1019]/80 border border-[#272836] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/10"
            >
              <button
                onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[#f97316] shrink-0">
                    {guide.icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{guide.title}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#64748b] transition-transform duration-300 shrink-0 ${
                    openGuide === guide.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openGuide === guide.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-[#272836]">
                      <ul className="space-y-3">
                        {guide.content.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-[#94a3b8] leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Warning Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 p-6 bg-[#eab308]/5 border border-[#eab308]/20 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-[#eab308] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-[#eab308] mb-2">Important Notices</h3>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#eab308] mt-1">•</span>
                  All game keys are for PC platform only unless stated otherwise.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#eab308] mt-1">•</span>
                  Do NOT change the Steam account password or email — you will lose access.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#eab308] mt-1">•</span>
                  We are not responsible for keys redeemed on the wrong account.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#eab308] mt-1">•</span>
                  If the game has DRM (Denuvo), launch it Online the first time before going offline.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#eab308] mt-1">•</span>
                  Keep Steam in Offline Mode to avoid conflicts with other users on the same account.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-[#64748b] mb-4">Ready to start gaming?</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300"
          >
            <Gamepad2 className="w-5 h-5" />
            Browse Games
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
