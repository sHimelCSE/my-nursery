"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HomeOutlined,
  ShoppingOutlined,
  CustomerServiceOutlined,
  CompassOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-[#FAFBF9] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden select-none">
      
      {/* ─── Ambient Botanical Glow ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-50/60 rounded-full blur-3xl opacity-60" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8">
        
        {/* ─── Floating Plant & 404 Visual ─────────────────────────────────── */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Giant Background 404 Number */}
          <div className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-widest text-[#2D6A4F]/10 select-none leading-none">
            404
          </div>

          {/* Floating Plant & Leaves Animation in Foreground */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Central Nursery Pot & Plant */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-emerald-100/80 shadow-xl shadow-emerald-950/5 flex items-center justify-center text-5xl sm:text-6xl relative z-10">
                🪴
              </div>

              {/* Floating Leaf 1 */}
              <motion.span
                animate={{
                  y: [0, -8, 0],
                  x: [0, 6, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -top-4 -right-5 text-2xl select-none"
              >
                🌿
              </motion.span>

              {/* Floating Leaf 2 */}
              <motion.span
                animate={{
                  y: [0, 8, 0],
                  x: [0, -5, 0],
                  rotate: [0, -20, 0],
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-2 -left-6 text-xl select-none"
              >
                🌱
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* ─── Botanical Message ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            <CompassOutlined />
            <span>Path Not Found · 404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Oops! Looks Like This Path Wandered Off the Garden
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-emerald-800">
            (পেজটি খুঁজে পাওয়া যায়নি)
          </p>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been moved, pruned, or never existed in our nursery greenhouse. Let us guide you back to safety.
          </p>
        </motion.div>

        {/* ─── Helpful Action Buttons ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          {/* Primary Return Home Button */}
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:scale-[0.98] text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <HomeOutlined />
            <span>🌿 Return to Garden (হোমপেজে ফিরে যান)</span>
          </Link>

          {/* Secondary Products Outline Button */}
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 active:scale-[0.98] font-medium text-xs sm:text-sm shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingOutlined />
            <span>Browse Products (গাছ ও সার দেখুন)</span>
          </Link>
        </motion.div>

        {/* ─── Quick Helper Links ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="pt-4 border-t border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600"
        >
          <div className="flex items-center gap-1.5">
            <CustomerServiceOutlined className="text-[#2D6A4F]" />
            <span>Need help finding something?</span>
            <Link
              href="/contact"
              className="text-[#2D6A4F] font-bold hover:underline inline-flex items-center gap-1 ml-1"
            >
              Contact our support team <ArrowRightOutlined className="text-[10px]" />
            </Link>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-emerald-800">
            <Link href="/about" className="hover:underline">
              About Us
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/refund" className="hover:underline">
              Refunds
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
