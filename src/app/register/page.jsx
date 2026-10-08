"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { App } from "antd";
import { Sprout } from "lucide-react";
import {
  UserOutlined, MailOutlined, LockOutlined, LoadingOutlined, ArrowLeftOutlined,
  EyeOutlined, EyeInvisibleOutlined,
} from "@ant-design/icons";

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.01 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const [brandName, setBrandName] = useState("MSH BloomCraft");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("app_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.general?.siteName) setBrandName(parsed.general.siteName);
      }
    } catch {}
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create account");
      }

      message.success("Account created successfully!");

      // Auto sign-in with the new credentials
      const signInRes = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F4] via-[#FBFBFA] to-[#EEF7EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#2D6A4F] transition-colors"
        >
          <ArrowLeftOutlined /> Back to {brandName}
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
            <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] flex items-center justify-center mx-auto mb-3 shadow-md shadow-green-900/15 text-white">
              <Sprout className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-[#1A2E22] tracking-tight">
              Create an Account
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Join {brandName} to track orders and save plant favorites
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          {/* ── Continue with Google ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-[#1A2E22] shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <LoadingOutlined className="text-[#2D6A4F]" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </button>

          {/* ── Subtle OR Divider ── */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative px-3 bg-white text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Or register with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                  <UserOutlined />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Himel Rahman"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                  <MailOutlined />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                  <LockOutlined />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                  <LockOutlined />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-[14px] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <>
                  <LoadingOutlined spin /> Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Bottom link to Login */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-[#4B5563]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#2D6A4F] hover:text-[#40916C] hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
