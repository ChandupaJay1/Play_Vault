"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Gamepad2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const roleDisplay = user?.role === "admin" ? "Administrator" : "Member";
  const roleColor =
    user?.role === "admin" ? "text-[#f97316]" : "text-[#eab308]";

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.name || "Player"}
              </h2>
              <p className={`text-sm ${roleColor}`}>{roleDisplay}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-lg border border-white/5">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm text-gray-300">
                  {user?.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-lg border border-white/5">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Role
                </p>
                <p className="text-sm text-gray-300">{roleDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#0a0a1a] rounded-lg border border-white/5">
              <Gamepad2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm text-gray-300">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
