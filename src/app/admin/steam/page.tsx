"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Mail,
  Search,
  X,
  Package,
  CheckCircle,
  Clock,
  Wand2,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/StatusBadge";

interface Game {
  id: string;
  title: string;
}

interface SteamAccount {
  id: string;
  email: string;
  password: string;
  gameId: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  game: Game;
}

export default function AdminSteamPage() {
  const [accounts, setAccounts] = useState<SteamAccount[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"paste" | "generate">("generate");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [accountsInput, setAccountsInput] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [adding, setAdding] = useState(false);
  const [filterGame, setFilterGame] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/steam").then((r) => r.json()),
      fetch("/api/games").then((r) => r.json()),
    ]).then(([accountsData, gamesData]) => {
      setAccounts(accountsData);
      setGames(gamesData);
      setLoading(false);
    });
  }, []);

  const filteredAccounts = accounts.filter((a) => {
    if (filterGame && a.gameId !== filterGame) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: accounts.length,
    available: accounts.filter((a) => a.status === "available").length,
    assigned: accounts.filter((a) => a.status === "assigned").length,
  };

  const handleAddAccounts = async () => {
    if (!selectedGameId) {
      toast.error("Please select a game");
      return;
    }

    setAdding(true);
    try {
      let body: Record<string, unknown>;

      if (modalMode === "generate") {
        body = { gameId: selectedGameId, generate: true, count: generateCount };
      } else {
        const lines = accountsInput
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        const parsed = lines.map((line) => {
          const [email, password] = line.split("|").map((s) => s.trim());
          return { email: email || "", password: password || "" };
        });
        body = { gameId: selectedGameId, accounts: parsed };
      }

      const res = await fetch("/api/admin/steam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add accounts");
      }

      toast.success("Steam accounts added!");
      setShowModal(false);
      setAccountsInput("");
      setSelectedGameId("");
      setGenerateCount(5);
      const fresh = await fetch("/api/admin/steam").then((r) => r.json());
      setAccounts(fresh);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Steam Accounts</h1>
          <p className="text-text-muted text-sm mt-1">Manage Steam accounts for game delivery</p>
        </div>
        <button
          onClick={() => { setModalMode("generate"); setShowModal(true); }}
          className="btn-gaming flex items-center gap-2 text-sm"
        >
          <Wand2 className="w-4 h-4" />
          <span>Add Accounts</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-blue-400" },
          { label: "Available", value: stats.available, color: "text-green-400" },
          { label: "Assigned", value: stats.assigned, color: "text-[#f97316]" },
        ].map((stat) => (
          <div key={stat.label} className="card-gaming rounded-xl p-4">
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{stat.label}</span>
            <p className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary text-sm appearance-none"
          >
            <option value="">All Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary text-sm"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
        </select>
      </div>

      <div className="card-gaming rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No Steam accounts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Password</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Game</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="text-sm font-mono text-text-secondary">{a.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-text-secondary">
                          {showPasswords[a.id] ? a.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(a.id)}
                          className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors"
                        >
                          {showPasswords[a.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary">{a.game.title}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Add Steam Accounts</h2>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalMode("generate")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      modalMode === "generate"
                        ? "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30"
                        : "text-text-muted border-border hover:text-text-primary"
                    }`}
                  >
                    <Wand2 className="w-4 h-4 inline mr-1.5" />
                    Auto-Generate
                  </button>
                  <button
                    onClick={() => setModalMode("paste")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      modalMode === "paste"
                        ? "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30"
                        : "text-text-muted border-border hover:text-text-primary"
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-1.5" />
                    Paste Accounts
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Game *</label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  >
                    <option value="">Select a game</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                {modalMode === "generate" ? (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Number of Accounts *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Auto-generated Steam accounts will be created
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Accounts (email | password, one per line) *
                    </label>
                    <textarea
                      value={accountsInput}
                      onChange={(e) => setAccountsInput(e.target.value)}
                      rows={8}
                      placeholder="steam_user1@email.com | Password123!&#10;steam_user2@email.com | Password456!"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm font-mono placeholder:text-text-muted resize-none"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      {accountsInput.split("\n").filter((l) => l.trim()).length} accounts entered
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAccounts}
                  disabled={adding || !selectedGameId}
                  className="btn-gaming text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{adding ? "Adding..." : "Add Accounts"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
