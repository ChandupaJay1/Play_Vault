"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/StatusBadge";

interface Order {
  id: string;
  userId: string;
  gameId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentProof: string | null;
  transactionId: string | null;
  adminNote: string | null;
  createdAt: string;
  game: { title: string; imageUrl: string };
  user: { id: string; name: string; email: string };
  key?: { id: string; key: string } | null;
}

const statusTabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "payment_submitted", label: "Payment Submitted" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "completed", label: "Completed" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!cancelled) setOrders(data);
      } catch {
        toast.error("Failed to fetch orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    adminNote?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update order");
      }
      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o))
      );
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, ...updatedOrder } : prev
      );
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (orderId: string) => {
    updateOrderStatus(orderId, "approved");
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, "rejected", rejectNote || undefined);
    setRejectNote("");
  };

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, "completed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-text-muted text-sm mt-1">Manage customer orders</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-accent-primary/20 text-accent-primary-light border border-accent-primary/30"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover border border-transparent"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                {orders.filter((o) =>
                  tab.key === "all" ? true : o.status === tab.key
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card-gaming rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Game</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-primary">{order.user.name}</p>
                      <p className="text-xs text-text-muted">{order.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{order.game.title}</td>
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">
                      Rs. {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent-primary-light transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === "payment_submitted" && (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-green-400 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setRejectNote("");
                              }}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.status === "approved" && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-emerald-400 transition-colors disabled:opacity-50"
                            title="Mark Completed"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => { setSelectedOrder(null); setRejectNote(""); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Order Details</h2>
                <button
                  onClick={() => { setSelectedOrder(null); setRejectNote(""); }}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Order ID</p>
                    <p className="text-sm font-mono text-text-secondary">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Status</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Customer</p>
                    <p className="text-sm text-text-primary">{selectedOrder.user.name}</p>
                    <p className="text-xs text-text-muted">{selectedOrder.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Game</p>
                    <p className="text-sm text-text-primary">{selectedOrder.game.title}</p>
                    <p className="text-sm text-accent-primary-light font-medium">Rs. {selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                {selectedOrder.paymentMethod && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Payment Method</p>
                    <p className="text-sm text-text-secondary">{selectedOrder.paymentMethod}</p>
                  </div>
                )}
                {selectedOrder.transactionId && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-text-secondary">{selectedOrder.transactionId}</p>
                  </div>
                )}
                {selectedOrder.paymentProof && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Payment Proof</p>
                    <a
                      href={selectedOrder.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-accent-primary-light hover:underline"
                    >
                      View Proof <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <div className="mt-2 rounded-lg overflow-hidden border border-border">
                      <img
                        src={selectedOrder.paymentProof}
                        alt="Payment Proof"
                        className="w-full max-h-60 object-contain bg-background"
                      />
                    </div>
                  </div>
                )}
                {selectedOrder.adminNote && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Admin Note</p>
                    <p className="text-sm text-text-secondary">{selectedOrder.adminNote}</p>
                  </div>
                )}
                {selectedOrder.key && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 font-medium mb-1">Assigned Activation Key</p>
                    <p className="text-sm font-mono text-green-300 break-all">{selectedOrder.key.key}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-text-muted mb-1">Date</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedOrder.status === "pending" && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400">
                      Waiting for customer to submit payment proof.
                    </p>
                  </div>
                )}

                {selectedOrder.status === "payment_submitted" && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Rejection Note (optional)
                      </label>
                      <input
                        type="text"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedOrder.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(selectedOrder.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "approved" && (
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() => handleComplete(selectedOrder.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-sm font-medium disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      {actionLoading ? "Processing..." : "Mark as Completed"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
