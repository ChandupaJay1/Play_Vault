"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  User,
  Gamepad2,
  LogOut,
  Store,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const sidebarLinks = [
  {
    label: "My Orders",
    href: "/dashboard",
    icon: ShoppingBag,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Browse Games",
    href: "/shop",
    icon: Store,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/admin");
    }
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && session?.user?.role === "admin")) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-text-muted text-sm">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      <aside className="w-64 bg-[#0f0f2a] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-[#f97316]" />
            <span className="text-xl font-bold text-white">
              Play<span className="text-[#f97316]">Vault</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="mb-3 px-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm text-gray-300 truncate">
              {session?.user?.name || session?.user?.email || "User"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session?.user?.name || "Player"}
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your orders and account
            </p>
          </motion.div>
          {children}
        </div>
      </main>
    </div>
  );
}
