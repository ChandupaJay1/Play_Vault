"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, Gift, Users, Gamepad2, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface Game {
  id: string;
  title: string;
  imageUrl: string;
  platform: string;
  price: number;
  isFreeOffer: boolean;
  _count: {
    steamAccounts: number;
    keys: number;
  };
}

export default function AdminFreeOffersPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/offers");
      if (!res.ok) throw new Error("Failed to fetch games");
      const data = await res.json();
      setGames(data);
    } catch {
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    if (!searchQuery) return games;
    const q = searchQuery.toLowerCase();
    return games.filter((g) => g.title.toLowerCase().includes(q));
  }, [games, searchQuery]);

  const toggleFreeOffer = async (gameId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (newStatus && !confirm("Are you sure you want to apply this game as a Free Offer? All users will be able to claim it for free until accounts run out.")) return;
    if (!newStatus && !confirm("Are you sure you want to remove this game from Free Offers?")) return;

    setActionLoading(gameId);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, isFreeOffer: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update offer status");
      }

      toast.success(newStatus ? "Applied as Free Offer!" : "Removed from Free Offers");
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, isFreeOffer: newStatus } : g))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#f97316]" />
            Free Offers
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Apply games as free offers for users to claim
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1019] border border-[#272836] rounded-lg text-text-primary text-sm focus:border-[#f97316] outline-none"
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-[#0f1019] border border-[#272836] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-12 text-center">
          <Gamepad2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary">No Games Found</h3>
          <p className="text-sm text-text-muted mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map((game) => {
            const availableCount = Math.min(game._count.steamAccounts, game._count.keys);
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#0f1019] border rounded-xl overflow-hidden flex flex-col transition-all ${
                  game.isFreeOffer ? "border-[#f97316] shadow-lg shadow-[#f97316]/10" : "border-[#272836]"
                }`}
              >
                <div className="aspect-[3/4] relative bg-[#05050a]">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-text-muted" />
                    </div>
                  )}
                  {game.isFreeOffer && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-xs font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      ACTIVE OFFER
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-12">
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{game.title}</h3>
                    <p className="text-xs text-gray-400">{game.platform}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        Steam Accounts
                      </span>
                      <span className="font-medium text-text-primary">{game._count.steamAccounts}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        Activation Keys
                      </span>
                      <span className="font-medium text-text-primary">{game._count.keys}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-[#272836] flex items-center justify-between text-xs font-medium">
                      <span className="text-text-muted">Total Available Claims</span>
                      <span className={availableCount > 0 ? "text-green-400" : "text-red-400"}>
                        {availableCount} users
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFreeOffer(game.id, game.isFreeOffer)}
                    disabled={actionLoading === game.id || (availableCount === 0 && !game.isFreeOffer)}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      game.isFreeOffer
                        ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                        : "bg-[#f97316] text-white hover:bg-[#ea580c] shadow-lg shadow-[#f97316]/20"
                    }`}
                  >
                    {actionLoading === game.id ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : game.isFreeOffer ? (
                      "Remove Free Offer"
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        Apply Free Offer
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
