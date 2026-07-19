"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full text-[#fb923c] text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">Service</span>
            </h1>
          </div>

          <div className="space-y-8 text-[#94a3b8] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using PlayVault, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Account Registration</h2>
              <p>You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Purchases and Digital Goods</h2>
              <p>All game keys and Steam account credentials are digital goods. Once activation keys are revealed or Steam credentials are accessed, no refunds will be issued. Prices are displayed in Sri Lankan Rupees (LKR) unless stated otherwise.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Steam Account Usage</h2>
              <p>Steam accounts provided for game access are shared accounts. You must not change the password or email, disable Remote Play, disable Cloud Saves, or use the account in any way that disrupts service for other users. Violation of these rules may result in account termination without refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Payment Verification</h2>
              <p>All payments are manually verified. Providing false or fraudulent payment proof will result in permanent account ban. Verification typically takes 1-4 hours during business hours.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p>PlayVault is not liable for any issues arising from the use of purchased game keys or Steam accounts beyond our control, including but not limited to game publisher actions, Steam platform changes, or regional restrictions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
