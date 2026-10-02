"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  SafetyCertificateOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid admin credentials");
      }

      message.success(`Welcome back, ${data.admin?.name || "Admin"}!`);
      router.push("/Manage_Admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F4] via-[#F8FAF9] to-[#EEF7EE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative light ambient glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-[#D8F3DC]/40 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 bg-[#B7E4C7]/30 rounded-full blur-[80px]" />

      {/* Top back link to store */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4B5563] hover:text-[#2D6A4F] transition-colors"
        >
          <ArrowLeftOutlined /> Back to GreenLeaf Nursery Store
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-xl shadow-gray-200/60 border border-gray-100 rounded-3xl p-8 sm:p-10 w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] border border-[#B7E4C7] flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm text-[#2D6A4F]">
              <SafetyCertificateOutlined />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#D8F3DC] border border-[#B7E4C7] text-[#2D6A4F] mb-2">
              Executive Portal
            </span>
            <h1 className="text-2xl font-black text-[#1A2E22] tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Sign in with your verified GreenLeaf administrator credentials
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <MailOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@greenleaf.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#2D6A4F] hover:bg-[#1B4332] shadow-md shadow-green-900/15 hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <LoadingOutlined spin /> Authenticating...
                  </>
                ) : (
                  <>
                    <SafetyCertificateOutlined /> Sign In to Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note & register link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-[#6B7280]">
              Need administrator access?{" "}
              <Link
                href="/Manage_Admin/register"
                className="font-bold text-[#2D6A4F] hover:text-[#40916C] hover:underline"
              >
                Register as Admin <ArrowRightOutlined className="text-[10px]" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
