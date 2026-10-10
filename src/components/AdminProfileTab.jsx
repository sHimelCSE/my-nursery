"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  CheckCircle2,
  Crown,
  Loader2,
} from "lucide-react";
import { App } from "antd";

export default function AdminProfileTab({ admin, onAdminUpdate }) {
  const { message } = App.useApp();

  // Profile fields state
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
    }
  }, [admin]);

  const isSuperAdmin = admin?.role === "super_admin";

  // Handle Profile Info Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      message.error("Admin name cannot be empty.");
      return;
    }

    if (!trimmedEmail) {
      message.error("Admin email cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin-auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });
      const data = await res.json();

      if (data.success && data.admin) {
        message.success(data.message || "Profile updated successfully!");
        if (typeof onAdminUpdate === "function") {
          onAdminUpdate(data.admin);
        }
      } else {
        message.error(data.message || "Failed to update profile info.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      message.error("Network error while updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      message.error("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      message.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match. Please verify.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin-auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        message.success(data.message || "Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        message.error(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Password update error:", err);
      message.error("Network error while updating password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100">
              <User className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#1A2E22] tracking-tight">
              Admin Profile & Security (প্রোফাইল ও সিকিউরিটি)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
            Manage your administrator account credentials, email, and password.
          </p>
        </div>

        {/* Soft Gold Role Badge */}
        <div className="shrink-0">
          {isSuperAdmin ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Super Admin (Full Administrative Privileges)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Administrator (Standard Privileges)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Card A: Personal Account Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-bold text-sm shrink-0 border border-[#B7E4C7]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A2E22]">
                Personal Account Info (ব্যক্তিগত তথ্য)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your administrative display name and login email address
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Administrator Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nursery Executive"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#1A2E22] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bloomcraft.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#1A2E22] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Account Role & Status
              </label>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Privilege Level:</span>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Crown className="w-3.5 h-3.5 text-amber-700" />
                    <span>Super Admin (Full Administrative Privileges)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Info</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card B: Security & Password Update */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
              <KeyRound className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A2E22]">
                Security & Password Update (পাসওয়ার্ড পরিবর্তন)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Set a strong, encrypted password with at least 6 characters
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                New Password (নতুন পাসওয়ার্ড)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#1A2E22] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Confirm Password (কনফার্ম পাসওয়ার্ড)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#1A2E22] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Your password will be encrypted with bcrypt (salt rounds = 10) before saving directly into MongoDB.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1A2E22] hover:bg-[#2D6A4F] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
