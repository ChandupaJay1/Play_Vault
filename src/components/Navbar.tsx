"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LogOut, Menu, X, Gamepad2, Search, BookOpen, HelpCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05050a]/80 backdrop-blur-xl border-b border-[#272836]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-[#f97316] group-hover:text-[#eab308] transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
              PlayVault
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm font-medium">
              Shop
            </Link>
            <Link href="/rules" className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              How to Play
            </Link>
            <Link href="/faq" className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm font-medium">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </Link>
            <Link href="/contact" className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/shop" className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/checkout" className="relative p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f97316] rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>
            {session ? (
              <div className="flex items-center gap-3">
                <Link href={session.user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
                  {session.user?.role === "admin" && <ShieldCheck className="w-4 h-4 text-[#f97316]" />}
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#94a3b8]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f1019] border-b border-[#272836]"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/shop" className="block text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                Shop
              </Link>
              <Link href="/rules" className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                <BookOpen className="w-4 h-4" /> How to Play
              </Link>
              <Link href="/faq" className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                <HelpCircle className="w-4 h-4" /> FAQ
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                <MessageSquare className="w-4 h-4" /> Contact
              </Link>
              <Link href="/checkout" className="block text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                Cart ({items.length})
              </Link>
              {session ? (
                <>
                  <Link href={session.user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] py-2" onClick={() => setMobileOpen(false)}>
                    {session.user?.role === "admin" && <ShieldCheck className="w-4 h-4 text-[#f97316]" />}
                    {session.user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="block text-[#ef4444] py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="block text-[#f97316] font-medium py-2" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
