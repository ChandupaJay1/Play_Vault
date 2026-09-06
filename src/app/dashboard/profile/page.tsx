"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Gamepad2, Save, Loader2, KeyRound, Phone } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt?: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLoading(false);
      })
      .catch(() => {
        if (session?.user) {
          setName(session.user.name || "");
          setEmail(session.user.email || "");
        }
        setLoading(false);
      });
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      if (data.user) {
        setProfile((prev) => ({ ...prev, ...data.user }));
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh session data
      if (updateSession) {
        await updateSession();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const userRole = profile?.role || session?.user?.role || "user";
  const roleDisplay = userRole === "admin" ? "Administrator" : "Member";
  const roleColor = userRole === "admin" ? "text-[#f97316]" : "text-[#eab308]";

  if (loading) {
    return (
      <div className="max-w-2xl p-8 bg-[#111127] rounded-xl border border-white/5 animate-pulse">
        <div className="h-16 w-16 bg-white/10 rounded-full mb-6" />
        <div className="h-6 w-1/3 bg-white/10 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-12 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {name || "Player"}
              </h2>
              <p className={`text-sm ${roleColor}`}>{roleDisplay}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Phone Number (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#eab308]" />
                Change Password (optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors placeholder:text-gray-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-lg shadow-[#f97316]/10"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
