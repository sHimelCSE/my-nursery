"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout,
  PackageCheck,
  Stethoscope,
  MapPin,
  ShoppingBag,
  Flower2,
  Wheat,
  FolderTree,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

const STATS = [
  { value: "500+", label: "Botanical Varieties", desc: "Indoor, flowering & medicinal plants" },
  { value: "10,000+", label: "Homes Greened", desc: "Across Dhaka & all 64 districts of BD" },
  { value: "100%", label: "Organic Compost", desc: "Zero harsh synthetic growth chemicals" },
  { value: "4.9 / 5", label: "Customer Trust", desc: "Top-rated horticultural satisfaction" },
];

const VALUES = [
  {
    icon: Sprout,
    title: "Freshness & Vitality Guarantee",
    desc: "Every plant is cultivated in sunlight, nourished with organic compost, and rigorously health-checked by certified botanists prior to dispatch.",
  },
  {
    icon: PackageCheck,
    title: "Shockproof Sustainable Packaging",
    desc: "Our custom breathable, shock-absorbing plant cradles protect roots and delicate foliage during transit, using 100% recyclable materials.",
  },
  {
    icon: Stethoscope,
    title: "Lifetime Horticultural Advice",
    desc: "Your green journey doesn't end at checkout. Our plant doctors provide free ongoing advice to make sure your indoor jungle flourishes.",
  },
  {
    icon: MapPin,
    title: "Rooted in Bangladesh",
    desc: "We promote indigenous species and acclimated varieties tailored for the tropical weather and balcony microclimates of Bangladesh.",
  },
];

const OFFERINGS = [
  {
    icon: Sprout,
    title: "Indoor Air-Purifying Plants",
    desc: "Monstera, Snake Plants, Peace Lilies, and Pothos designed to cleanse indoor air and elevate aesthetics.",
  },
  {
    icon: Flower2,
    title: "Balcony & Rooftop Florals",
    desc: "Fragrant Hasnahena, Roses, Bougainvillea, and Adeniums that bring vibrant colors to urban rooftops.",
  },
  {
    icon: Wheat,
    title: "100% Organic Fertilizers",
    desc: "Rich vermicompost, bone meal, neem cake, and micronutrient liquid sprays for flourishing foliage.",
  },
  {
    icon: FolderTree,
    title: "Handcrafted Ceramic & Terracotta",
    desc: "Porous earthen pots and minimalist modern planters with optimal drainage systems.",
  },
];

export default function AboutPage() {
  const [content, setContent] = useState(DEFAULT_SITE_SETTINGS.pagesContent.aboutUs);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.pagesContent?.aboutUs) {
          setContent(data.data.pagesContent.aboutUs);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-transparent">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-6"
          >
            <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{content.subtitle || "Welcome to GreenLeaf Nursery"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-slate-900 tracking-tight leading-[1.15]"
          >
            {content.title || "Rooted in Passion. Growing Green Homes Across Bangladesh."}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line"
          >
            GreenLeaf Nursery was founded with a single mission: to bring the calming, restorative beauty of living plants and sustainable organic gardening into every home, apartment, and rooftop across Bangladesh.
          </motion.p>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-emerald-100/60 shadow-sm">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#2D6A4F] tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Story & Mission ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
              <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" /> Our Botanical Philosophy
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
              We Do Not Just Sell Plants, We Nurture Living Companions
            </h2>
            {content.contentHtml ? (
              <div
                className="prose prose-emerald max-w-none text-slate-700 leading-relaxed botanical-prose"
                dangerouslySetInnerHTML={{ __html: content.contentHtml }}
              />
            ) : (
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
                {content.storyText || (
                  <>
                    <p>
                      Living in fast-paced urban environments like Dhaka, Chittagong, and Sylhet often means losing touch with nature. Concrete balconies and indoor workspaces leave us yearning for clean oxygen, fresh greenery, and calming aesthetics.
                    </p>
                    <p>
                      At GreenLeaf Nursery, our team of passionate botanists and greenhouse growers cultivate plant varieties chosen specifically for Bangladesh’s humidity and climate. From air-cleansing indoor foliage to lush flowering vines and organic soil mixes, we ensure each plant transitions seamlessly into your living space.
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/#products"
                className="px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Nursery Collection</span>
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-slate-800 font-medium text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
              >
                Visit Our Dhaka Nursery
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-8 sm:p-10 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">Our Core Promise</h3>
              <blockquote className="text-sm sm:text-base text-slate-700 italic font-medium leading-relaxed">
                &ldquo;{content.missionText || "If any plant arrives stressed, damaged, or fails to thrive within the first 48 hours of delivery, we replace it free of charge. Your gardening success is our badge of honor."}&rdquo;
              </blockquote>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm">
                  GL
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">GreenLeaf Horticultural Team</p>
                  <p className="text-xs text-[#2D6A4F] font-medium">Uttara, Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── What We Offer ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-y border-emerald-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">Complete Nursery Ecosystem</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-serif">
              Everything Your Urban Garden Needs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              From saplings to soil, we supply 100% natural, tested gardening solutions directly to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFERINGS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-[#FAFBF9] rounded-2xl p-6 border border-emerald-100/60 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Core Values ──────────────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">What Sets Us Apart</span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-serif">
            Our Non-Negotiable Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-emerald-100/60 shadow-sm flex items-start gap-5 hover:border-emerald-200 transition-colors"
              >
                <div className="shrink-0 p-3 bg-emerald-50 text-[#2D6A4F] rounded-2xl border border-emerald-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-10 sm:p-14 text-center text-slate-800 relative overflow-hidden shadow-xs">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center mx-auto shadow-2xs">
              <Sprout className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">Ready to Bring Nature Home?</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore our curated plants or drop by our nursery. Fast delivery across Bangladesh with Cash on Delivery.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#products"
                className="px-8 py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-sm shadow-md transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop All Plants</span>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-slate-800 font-medium text-sm shadow-2xs transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
