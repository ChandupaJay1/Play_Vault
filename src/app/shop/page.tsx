"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Gamepad2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameCard from "@/components/GameCard";

interface Game {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  rating?: number | null;
  featured?: boolean;
  category?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  gameCount: number;
}

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    Promise.all([fetch("/api/games"), fetch("/api/categories")])
      .then(([gamesRes, catsRes]) => Promise.all([gamesRes.json(), catsRes.json()]))
      .then(([gamesData, catsData]) => {
        setGames(Array.isArray(gamesData) ? gamesData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((g) => g.category?.slug === selectedCategory);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        break;
    }

    return result;
  }, [games, search, selectedCategory, sort]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-2">Browse Games</h1>
          <p className="text-[#64748b]">Discover your next favorite game</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-11 pr-4 py-3 bg-[#111127] border border-[#2a2a4a] rounded-xl text-[#f1f5f9] placeholder-[#64748b] focus:border-[#f97316] transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-3 bg-[#111127] border border-[#2a2a4a] rounded-xl text-[#f1f5f9] appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-3 bg-[#111127] border border-[#2a2a4a] rounded-xl text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <AnimatePresence>
            {(showFilters || isMobile !== null) && (
              <motion.aside
                initial={false}
                className={`${showFilters ? "fixed inset-0 z-40 bg-[#0a0a1a]/80 md:relative md:bg-transparent md:z-auto" : "hidden"} md:block md:w-56 shrink-0`}
                onClick={() => setShowFilters(false)}
              >
                <div
                  className="bg-[#111127] border border-[#2a2a4a] rounded-xl p-4 md:sticky md:top-24"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#f1f5f9] font-semibold text-sm">Categories</h3>
                    <button onClick={() => setShowFilters(false)} className="md:hidden text-[#64748b]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? "bg-[#f97316]/20 text-[#fb923c]"
                          : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a3e]"
                      }`}
                    >
                      All Games
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          selectedCategory === cat.slug
                            ? "bg-[#f97316]/20 text-[#fb923c]"
                            : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a3e]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[#64748b] text-xs">{cat.gameCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#f97316] animate-spin" />
              </div>
            ) : filteredGames.length > 0 ? (
              <>
                <p className="text-[#64748b] text-sm mb-4">
                  {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game, i) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-[#2a2a4a]" />
                <h3 className="text-[#f1f5f9] text-lg font-semibold mb-2">No games found</h3>
                <p className="text-[#64748b] text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f97316]" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
