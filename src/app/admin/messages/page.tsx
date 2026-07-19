"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, User, Clock, Package } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  orderId: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const subjectLabels: Record<string, string> = {
  "order-issue": "Order Issue",
  "payment-help": "Payment Help",
  "key-problem": "Key Problem",
  "refund-request": "Refund Request",
  "account-issue": "Account Issue",
  other: "Other",
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Contact Messages</h1>
        <p className="text-text-muted text-sm mt-1">Messages submitted through the contact form</p>
      </div>

      <div className="card-gaming rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No messages yet</div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id} className="p-5 hover:bg-surface-hover/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent-primary-light" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-text-primary">{msg.name}</p>
                        <span className="text-xs text-text-muted">{msg.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary-light text-xs rounded font-medium">
                          {subjectLabels[msg.subject] || msg.subject}
                        </span>
                        {msg.orderId && (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Package className="w-3 h-3" />
                            {msg.orderId.slice(0, 12)}...
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
