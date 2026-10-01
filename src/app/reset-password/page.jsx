"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  LockOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
} from "@ant-design/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { message } = App.useApp();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Password reset token is missing from the link. Please request a new reset email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please recheck.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      message.success("Password reset successfully! Please login with your new password.");
      router.push("/login");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl mx-auto font-bold">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-[#1A2E22]">
          Invalid or Missing Reset Link
        </h2>
        <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
          The reset link you clicked does not contain a valid security token. Please request a new reset link.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
          New Password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
            <LockOutlined />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
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

      {/* Confirm New Password */}
      <div>
        <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
          Confirm New Password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
            <LockOutlined />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-[14px] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3"
      >
        {loading ? (
          <>
            <LoadingOutlined spin /> Updating password…
          </>
        ) : (
          <>
            <KeyOutlined /> Reset Password
          </>
        )}
      </motion.button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-[#4B5563] hover:text-[#2D6A4F] transition-colors"
        >
          Cancel and return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F4] via-[#FBFBFA] to-[#EEF7EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#2D6A4F] transition-colors"
        >
          <ArrowLeftOutlined /> Back to Sign In
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-10 px-6 sm:px-10 rounded-3xl border border-gray-100 shadow-xl shadow-green-950/5"
        >
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-2xl mx-auto mb-3 shadow-md shadow-green-900/15 text-white">
              <KeyOutlined />
            </div>
            <h1 className="text-2xl font-black text-[#1A2E22] tracking-tight">
              Set New Password
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Choose a strong, memorable password for your account.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex justify-center items-center">
                <LoadingOutlined style={{ fontSize: 30, color: "#2D6A4F" }} spin />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
