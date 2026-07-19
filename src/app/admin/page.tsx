"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingCart,
  Gamepad2,
  DollarSign,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalGames: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    game: { title: string };
    user: { name: string; email: string };
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400" },
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "from-green-500/20 to-green-600/20", iconColor: "text-green-400" },
        { label: "Total Games", value: stats.totalGames, icon: Gamepad2, color: "from-orange-500/20 to-orange-600/20", iconColor: "text-orange-400" },
        { label: "Revenue", value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-yellow-500/20 to-yellow-600/20", iconColor: "text-yellow-400" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "from-orange-500/20 to-orange-600/20", iconColor: "text-orange-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview of your store</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/games"
            className="btn-gaming flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all text-sm font-medium"
          >
            <span>View Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="card-gaming rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-border rounded w-20 mb-3" />
              <div className="h-8 bg-border rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-gaming rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-gaming rounded-xl"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-border/50 rounded animate-pulse" />
              ))}
            </div>
          ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Game
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-text-secondary font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary">
                      {order.user.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {order.game.title}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary font-medium">
                      Rs. {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-text-muted">
              No orders yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
