"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please recheck.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setResult(data);
      message.success(data.message);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F4] via-[#F8FAF9] to-[#EEF7EE] text-gray-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#2D6A4F]/10 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 bg-[#52B788]/15 rounded-full blur-[100px]" />

      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 relative z-10">
        <Link
          href="/Manage_Admin/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#2D6A4F] transition-colors"
        >
          <ArrowLeftOutlined /> Back to Admin Sign In
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-xl border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-gray-200/60"
        >
          {result ? (
            /* Success Card State */
            <div className="text-center space-y-5">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm ${
                  result.isFirstAdmin
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200"
                }`}
              >
                {result.isFirstAdmin ? <CrownOutlined /> : <ClockCircleOutlined />}
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {result.isFirstAdmin ? "Super Admin Account Active!" : "Registration Submitted!"}
                </h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {result.message}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-bold text-gray-800">{result.admin?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-bold text-gray-800">{result.admin?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned Role:</span>
                  <span
                    className={`font-bold capitalize ${
                      result.admin?.role === "super_admin" ? "text-amber-600" : "text-[#2D6A4F]"
                    }`}
                  >
                    {result.admin?.role === "super_admin" ? "👑 Super Admin" : "🌿 Administrator"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      result.admin?.status === "approved" ? "text-emerald-700" : "text-amber-600"
                    }`}
                  >
                    {result.admin?.status}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/Manage_Admin/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#2D6A4F] hover:bg-[#1B4332] shadow-md shadow-[#2D6A4F]/20 hover:shadow-lg transition-all"
                >
                  Proceed to Admin Sign In →
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#D8F3DC] border border-[#B7E4C7] flex items-center justify-center text-2xl mx-auto mb-3 text-[#2D6A4F] shadow-sm">
                  <SafetyCertificateOutlined />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Admin Registration
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Create a new administrator account for the store
                </p>
              </div>

              {/* Self-bootstrapping alert banner */}
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  Self-Bootstrapping Hierarchy:
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-700">
                  The very first account created is automatically granted{" "}
                  <strong className="text-emerald-900 font-bold">Super Admin</strong> status with instant auto-approval.
                  All subsequent admin accounts will require approval by the Super Admin before they can log in.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Himel Chowdhury"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MailOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="admin@store.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password (min 6 chars) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] focus:bg-white transition-all"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#2D6A4F] hover:bg-[#1B4332] shadow-md shadow-[#2D6A4F]/20 hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <LoadingOutlined spin /> Creating Account...
                      </>
                    ) : (
                      <>
                        <UserAddOutlined /> Create Admin Account
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login link */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Already have an admin account?{" "}
                  <Link
                    href="/Manage_Admin/login"
                    className="font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
