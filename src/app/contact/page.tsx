"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, orderId, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

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
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
                Support
              </span>
            </h1>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              Have a question or need help? Our support team is ready to assist you.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="p-5 bg-[#0f1019] border border-[#272836] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-[#f97316] mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Email Us</h3>
              <p className="text-sm text-[#64748b]">support@playvault.com</p>
              <p className="text-xs text-[#64748b] mt-1">Response within 24 hours</p>
            </div>

            <div className="p-5 bg-[#0f1019] border border-[#272836] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#eab308]/10 flex items-center justify-center text-[#eab308] mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Live Chat</h3>
              <p className="text-sm text-[#64748b]">Available 10 AM - 10 PM IST</p>
              <p className="text-xs text-[#64748b] mt-1">Monday to Sunday</p>
            </div>

            <div className="p-5 bg-[#0f1019] border border-[#272836] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Order Issues?</h3>
              <p className="text-sm text-[#64748b]">Include your Order ID</p>
              <p className="text-xs text-[#64748b] mt-1">For faster resolution</p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="md:col-span-2"
          >
            {sent ? (
              <div className="p-12 bg-[#0f1019] border border-[#272836] rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName("");
                    setEmail("");
                    setSubject("");
                    setOrderId("");
                    setMessage("");
                  }}
                  className="px-6 py-2.5 bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg text-[#fb923c] text-sm font-medium hover:bg-[#f97316]/20 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 bg-[#0f1019] border border-[#272836] rounded-2xl space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-white placeholder-[#64748b] focus:border-[#f97316] transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-white placeholder-[#64748b] focus:border-[#f97316] transition-colors text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-white appearance-none cursor-pointer focus:border-[#f97316] transition-colors text-sm"
                    >
                      <option value="">Select a topic</option>
                      <option value="order-issue">Order Issue</option>
                      <option value="payment-help">Payment Help</option>
                      <option value="key-problem">Key Problem</option>
                      <option value="refund-request">Refund Request</option>
                      <option value="account-issue">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Order ID (optional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-white placeholder-[#64748b] focus:border-[#f97316] transition-colors text-sm"
                      placeholder="e.g. ord_abc123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-white placeholder-[#64748b] focus:border-[#f97316] transition-colors text-sm resize-none"
                    placeholder="Describe your issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300 disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
