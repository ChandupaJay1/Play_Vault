"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Key,
  Search,
  X,
  Package,
  CheckCircle,
  Clock,
  Ban,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/StatusBadge";

interface Game {
  id: string;
  title: string;
}

interface ActivationKey {
  id: string;
  key: string;
  gameId: string;
  status: string;
  orderId: string | null;
  userId: string | null;
  assignedAt: string | null;
  createdAt: string;
  game: Game;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"paste" | "generate">("paste");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [keysInput, setKeysInput] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [adding, setAdding] = useState(false);
  const [filterGame, setFilterGame] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/keys").then((r) => r.json()),
      fetch("/api/games").then((r) => r.json()),
    ]).then(([keysData, gamesData]) => {
      setKeys(keysData);
      setGames(gamesData);
      setLoading(false);
    });
  }, []);

  const filteredKeys = keys.filter((k) => {
    if (filterGame && k.gameId !== filterGame) return false;
    if (filterStatus && k.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: keys.length,
    available: keys.filter((k) => k.status === "available").length,
    assigned: keys.filter((k) => k.status === "assigned").length,
    used: keys.filter((k) => k.status === "used").length,
  };

  const gameStats = games.map((g) => ({
    ...g,
    available: keys.filter((k) => k.gameId === g.id && k.status === "available").length,
    total: keys.filter((k) => k.gameId === g.id).length,
  }));

  const handleAddKeys = async () => {
    if (!selectedGameId) {
      toast.error("Please select a game");
      return;
    }

    if (modalMode === "generate") {
      if (generateCount < 1) {
        toast.error("Enter at least 1 key to generate");
        return;
      }

      setAdding(true);
      try {
        const res = await fetch("/api/admin/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: selectedGameId, generate: true, count: generateCount }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate keys");
        }
        const data = await res.json();
        toast.success(data.message);
        if (data.keys) {
          navigator.clipboard.writeText(data.keys.join("\n"));
          toast.success("Keys copied to clipboard!", { duration: 3000 });
        }
        setShowModal(false);
        setGenerateCount(5);
        setSelectedGameId("");
        const freshKeys = await fetch("/api/admin/keys").then((r) => r.json());
        setKeys(freshKeys);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to generate keys");
      } finally {
        setAdding(false);
      }
      return;
    }

    if (!keysInput.trim()) {
      toast.error("Please enter at least one key");
      return;
    }

    const keysList = keysInput
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keysList.length === 0) {
      toast.error("Please enter at least one key");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: selectedGameId, keys: keysList }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add keys");
      }
      const data = await res.json();
      toast.success(data.message);
      setShowModal(false);
      setKeysInput("");
      setSelectedGameId("");
      const freshKeys = await fetch("/api/admin/keys").then((r) => r.json());
      setKeys(freshKeys);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add keys");
    } finally {
      setAdding(false);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "****" + key.slice(-4);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyKey = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success("Key copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activation Keys</h1>
          <p className="text-text-muted text-sm mt-1">Manage game activation keys</p>
        </div>
        <button
          onClick={() => { setModalMode("generate"); setShowModal(true); }}
          className="btn-gaming flex items-center gap-2 text-sm"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate Keys</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Keys", value: stats.total, icon: Package, color: "text-blue-400" },
          { label: "Available", value: stats.available, icon: CheckCircle, color: "text-green-400" },
          { label: "Assigned", value: stats.assigned, icon: Clock, color: "text-[#f97316]" },
          { label: "Used", value: stats.used, icon: Ban, color: "text-gray-400" },
        ].map((stat) => (
          <div key={stat.label} className="card-gaming rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card-gaming rounded-xl p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3">Keys Per Game</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gameStats.map((g) => (
            <div key={g.id} className="bg-background/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-text-primary font-medium truncate">{g.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-400">{g.available} available</span>
                <span className="text-xs text-text-muted">/ {g.total} total</span>
              </div>
            </div>
          ))}
          {gameStats.length === 0 && !loading && (
            <p className="text-sm text-text-muted col-span-full">No games found</p>
          )}
        </div>
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
          <option value="used">Used</option>
        </select>
      </div>

      <div className="card-gaming rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No keys found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Key</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Game</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Assigned User</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className={`text-sm font-mono ${k.status === "available" ? "text-green-400" : "text-text-secondary"}`}>
                          {k.status === "available" ? k.key : maskKey(k.key)}
                        </span>
                        {k.status === "available" && (
                          <button
                            onClick={() => handleCopyKey(k.key, k.id)}
                            className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-green-400 transition-colors"
                            title="Copy key"
                          >
                            {copiedId === k.id ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary">{k.game.title}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={k.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {k.userId ? k.userId.slice(0, 8) + "..." : "-"}
                    </td>
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(k.createdAt).toLocaleDateString()}
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
                <h2 className="text-lg font-semibold text-text-primary">
                  {modalMode === "generate" ? "Auto-Generate Keys" : "Add Keys Manually"}
                </h2>
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
                    <Key className="w-4 h-4 inline mr-1.5" />
                    Paste Keys
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
                      Number of Keys to Generate *
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
                      Unique keys will be auto-generated and copied to clipboard
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Keys (one per line) *
                    </label>
                    <textarea
                      value={keysInput}
                      onChange={(e) => setKeysInput(e.target.value)}
                      rows={8}
                      placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm font-mono placeholder:text-text-muted resize-none"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      {keysInput.split("\n").filter((k) => k.trim()).length} keys entered
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
                  onClick={handleAddKeys}
                  disabled={adding || !selectedGameId}
                  className="btn-gaming text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{adding ? "Processing..." : modalMode === "generate" ? "Generate Keys" : "Add Keys"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
