"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Orders",
    question: "How long does payment verification take?",
    answer: "Payment verification typically takes 1-4 hours during business hours (10 AM - 10 PM IST). Orders placed outside business hours will be verified the next morning. You will receive an email notification once your payment is approved.",
  },
  {
    category: "Orders",
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order before the activation key is revealed. Once a key has been revealed or redeemed on Steam, cancellations and refunds are no longer possible. Contact support with your order ID to request a cancellation.",
  },
  {
    category: "Orders",
    question: "I uploaded the wrong payment proof. What should I do?",
    answer: "Contact our support team immediately with your order ID and the correct payment proof. If the order hasn't been processed yet, we can update the payment proof on your behalf.",
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We currently accept manual bank transfers and UPI payments. We are working on adding more payment options in the future. All payments are processed manually for maximum security.",
  },
  {
    category: "Payment",
    question: "Can I pay in installments?",
    answer: "No, we do not offer installment payments at this time. The full amount must be paid in a single transaction. We recommend checking our sale section for discounted games.",
  },
  {
    category: "Payment",
    question: "What if I sent the wrong amount?",
    answer: "If you sent less than the order amount, contact support and we will guide you on completing the payment. If you sent more, we will refund the excess amount within 3-5 business days.",
  },
  {
    category: "Keys",
    question: "What if my activation key doesn't work?",
    answer: "If your key doesn't work, first ensure you're redeeming it on the correct platform (Steam, Epic, etc.) and in the correct region. If the issue persists, contact support with your order ID and a screenshot of the error. We will investigate and provide a replacement if the key is found to be invalid.",
  },
  {
    category: "Keys",
    question: "Can I get a refund after revealing my key?",
    answer: "No, once an activation key has been revealed, it cannot be refunded. This is because the key may have been copied or used. Please make sure you want to use the key before clicking 'Reveal'.",
  },
  {
    category: "Keys",
    question: "My key says it's already redeemed. What do I do?",
    answer: "Contact our support team immediately with your order ID. We will investigate whether the key was compromised and provide a replacement if necessary. Do not share your key with anyone.",
  },
  {
    category: "Account",
    question: "Do I need an account to make a purchase?",
    answer: "Yes, you need to create a free account to make purchases. This allows us to track your orders, deliver activation keys, and provide customer support.",
  },
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "Click on 'Login' and then 'Forgot Password' link. Enter your registered email address and we will send you a password reset link. The link expires in 24 hours.",
  },
  {
    category: "General",
    question: "Are the game keys region-locked?",
    answer: "Some games may be region-locked. This information is displayed on the game's detail page before purchase. Please check the region restrictions carefully before buying. We are not responsible for keys that cannot be activated in your region.",
  },
  {
    category: "General",
    question: "Do you sell console games?",
    answer: "Currently, we only sell PC game keys. We may expand to console games in the future. Stay tuned for updates by following us on social media.",
  },
  {
    category: "General",
    question: "How do I contact support?",
    answer: "You can reach our support team through the Contact page or by emailing support@playvault.com. Include your order ID for faster assistance. We respond within 24 hours on business days.",
  },
];

const categories = ["All", "Orders", "Payment", "Keys", "Account", "General"];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#eab308]/10 border border-[#eab308]/20 rounded-full text-[#facc15] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              Find quick answers to common questions about orders, payments, and game keys.
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#0f1019] border border-[#272836] rounded-xl text-white placeholder-[#64748b] focus:border-[#f97316] transition-colors"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#f97316]/20 text-[#fb923c] border border-[#f97316]/30"
                  : "bg-[#0f1019] text-[#64748b] border border-[#272836] hover:text-white hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#272836]" />
              <p className="text-[#64748b]">No questions found. Try a different search term.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                className="bg-[#0f1019]/80 border border-[#272836] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm font-medium text-white">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748b] transition-transform duration-300 shrink-0 ml-2 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-[#272836]">
                        <p className="text-sm text-[#94a3b8] leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 p-8 bg-[#0f1019] border border-[#272836] rounded-2xl text-center"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
          <p className="text-[#64748b] text-sm mb-4">
            Our support team is here to help. We typically respond within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300 text-sm"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
