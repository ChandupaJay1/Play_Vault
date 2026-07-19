"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  Copy,
  Check,
  Upload,
  ExternalLink,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Gamepad2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Game {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  price: number;
  platform: string;
}

interface ActivationKeyData {
  id: string;
  key: string;
  status: string;
}

interface Order {
  id: string;
  gameId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentProof: string | null;
  transactionId: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  game: Game;
  key: ActivationKeyData | null;
}

type OrderStatus =
  | "pending"
  | "payment_submitted"
  | "approved"
  | "completed"
  | "rejected";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400/20",
    icon: Clock,
  },
  payment_submitted: {
    label: "Payment Submitted",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
    icon: FileText,
  },
  approved: {
    label: "Approved",
    color: "text-green-400",
    bgColor: "bg-green-400/10 border-green-400/20",
    icon: Check,
  },
  completed: {
    label: "Completed",
    color: "text-[#eab308]",
    bgColor: "bg-[#eab308]/10 border-[#eab308]/20",
    icon: Check,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config =
    statusConfig[status as OrderStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function MaskedKey({ orderId }: { orderId: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyData, setKeyData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKey = useCallback(async () => {
    if (keyData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch key");
      const data = await res.json();
      setKeyData(data.key?.key || null);
    } catch {
      toast.error("Failed to load activation key");
    } finally {
      setLoading(false);
    }
  }, [orderId, keyData]);

  const handleReveal = async () => {
    if (!revealed) {
      await fetchKey();
    }
    setRevealed(!revealed);
  };

  const handleCopy = async () => {
    if (!keyData) return;
    try {
      await navigator.clipboard.writeText(keyData);
      setCopied(true);
      toast.success("Key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy key");
    }
  };

  const displayKey = keyData
    ? revealed
      ? keyData
      : `${keyData.substring(0, 5)}${"*".repeat(Math.max(0, keyData.length - 5))}`
    : "••••••••-••••-••••-••••-••••••••••••";

  return (
    <div className="mt-4 space-y-3">
      <div className="bg-[#0a0a1a] rounded-lg p-4 border border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Activation Key
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 font-mono text-sm text-[#eab308] break-all">
            {loading ? "Loading..." : displayKey}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleReveal}
              className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title={revealed ? "Hide key" : "Reveal key"}
            >
              {revealed ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Copy key"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#f97316]/5 rounded-lg p-4 border border-[#f97316]/10">
        <p className="text-xs font-medium text-[#f97316] uppercase tracking-wider mb-2">
          How to redeem on Steam
        </p>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Open Steam and click &quot;Games&quot; in the top menu</li>
          <li>Select &quot;Activate a Product on Steam&quot;</li>
          <li>Click &quot;Next&quot; and accept the subscriber agreement</li>
          <li>Enter your activation key and click &quot;Next&quot;</li>
          <li>The game will be added to your library</li>
        </ol>
      </div>
    </div>
  );
}

function UploadPaymentModal({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a payment proof file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("paymentProof", file);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionId", transactionId);

      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload payment proof");
      }

      toast.success("Payment proof uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload payment proof"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#111127] rounded-xl border border-white/10 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Upload Payment Proof
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f97316]"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Transaction ID (optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN123456789"
              className="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#f97316]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Payment Proof
            </label>
            <div className="relative border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-[#f97316]/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-sm text-white">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);

  const handlePaymentSuccess = async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentOrder(data);
      }
    } catch {
      // silent fail - order state is fine
    }
  };

  const orderDate = new Date(currentOrder.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const showKey =
    currentOrder.status === "approved" || currentOrder.status === "completed";
  const showUploadButton = currentOrder.status === "pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
    >
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#0a0a1a] shrink-0">
            {currentOrder.game.imageUrl ? (
              <img
                src={currentOrder.game.imageUrl}
                alt={currentOrder.game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-gray-700" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold truncate">
                  {currentOrder.game.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {currentOrder.game.platform} &middot; {orderDate}
                </p>
              </div>
              <StatusBadge status={currentOrder.status} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-lg font-bold text-white">
                Rs. {currentOrder.totalAmount.toFixed(2)}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Details
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="text-gray-300 font-mono text-xs">
                      {currentOrder.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p className="text-gray-300">
                      {currentOrder.paymentMethod || "Not specified"}
                    </p>
                  </div>
                  {currentOrder.transactionId && (
                    <div>
                      <p className="text-gray-500">Transaction ID</p>
                      <p className="text-gray-300 font-mono text-xs">
                        {currentOrder.transactionId}
                      </p>
                    </div>
                  )}
                </div>

                {currentOrder.status === "pending" && (
                  <div className="bg-yellow-400/5 rounded-lg p-4 border border-yellow-400/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-400 font-medium">
                          Waiting for payment verification
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Please upload your payment proof to expedite the
                          verification process.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] hover:bg-[#f97316]/20 text-sm font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Payment Proof
                    </button>
                  </div>
                )}

                {currentOrder.status === "payment_submitted" && (
                  <div className="bg-blue-400/5 rounded-lg p-4 border border-blue-400/10">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-400 font-medium">
                          Payment under review
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Our team is verifying your payment. This usually takes
                          1-24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentOrder.status === "rejected" && (
                  <div className="bg-red-400/5 rounded-lg p-4 border border-red-400/10">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-400 font-medium">
                          Order rejected
                        </p>
                        {currentOrder.adminNote && (
                          <p className="text-xs text-gray-400 mt-1">
                            Reason: {currentOrder.adminNote}
                          </p>
                        )}
                        <a
                          href="mailto:support@playvault.com"
                           className="inline-flex items-center gap-1 mt-2 text-xs text-[#eab308] hover:underline"
                        >
                          Contact Support
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {showKey && <MaskedKey orderId={currentOrder.id} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <UploadPaymentModal
            orderId={currentOrder.id}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#111127] rounded-xl border border-white/5 p-5 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-white/5 rounded w-1/3" />
              <div className="h-4 bg-white/5 rounded w-1/4" />
              <div className="h-6 bg-white/5 rounded w-1/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [status]);

  if (status === "loading" || loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-[#f97316] text-white text-sm hover:bg-[#ea580c] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500 mb-6">
            Browse our collection and grab your favorite games
          </p>
          <a
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white font-medium transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            Browse Games
          </a>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
