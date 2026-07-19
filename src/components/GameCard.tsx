"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface GameData {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  category?: { name: string; slug: string } | string | null;
  rating?: number | null;
  inStock?: boolean;
}

interface GameCardProps {
  game: GameData;
}

export default function GameCard({ game }: GameCardProps) {
  const { title, slug, price, originalPrice, imageUrl, category, rating, inStock = true } = game;
  const stars = rating ? Math.round(rating) : 0;
  const categoryName = typeof category === "string" ? category : category?.name ?? "";

  return (
    <Link href={`/shop/games/${slug}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1019] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Out of Stock
              </span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
            <span className="translate-y-4 rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              View Details
            </span>
          </div>

          <div className="absolute left-3 top-3">
            <span className="rounded-md bg-yellow-600/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {categoryName}
            </span>
          </div>

          {originalPrice && originalPrice > price && (
            <div className="absolute right-3 top-3">
              <span className="rounded-md bg-green-600/90 px-2 py-1 text-[10px] font-bold text-white">
                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < stars
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-600 text-slate-600"
                }`}
              />
            ))}
            {rating != null && (
              <span className="ml-1 text-xs text-slate-400">
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              Rs. {price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-slate-500 line-through">
                Rs. {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
