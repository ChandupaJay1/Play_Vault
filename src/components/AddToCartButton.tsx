"use client";

import { useCartStore } from "@/lib/store";
import { ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  gameId: string;
  title: string;
  price: number;
  imageUrl: string;
}

export default function AddToCartButton({
  gameId,
  title,
  price,
  imageUrl,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const isInCart = items.some((i) => i.gameId === gameId);

  const handleAdd = () => {
    if (isInCart) return;
    addItem({ gameId, title, price, imageUrl });
    setAdded(true);
    toast.success(`${title} added to cart!`, {
      icon: "🛒",
      style: {
        background: "#111127",
        color: "#f1f5f9",
        border: "1px solid #2a2a4a",
      },
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleAdd}
      disabled={isInCart}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ${
        isInCart
          ? "cursor-not-allowed bg-slate-700"
          : "bg-gradient-to-r from-orange-600 to-yellow-500 shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 hover:brightness-110"
      }`}
    >
      {isInCart ? (
        <>
          <Check className="h-4 w-4" />
          In Cart
        </>
      ) : added ? (
        <>
          <Check className="h-4 w-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </motion.button>
  );
}
