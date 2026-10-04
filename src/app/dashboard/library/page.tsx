"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Key,
  Mail,
  Lock,
  Copy,
  Check,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  XCircle,
  Library,
} from "lucide-react";
import toast from "react-hot-toast";

interface Game {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  platform: string;
}

interface Order {
  id: string;
  gameId: string;
  status: string;
  game: Game;
}

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

function UnlockModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
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
        throw new Error(data.error || "Failed to unlock account details");
      }

      const data = await res.json();
      setResult(data);
      toast.success("Account details unlocked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unlock account");
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
        className="bg-[#111127] rounded-xl border border-white/10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#f97316]" />
            Unlock Account Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!result && (
            <form onSubmit={handleRedeem} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={order.game.imageUrl}
                  alt={order.game.title}
                  className="w-16 h-16 rounded-lg object-cover bg-[#0a0a1a]"
                />
                <div>
                  <h4 className="text-white font-medium">{order.game.title}</h4>
                  <p className="text-sm text-gray-500">{order.game.platform}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activation Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-xl text-white font-mono text-center placeholder:text-gray-600 focus:outline-none focus:border-[#f97316] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can find your activation key in the My Orders section.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !key.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Unlock Details
                  </>
                )}
              </button>
            </form>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Unlocked Successfully!</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0a0a1a] rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Steam Email</p>
                      <p className="text-sm text-white font-mono">
                        {result.steam.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(result.steam.email, "email")}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0a0a1a] rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Steam Password</p>
                      <p className="text-sm text-white font-mono">
                        {showPassword
                          ? result.steam.password
                          : "•".repeat(result.steam.password.length)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(result.steam.password, "password")}
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

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchLibrary() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch library games");
        const data = await res.json();
        
        // Filter out games that aren't approved or completed yet
        const ownedGames = data.filter((o: Order) => 
          o.status === "approved" || o.status === "completed"
        );
        setOrders(ownedGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111127] rounded-xl border border-white/5 p-4 animate-pulse h-64" />
        ))}
      </div>
    );
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-[#f97316]" />
          My Library
        </h2>
        <span className="text-sm text-gray-500">
          {orders.length} Game{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-[#111127] rounded-xl border border-white/5"
        >
          <Gamepad2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Your library is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Games you purchase will appear here.
          </p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white font-medium transition-colors"
          >
            Go to Shop
          </a>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden group hover:border-[#f97316]/50 transition-all cursor-pointer flex flex-col"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-[#0a0a1a]">
                {order.game.imageUrl ? (
                  <img
                    src={order.game.imageUrl}
                    alt={order.game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full text-center py-2 bg-[#f97316] text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg">
                    <Key className="w-4 h-4" />
                    Unlock Details
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium truncate group-hover:text-[#f97316] transition-colors">
                  {order.game.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{order.game.platform}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <UnlockModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
