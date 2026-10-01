"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to request password reset");
      }

      setSubmitted(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      message.success("Password reset request submitted!");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <SafetyOutlined />
            </div>
            <h1 className="text-2xl font-black text-[#1A2E22] tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Enter your registered email address and we&apos;ll help you reset your password.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center py-2"
            >
              <div className="w-12 h-12 rounded-full bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center text-xl mx-auto font-bold shadow-xs">
                <CheckCircleOutlined />
              </div>
              <h2 className="text-base font-bold text-[#1A2E22]">
                Reset Link Generated
              </h2>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                If an account exists with <strong className="text-[#1A2E22]">{email}</strong>, a secure password reset link has been dispatched.
              </p>

              {resetUrl && (
                <div className="p-3 bg-[#F4F7F4] rounded-xl border border-[#B7E4C7] text-left text-xs space-y-1 mt-3">
                  <span className="font-bold text-[#2D6A4F] block">
                    🌱 Direct Reset Link (Ready to use):
                  </span>
                  <Link
                    href={resetUrl}
                    className="text-xs font-semibold text-[#2D6A4F] hover:underline break-all block"
                  >
                    Click here to open Reset Password page →
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setResetUrl("");
                  }}
                  className="text-xs font-semibold text-[#4A5568] hover:text-[#2D6A4F] transition-colors"
                >
                  Try another email
                </button>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:bg-[#40916C] shadow-sm transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
                  Email Address (ইমেইল)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                    <MailOutlined />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-[14px] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <LoadingOutlined spin /> Generating link…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#4B5563] hover:text-[#2D6A4F] transition-colors"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
