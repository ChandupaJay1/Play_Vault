"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full text-[#fb923c] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">Policy</span>
            </h1>
          </div>

          <div className="space-y-8 text-[#94a3b8] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly: name, email address, phone number, payment proof images, and transaction IDs. We also collect usage data such as pages visited and actions taken on the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use your information to process orders, verify payments, deliver game keys and Steam credentials, communicate with you about orders, and improve our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage</h2>
              <p>Your data is stored securely using Turso (libSQL) database services. Payment proof images are stored securely and are only accessible to authorized admin personnel for verification purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
              <p>We do not sell, trade, or share your personal information with third parties except as required by law or to provide our services (e.g., payment verification).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
              <p>We retain your account and order information for as long as your account is active. You may request account deletion by contacting support.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
              <p>If you have any questions about this Privacy Policy, please contact us through our <a href="/contact" className="text-[#f97316] hover:underline">Contact page</a>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
