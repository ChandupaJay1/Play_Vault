"use client";

import { useEffect, useState, useMemo } from "react";
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
  Copy,
  Check,
  Gamepad2,
  Layers,
  List,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
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
  const [pasteMultiplier, setPasteMultiplier] = useState(1);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters & View Mode
  const [filterGame, setFilterGame] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [collapsedGames, setCollapsedGames] = useState<Record<string, boolean>>({});

  // Password & Copy state
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [accountsData, gamesData] = await Promise.all([
        fetch("/api/admin/steam").then((r) => r.json()),
        fetch("/api/games").then((r) => r.json()),
      ]);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setGames(Array.isArray(gamesData) ? gamesData : []);
    } catch {
      toast.error("Failed to load Steam accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (filterGame && a.gameId !== filterGame) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchEmail = a.email.toLowerCase().includes(q);
        const matchGame = a.game?.title?.toLowerCase().includes(q);
        if (!matchEmail && !matchGame) return false;
      }
      return true;
    });
  }, [accounts, filterGame, filterStatus, searchQuery]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = accounts.length;
    const available = accounts.filter((a) => a.status === "available").length;
    const assigned = accounts.filter((a) => a.status === "assigned").length;
    return { total, available, assigned };
  }, [accounts]);

  // Grouped by Game
  const gameGroups = useMemo(() => {
    // Collect all games that have accounts or are in games list
    const gameMap = new Map<string, { game: Game; accounts: SteamAccount[]; available: number; assigned: number; total: number }>();

    // First populate games with accounts
    games.forEach((g) => {
      gameMap.set(g.id, {
        game: g,
        accounts: [],
        available: 0,
        assigned: 0,
        total: 0,
      });
    });

    // Populate all accounts
    accounts.forEach((acc) => {
      let group = gameMap.get(acc.gameId);
      if (!group) {
        group = {
          game: acc.game || { id: acc.gameId, title: "Unknown Game" },
          accounts: [],
          available: 0,
          assigned: 0,
          total: 0,
        };
        gameMap.set(acc.gameId, group);
      }
      group.total += 1;
      if (acc.status === "available") group.available += 1;
      if (acc.status === "assigned") group.assigned += 1;
    });

    // Now filter accounts inside each group according to active filters
    const list: {
      game: Game;
      accounts: SteamAccount[];
      available: number;
      assigned: number;
      total: number;
      filteredAccounts: SteamAccount[];
    }[] = [];

    gameMap.forEach((group) => {
      // Only keep games matching filterGame if selected
      if (filterGame && group.game.id !== filterGame) return;

      const groupFiltered = group.accounts.filter((a) => {
        if (filterStatus && a.status !== filterStatus) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchEmail = a.email.toLowerCase().includes(q);
          const matchGame = group.game.title?.toLowerCase().includes(q);
          if (!matchEmail && !matchGame) return false;
        }
        return true;
      });

      // Filtered accounts assigned for this group from overall filteredAccounts
      const matchingFromFiltered = filteredAccounts.filter((a) => a.gameId === group.game.id);

      // Only show game if it has accounts or if user specifically searched/filtered or it has stock
      if (group.total > 0 || filterGame === group.game.id) {
        list.push({
          ...group,
          filteredAccounts: matchingFromFiltered,
        });
      }
    });

    // Sort by available count descending, then total
    return list.sort((a, b) => b.available - a.available || b.total - a.total);
  }, [games, accounts, filterGame, filterStatus, searchQuery, filteredAccounts]);

  const toggleGameCollapse = (gameId: string) => {
    setCollapsedGames((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, key: string, label = "Copied!") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(label);
    setTimeout(() => setCopiedKey(null), 2000);
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

  const handleAddAccounts = async () => {
    if (!selectedGameId) {
      toast.error("Please select a game");
      return;
    }

    setAdding(true);
    try {
      let body: Record<string, unknown>;

      if (modalMode === "generate") {
        if (generateCount < 1) {
          toast.error("Enter at least 1 account to generate");
          return;
        }
        body = { gameId: selectedGameId, generate: true, count: generateCount };
      } else {
        const lines = accountsInput
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        const parsed = lines.flatMap((line) => {
          const [email, password] = line.split("|").map((s) => s.trim());
          const acc = { email: email || "", password: password || "" };
          return Array(pasteMultiplier).fill(acc);
        });

        if (parsed.length === 0) {
          toast.error("Please enter at least one email | password pair");
          return;
        }

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

      const result = await res.json();
      toast.success(result.message || "Steam accounts added successfully!");
      setShowModal(false);
      setAccountsInput("");
      setGenerateCount(5);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add accounts");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Steam account?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/steam?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }

      toast.success("Account deleted");
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
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
            Steam Accounts
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Game-wise categorized inventory and Steam account delivery management
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
              <span>All Accounts</span>
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#f97316]/20 shrink-0"
          >
            <Wand2 className="w-4 h-4" />
            <span>Add Accounts</span>
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Total Accounts
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
              Available Accounts
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
              Assigned Accounts
            </span>
            <p className="text-2xl font-bold text-[#f97316] mt-1">{stats.assigned}</p>
            <p className="text-xs text-[#f97316]/80 mt-0.5">Delivered to customers</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316]">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Game-Wise Category Cards Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#f97316]" />
            Game Stock Overview
          </h2>
          <span className="text-xs text-text-muted">
            {gameGroups.length} {gameGroups.length === 1 ? "game" : "games"} with inventory
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
                {stats.assigned} Assigned
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
                        {g.assigned > 0 && (
                          <span className="text-xs text-text-muted">
                            ({g.assigned} assigned)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock bar */}
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
            placeholder="Search accounts by email or game..."
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
            <option value="">All Games ({accounts.length})</option>
            {games.map((g) => {
              const count = accounts.filter((a) => a.gameId === g.id && a.status === "available").length;
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
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-text-muted">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No Steam Accounts Found</h3>
          <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
            {filterGame || filterStatus || searchQuery
              ? "No accounts match the selected filters. Try clearing filters or searching for another game."
              : "You haven't added any Steam accounts yet. Click 'Add Accounts' to get started."}
          </p>
          <button
            onClick={() => openAddModal(filterGame || undefined)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white text-sm font-medium rounded-lg hover:bg-[#ea580c] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Steam Accounts
          </button>
        </div>
      ) : viewMode === "grouped" ? (
        /* GAME-WISE CATEGORIZED VIEW */
        <div className="space-y-4">
          {gameGroups.map((group) => {
            const isCollapsed = collapsedGames[group.game.id] ?? false;
            const groupAccounts = group.filteredAccounts;

            if (groupAccounts.length === 0 && (filterGame || filterStatus || searchQuery)) {
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
                          PC Steam
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
                        <span className="text-xs text-text-muted">
                          • {group.total} Total Stock
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
                      <span>Add Accounts</span>
                    </button>
                    <button
                      onClick={() => toggleGameCollapse(group.game.id)}
                      className="p-1.5 rounded-lg border border-[#272836] bg-[#05050a] text-text-muted hover:text-text-primary hover:bg-[#181926] transition-colors"
                      title={isCollapsed ? "Expand accounts" : "Collapse accounts"}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Accounts Table for This Game */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    {groupAccounts.length === 0 ? (
                      <div className="p-6 text-center text-text-muted text-sm">
                        No accounts match the current filter for this game.
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#272836] bg-[#090a12]/50">
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Steam Login (Email / Username)
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Password
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Quick Copy
                            </th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                              Status
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
                          {groupAccounts.map((a) => (
                            <tr key={a.id} className="hover:bg-[#141522]/60 transition-colors">
                              {/* Email */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                  <span className="text-sm font-mono text-text-primary select-all">
                                    {a.email}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(a.email, `email-${a.id}`, "Email copied!")}
                                    className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-[#f97316] transition-colors"
                                    title="Copy Email"
                                  >
                                    {copiedKey === `email-${a.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Password */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-text-secondary select-all">
                                    {showPasswords[a.id] ? a.password : "••••••••"}
                                  </span>
                                  <button
                                    onClick={() => togglePassword(a.id)}
                                    className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                                    title={showPasswords[a.id] ? "Hide password" : "Show password"}
                                  >
                                    {showPasswords[a.id] ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(a.password, `pwd-${a.id}`, "Password copied!")}
                                    className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-[#f97316] transition-colors"
                                    title="Copy Password"
                                  >
                                    {copiedKey === `pwd-${a.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Quick Copy Credentials */}
                              <td className="px-5 py-3">
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      `${a.email} | ${a.password}`,
                                      `combo-${a.id}`,
                                      "Credentials copied (email | password)!"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#05050a] border border-[#272836] hover:border-[#f97316]/50 text-xs text-text-muted hover:text-text-primary transition-colors font-mono"
                                >
                                  {copiedKey === `combo-${a.id}` ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>email | password</span>
                                </button>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3">
                                <StatusBadge status={a.status} />
                              </td>

                              {/* Date */}
                              <td className="px-5 py-3 text-xs text-text-muted">
                                {new Date(a.createdAt).toLocaleDateString()}
                              </td>

                              {/* Action */}
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteAccount(a.id)}
                                  disabled={deletingId === a.id}
                                  className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Delete Account"
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
        /* FLAT TABLE VIEW (All Accounts across games) */
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#272836] bg-[#12131f]">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Game
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Steam Email / Username
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Password
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Quick Copy
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Status
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
                {filteredAccounts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#141522]/60 transition-colors">
                    {/* Game */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#05050a] border border-[#272836] overflow-hidden shrink-0 flex items-center justify-center">
                          {a.game?.imageUrl ? (
                            <img src={a.game.imageUrl} alt={a.game.title} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-3.5 h-3.5 text-text-muted" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{a.game?.title}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="text-sm font-mono text-text-secondary select-all">{a.email}</span>
                        <button
                          onClick={() => copyToClipboard(a.email, `email-flat-${a.id}`)}
                          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                          title="Copy Email"
                        >
                          {copiedKey === `email-flat-${a.id}` ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Password */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-text-secondary select-all">
                          {showPasswords[a.id] ? a.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(a.id)}
                          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                        >
                          {showPasswords[a.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(a.password, `pwd-flat-${a.id}`)}
                          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
                          title="Copy Password"
                        >
                          {copiedKey === `pwd-flat-${a.id}` ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Quick copy */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${a.email} | ${a.password}`,
                            `combo-flat-${a.id}`,
                            "Credentials copied!"
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#05050a] border border-[#272836] hover:border-[#f97316]/50 text-xs text-text-muted hover:text-text-primary font-mono"
                      >
                        {copiedKey === `combo-flat-${a.id}` ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>combo</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteAccount(a.id)}
                        disabled={deletingId === a.id}
                        className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete Account"
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

      {/* Add Steam Accounts Modal */}
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
                    <h2 className="text-base font-semibold text-text-primary">Add Steam Accounts</h2>
                    <p className="text-xs text-text-muted">Populate stock for game delivery</p>
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
                    <span>Auto-Generate Accounts</span>
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
                    <Mail className="w-4 h-4" />
                    <span>Paste Custom Accounts</span>
                  </button>
                </div>

                {/* Game Selection */}
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
                      const count = accounts.filter((a) => a.gameId === g.id && a.status === "available").length;
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
                      Number of Accounts to Generate *
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
                      Randomized, secure Steam login credentials will be generated and instantly assigned to stock.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Accounts (Format: <code className="font-mono text-[#fb923c]">email | password</code>, one per line) *
                    </label>
                    <textarea
                      value={accountsInput}
                      onChange={(e) => setAccountsInput(e.target.value)}
                      rows={6}
                      placeholder="steam_user1@email.com | SecretPassword123!&#10;steam_user2@email.com | AnotherPass456!"
                      className="w-full px-3 py-2.5 bg-[#05050a] border border-[#272836] rounded-lg text-text-primary text-sm font-mono placeholder:text-text-muted focus:border-[#f97316] outline-none resize-none"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                      {accountsInput.split("\n").filter((l) => l.trim()).length} unique accounts detected
                    </p>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Copies per account (for shared offline access) *
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
                        Total to add: {accountsInput.split("\n").filter((l) => l.trim()).length * pasteMultiplier}
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
                  onClick={handleAddAccounts}
                  disabled={adding || !selectedGameId}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {adding ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{modalMode === "generate" ? `Generate ${generateCount} Accounts` : "Save Accounts"}</span>
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
