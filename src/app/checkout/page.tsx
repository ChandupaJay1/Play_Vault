"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Copy,
  Loader2,
  CreditCard,
  Gamepad2,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface PaymentSettings {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  paymentInstructions: string;
}

const defaultPayment: PaymentSettings = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  paymentInstructions: "Please transfer the exact amount to the provided bank account.",
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<{ id: string; gameTitle: string }[]>([]);
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState<PaymentSettings>(defaultPayment);

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.payment) setPayment(data.payment);
      })
      .catch(() => {});
  }, []);

  const total = getTotal();
  const reference = `PV-${Date.now().toString(36).toUpperCase()}`;

  const handlePlaceOrder = async () => {
    if (!session) {
      toast.error("Please sign in to place an order");
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    setLoading(true);
    const created: { id: string; gameTitle: string }[] = [];

    try {
      for (const item of items) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: item.gameId }),
        });

        if (res.ok) {
          const data = await res.json();
          created.push({ id: data.id, gameTitle: item.title });
        }
      }

      if (created.length > 0) {
        setOrders(created);
        setPlaced(true);
        clearCart();
        toast.success("Order(s) placed successfully!");
      } else {
        toast.error("Failed to place orders");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (placed) {
    return (
      <div className="min-h-screen py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#111127] border border-[#2a2a4a] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#10b981]/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#10b981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">Orders Placed!</h1>
            <p className="text-[#94a3b8] mb-8">
              Your order{orders.length > 1 ? "s have" : " has"} been created. Please complete the payment and upload proof.
            </p>

            <div className="bg-[#0a0a1a] border border-[#2a2a4a] rounded-xl p-6 mb-6 text-left">
              <h3 className="text-[#f1f5f9] font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#f97316]" />
                Payment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Bank:</span>
                  <span className="text-[#f1f5f9]">{payment.bankName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Account Name:</span>
                  <span className="text-[#f1f5f9]">{payment.accountHolder || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748b]">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#f1f5f9]">{payment.accountNumber || "N/A"}</span>
                    <button onClick={() => copyToClipboard(payment.accountNumber)} className="text-[#f97316] hover:text-[#fb923c]">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {payment.ifscCode && (
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">IFSC Code:</span>
                    <span className="text-[#f1f5f9]">{payment.ifscCode}</span>
                  </div>
                )}
                {payment.upiId && (
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">UPI ID:</span>
                    <span className="text-[#f1f5f9]">{payment.upiId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#64748b]">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#eab308] font-mono">{reference}</span>
                    <button onClick={() => copyToClipboard(reference)} className="text-[#f97316] hover:text-[#fb923c]">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a1a] border border-[#2a2a4a] rounded-xl p-4 mb-6 text-left">
              <p className="text-[#94a3b8] text-sm whitespace-pre-line">
                <span className="text-[#f59e0b] font-medium">Note:</span> {payment.paymentInstructions || "After transferring, upload your payment proof in your dashboard. Your keys will be delivered after verification."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 btn-gaming py-3 rounded-xl text-center"
              >
                <span className="relative z-10">Go to Dashboard</span>
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3 rounded-xl border border-[#2a2a4a] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#f97316] transition-all text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-8">Checkout</h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#2a2a4a]" />
            <h2 className="text-xl font-semibold text-[#f1f5f9] mb-2">Your cart is empty</h2>
            <p className="text-[#64748b] mb-6">Browse our collection and add some games!</p>
            <Link
              href="/shop"
              className="btn-gaming px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Games <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.gameId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="bg-[#111127] border border-[#2a2a4a] rounded-xl p-4 flex items-center gap-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-14 object-cover rounded-lg bg-[#0d0d24]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#f1f5f9] font-medium text-sm truncate">{item.title}</h3>
                      <p className="text-[#fb923c] font-bold">Rs. {item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.gameId);
                        toast.success("Removed from cart");
                      }}
                      className="p-2 text-[#64748b] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-[#111127] border border-[#2a2a4a] rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[#f1f5f9] mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748b]">Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                    <span className="text-[#f1f5f9]">Rs. {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748b]">Processing Fee</span>
                    <span className="text-[#10b981]">Free</span>
                  </div>
                  <div className="border-t border-[#2a2a4a] pt-3 flex justify-between">
                    <span className="text-[#f1f5f9] font-semibold">Total</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
                      Rs. {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full btn-gaming py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gamepad2 className="w-5 h-5" />}
                    {loading ? "Placing Order..." : "Place Order"}
                  </span>
                </button>

                {!session && (
                  <p className="text-center text-[#f59e0b] text-xs mt-3">
                    You&apos;ll need to sign in to complete your order
                  </p>
                )}

                <div className="mt-6 p-4 bg-[#0a0a1a] rounded-xl">
                  <h4 className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2">
                    How it works
                  </h4>
                  <ol className="space-y-2 text-[#64748b] text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f97316] font-bold">1.</span>
                      Place your order
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f97316] font-bold">2.</span>
                      Transfer payment to the provided account
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f97316] font-bold">3.</span>
                      Upload payment proof in your dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f97316] font-bold">4.</span>
                      Receive your game keys after verification!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
