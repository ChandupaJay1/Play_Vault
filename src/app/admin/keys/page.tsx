"use client";

import { useEffect, useState, useMemo } from "react";
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
  Gamepad2,
  Layers,
  List,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/StatusBadge";

interface Game {
  id: string;
  title: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
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
  const [modalMode, setModalMode] = useState<"paste" | "generate">("generate");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [keysInput, setKeysInput] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [pasteMultiplier, setPasteMultiplier] = useState(1);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters & View Mode
  const [filterGame, setFilterGame] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [collapsedGames, setCollapsedGames] = useState<Record<string, boolean>>({});

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [keysData, gamesData] = await Promise.all([
        fetch("/api/admin/keys").then((r) => r.json()),
        fetch("/api/games").then((r) => r.json()),
      ]);
      setKeys(Array.isArray(keysData) ? keysData : []);
      setGames(Array.isArray(gamesData) ? gamesData : []);
    } catch {
      toast.error("Failed to load activation keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (filterGame && k.gameId !== filterGame) return false;
      if (filterStatus && k.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchKey = k.key.toLowerCase().includes(q);
        const matchGame = k.game?.title?.toLowerCase().includes(q);
        if (!matchKey && !matchGame) return false;
      }
      return true;
    });
  }, [keys, filterGame, filterStatus, searchQuery]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = keys.length;
    const available = keys.filter((k) => k.status === "available").length;
    const assigned = keys.filter((k) => k.status === "assigned").length;
    const used = keys.filter((k) => k.status === "used").length;
    return { total, available, assigned, used };
  }, [keys]);

  // Grouped by Game
  const gameGroups = useMemo(() => {
    const gameMap = new Map<string, { game: Game; available: number; assigned: number; used: number; total: number }>();

    // First initialize from games list
    games.forEach((g) => {
      gameMap.set(g.id, {
        game: g,
        available: 0,
        assigned: 0,
        used: 0,
        total: 0,
      });
    });

    // Populate keys counts
    keys.forEach((k) => {
      let group = gameMap.get(k.gameId);
      if (!group) {
        group = {
          game: k.game || { id: k.gameId, title: "Unknown Game" },
          available: 0,
          assigned: 0,
          used: 0,
          total: 0,
        };
        gameMap.set(k.gameId, group);
      }
      group.total += 1;
      if (k.status === "available") group.available += 1;
      if (k.status === "assigned") group.assigned += 1;
      if (k.status === "used") group.used += 1;
    });

    const list: {
      game: Game;
      available: number;
      assigned: number;
      used: number;
      total: number;
      filteredKeys: ActivationKey[];
    }[] = [];

    gameMap.forEach((group) => {
      if (filterGame && group.game.id !== filterGame) return;

      const matchingFromFiltered = filteredKeys.filter((k) => k.gameId === group.game.id);

      if (group.total > 0 || filterGame === group.game.id) {
        list.push({
          ...group,
          filteredKeys: matchingFromFiltered,
        });
      }
    });

    return list.sort((a, b) => b.available - a.available || b.total - a.total);
  }, [games, keys, filterGame, filteredKeys]);

  const toggleGameCollapse = (gameId: string) => {
    setCollapsedGames((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "-****-" + key.slice(-4);
  };

  const handleCopyKey = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success("Key copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAddModal = (gameId?: string) => {
    if (gameId) {
      setSelectedGameId(gameId);
    } else if (games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].id);
    }
    setModalMode("generate");
    setShowModal(true);
  };

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
        toast.success(data.message || "Keys generated successfully!");
        if (data.keys) {
          navigator.clipboard.writeText(data.keys.join("\n"));
          toast.success("Keys copied to clipboard!", { duration: 3000 });
        }
        setShowModal(false);
        setGenerateCount(5);
        await fetchAll();
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
      .filter((k) => k.length > 0)
      .flatMap((k) => Array(pasteMultiplier).fill(k));

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
      toast.success(data.message || "Keys added successfully!");
      setShowModal(false);
      setKeysInput("");
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add keys");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activation key?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/keys?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete key");
      }

      toast.success("Key deleted");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete key");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            Activation Keys
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Game-wise categorized inventory and digital key delivery management
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#05050a] border border-[#272836] rounded-lg p-1">
            <button
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "grouped"
                  ? "bg-[#f97316] text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Game-wise Categorized View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Game Wise</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-[#f97316] text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Flat Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>All Keys</span>
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#f97316]/20 shrink-0"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate / Add Keys</span>
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Total Keys
            </span>
            <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
            <p className="text-xs text-text-muted mt-0.5">Across all games</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Available
            </span>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.available}</p>
            <p className="text-xs text-green-500/80 mt-0.5">Ready for instant delivery</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Assigned
            </span>
            <p className="text-2xl font-bold text-[#f97316] mt-1">{stats.assigned}</p>
            <p className="text-xs text-[#f97316]/80 mt-0.5">In pending orders</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Used / Redeemed
            </span>
            <p className="text-2xl font-bold text-gray-400 mt-1">{stats.used}</p>
            <p className="text-xs text-gray-500 mt-0.5">Claimed by players</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-400">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Game-Wise Category Stock Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#f97316]" />
            Game Keys Inventory
          </h2>
          <span className="text-xs text-text-muted">
            {gameGroups.length} {gameGroups.length === 1 ? "game" : "games"} in stock
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* All Games Pill Card */}
          <div
            onClick={() => setFilterGame("")}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              filterGame === ""
                ? "bg-[#f97316]/10 border-[#f97316]/40 shadow-sm"
                : "bg-[#0f1019] border-[#272836] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-primary">All Games</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                {stats.total} total
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-medium text-green-400">
                {stats.available} Available
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-medium text-[#f97316]">
                {stats.assigned + stats.used} Claimed
              </span>
            </div>
          </div>

          {/* Individual Game Stock Cards */}
          {gameGroups.map((g) => {
            const isSelected = filterGame === g.game.id;
            const availablePercent = g.total > 0 ? (g.available / g.total) * 100 : 0;

            return (
              <div
                key={g.game.id}
                onClick={() => setFilterGame(filterGame === g.game.id ? "" : g.game.id)}
                className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#f97316]/10 border-[#f97316]/50 shadow-md ring-1 ring-[#f97316]/30"
                    : "bg-[#0f1019] border-[#272836] hover:border-[#f97316]/30 hover:bg-[#141522]"
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#05050a] border border-[#272836] shrink-0 overflow-hidden flex items-center justify-center">
                      {g.game.imageUrl ? (
                        <img
                          src={g.game.imageUrl}
                          alt={g.game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary truncate" title={g.game.title}>
                        {g.game.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            g.available > 0
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${g.available > 0 ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                          {g.available} Available
                        </span>
                        {(g.assigned > 0 || g.used > 0) && (
                          <span className="text-xs text-text-muted">
                            ({g.assigned + g.used} used)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock ratio bar */}
                <div className="mt-3 pt-2 border-t border-[#272836]/60">
                  <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                    <span>Stock Ratio</span>
                    <span>{g.available} / {g.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#05050a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${availablePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search keys by key code or game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1019] border border-[#272836] rounded-lg text-text-primary text-sm focus:border-[#f97316] outline-none placeholder:text-text-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Game */}
        <div className="min-w-[180px]">
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f1019] border border-[#272836] rounded-lg text-text-primary text-sm outline-none focus:border-[#f97316]"
          >
            <option value="">All Games ({keys.length} keys)</option>
            {games.map((g) => {
              const count = keys.filter((k) => k.gameId === g.id && k.status === "available").length;
              return (
                <option key={g.id} value={g.id}>
                  {g.title} ({count} available)
                </option>
              );
            })}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[#0f1019] border border-[#272836] rounded-lg text-text-primary text-sm outline-none focus:border-[#f97316]"
          >
            <option value="">All Status</option>
            <option value="available">Available Only</option>
            <option value="assigned">Assigned Only</option>
            <option value="used">Used / Redeemed Only</option>
          </select>
        </div>

        {(filterGame || filterStatus || searchQuery) && (
          <button
            onClick={() => {
              setFilterGame("");
              setFilterStatus("");
              setSearchQuery("");
            }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:text-white text-xs transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-[#0f1019] border border-[#272836] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-text-muted">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No Activation Keys Found</h3>
          <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
            {filterGame || filterStatus || searchQuery
              ? "No keys match the selected filters. Try clearing filters or selecting another game."
              : "You haven't added any keys yet. Click 'Generate / Add Keys' to populate your stock."}
          </p>
          <button
            onClick={() => openAddModal(filterGame || undefined)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white text-sm font-medium rounded-lg hover:bg-[#ea580c] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Activation Keys
          </button>
        </div>
      ) : viewMode === "grouped" ? (
        /* GAME-WISE CATEGORIZED VIEW */
        <div className="space-y-4">
          {gameGroups.map((group) => {
            const isCollapsed = collapsedGames[group.game.id] ?? false;
            const groupKeys = group.filteredKeys;

            if (groupKeys.length === 0 && (filterGame || filterStatus || searchQuery)) {
              return null;
            }

            return (
              <motion.div
                key={group.game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden shadow-sm"
              >
                {/* Game Category Header */}
                <div className="px-5 py-4 bg-[#12131f] border-b border-[#272836] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    onClick={() => toggleGameCollapse(group.game.id)}
                    className="flex items-center gap-3.5 cursor-pointer select-none flex-1 min-w-0"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#05050a] border border-[#272836] overflow-hidden shrink-0 flex items-center justify-center">
                      {group.game.imageUrl ? (
                        <img
                          src={group.game.imageUrl}
                          alt={group.game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-text-primary truncate">
                          {group.game.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-muted">
                          Key Stock
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          {group.available} Available
                        </span>
                        {group.assigned > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30">
                            {group.assigned} Assigned
                          </span>
                        )}
                        {group.used > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                            {group.used} Redeemed
                          </span>
                        )}
                        <span className="text-xs text-text-muted">
                          • {group.total} Total Keys
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openAddModal(group.game.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f97316]/10 border border-[#f97316]/30 hover:bg-[#f97316]/20 text-[#fb923c] rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add / Generate</span>
                    </button>
                    <button
                      onClick={() => toggleGameCollapse(group.game.id)}
                      className="p-1.5 rounded-lg border border-[#272836] bg-[#05050a] text-text-muted hover:text-text-primary hover:bg-[#181926] transition-colors"
                      title={isCollapsed ? "Expand keys" : "Collapse keys"}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Keys Table for This Game */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    {groupKeys.length === 0 ? (
                      <div className="p-6 text-center text-text-muted text-sm">
                        No activation keys match the current filter for this game.
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#272836] bg-[#090a12]/50">
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Activation Key
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Status
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Assigned User / Order
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Added Date
                            </th>
                            <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#272836]/60">
                          {groupKeys.map((k) => (
                            <tr key={k.id} className="hover:bg-[#141522]/60 transition-colors">
                              {/* Key */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <Key className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                  <span
                                    className={`text-sm font-mono select-all ${
                                      k.status === "available"
                                        ? "text-green-400 font-semibold"
                                        : "text-text-secondary"
                                    }`}
                                  >
                                    {k.status === "available" ? k.key : maskKey(k.key)}
                                  </span>
                                  <button
                                    onClick={() => handleCopyKey(k.key, k.id)}
                                    className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-green-400 transition-colors"
                                    title="Copy Key"
                                  >
                                    {copiedId === k.id ? (
                                      <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3">
                                <StatusBadge status={k.status} />
                              </td>

                              {/* Assigned User / Order */}
                              <td className="px-5 py-3 text-sm text-text-secondary">
                                {k.userId ? (
                                  <span className="font-mono text-xs text-text-muted">
                                    User: {k.userId.slice(0, 8)}...
                                  </span>
                                ) : k.orderId ? (
                                  <span className="font-mono text-xs text-text-muted">
                                    Order: {k.orderId.slice(0, 8)}...
                                  </span>
                                ) : (
                                  <span className="text-text-muted text-xs">Unassigned</span>
                                )}
                              </td>

                              {/* Date */}
                              <td className="px-5 py-3 text-xs text-text-muted">
                                {new Date(k.createdAt).toLocaleDateString()}
                              </td>

                              {/* Action */}
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteKey(k.id)}
                                  disabled={deletingId === k.id}
                                  className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Delete Key"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* FLAT TABLE VIEW */
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#272836] bg-[#12131f]">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Game
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Activation Key
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Assigned Info
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Date Added
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272836]">
                {filteredKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#141522]/60 transition-colors">
                    {/* Game */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#05050a] border border-[#272836] overflow-hidden shrink-0 flex items-center justify-center">
                          {k.game?.imageUrl ? (
                            <img src={k.game.imageUrl} alt={k.game.title} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-3.5 h-3.5 text-text-muted" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{k.game?.title}</span>
                      </div>
                    </td>

                    {/* Key */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span
                          className={`text-sm font-mono select-all ${
                            k.status === "available" ? "text-green-400 font-semibold" : "text-text-secondary"
                          }`}
                        >
                          {k.status === "available" ? k.key : maskKey(k.key)}
                        </span>
                        <button
                          onClick={() => handleCopyKey(k.key, `flat-${k.id}`)}
                          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-green-400"
                          title="Copy Key"
                        >
                          {copiedId === `flat-${k.id}` ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <StatusBadge status={k.status} />
                    </td>

                    {/* Assigned */}
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {k.userId ? `User: ${k.userId.slice(0, 8)}...` : k.orderId ? `Order: ${k.orderId.slice(0, 8)}...` : "-"}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        disabled={deletingId === k.id}
                        className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Generate Keys Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f1019] border border-[#272836] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#272836] bg-[#12131f]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316]/20 to-[#eab308]/20 flex items-center justify-center text-[#f97316]">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">
                      {modalMode === "generate" ? "Auto-Generate Keys" : "Add Keys Manually"}
                    </h2>
                    <p className="text-xs text-text-muted">Populate digital key inventory</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Mode Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMode("generate")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-2 ${
                      modalMode === "generate"
                        ? "bg-[#f97316]/15 text-[#fb923c] border-[#f97316]/40 shadow-sm"
                        : "bg-[#05050a] text-text-muted border-[#272836] hover:text-text-primary hover:border-white/20"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Generate Keys</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("paste")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-2 ${
                      modalMode === "paste"
                        ? "bg-[#f97316]/15 text-[#fb923c] border-[#f97316]/40 shadow-sm"
                        : "bg-[#05050a] text-text-muted border-[#272836] hover:text-text-primary hover:border-white/20"
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>Paste Custom Keys</span>
                  </button>
                </div>

                {/* Target Game */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Target Game *
                  </label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:border-[#f97316] outline-none"
                  >
                    <option value="">Select a game</option>
                    {games.map((g) => {
                      const count = keys.filter((k) => k.gameId === g.id && k.status === "available").length;
                      return (
                        <option key={g.id} value={g.id}>
                          {g.title} (Currently {count} available)
                        </option>
                      );
                    })}
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
                      max={200}
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:border-[#f97316] outline-none"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                      Standard format 25-character activation keys (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX) will be generated and copied to your clipboard.
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
                      rows={6}
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY-YYYYY"
                      className="w-full px-3 py-2.5 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm font-mono placeholder:text-text-muted focus:border-[#f97316] outline-none resize-none"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                      {keysInput.split("\n").filter((l) => l.trim()).length} unique keys detected
                    </p>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Copies per key *
                      </label>
                      <select
                        value={pasteMultiplier}
                        onChange={(e) => setPasteMultiplier(parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm focus:border-[#f97316] outline-none"
                      >
                        <option value={1}>1 Copy (Default)</option>
                        <option value={5}>5 Copies</option>
                        <option value={10}>10 Copies</option>
                        <option value={15}>15 Copies</option>
                        <option value={20}>20 Copies</option>
                        <option value={25}>25 Copies</option>
                        <option value={30}>30 Copies</option>
                        <option value={40}>40 Copies</option>
                        <option value={50}>50 Copies</option>
                      </select>
                      <p className="text-xs text-text-muted mt-1.5">
                        Total to add: {keysInput.split("\n").filter((l) => l.trim()).length * pasteMultiplier}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#272836] bg-[#12131f]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#272836] text-text-secondary hover:text-text-primary hover:bg-[#181926] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddKeys}
                  disabled={adding || !selectedGameId}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {adding ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{modalMode === "generate" ? `Generate ${generateCount} Keys` : "Save Keys"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
