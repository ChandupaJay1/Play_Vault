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
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const sidebarLinks = [
  {
    label: "My Orders",
    href: "/dashboard",
    icon: ShoppingBag,
  },
  {
    label: "My Library",
    href: "/dashboard/library",
    icon: Gamepad2,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a1a] flex pt-16 md:pt-0">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0f0f2a] border-r border-white/5 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-[#f97316]" />
            <span className="text-xl font-bold text-white">
              Play<span className="text-[#f97316]">Vault</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}>
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

      <main className="flex-1 overflow-auto w-full max-w-full">
        <div className="md:hidden flex items-center p-4 border-b border-white/5 bg-[#0f0f2a]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-medium capitalize">
            {pathname.split("/").pop() === "dashboard" ? "My Orders" : pathname.split("/").pop()}
          </span>
        </div>
        <div className="p-4 md:p-8 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 hidden md:block"
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
