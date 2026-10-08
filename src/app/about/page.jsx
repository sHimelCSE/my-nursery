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
  Phone,
  CheckCircle2,
} from "lucide-react";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

const ECOSYSTEM_ICONS = [Sprout, Flower2, Wheat, FolderTree];
const STANDARD_ICONS = [Sprout, PackageCheck, Stethoscope, MapPin];

export default function AboutPage() {
  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_THEME_CONFIG.aboutPage);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Instant cache hydration
    try {
      const cachedPage = localStorage.getItem("app_page_theme_config");
      if (cachedPage) {
        const parsed = JSON.parse(cachedPage);
        if (parsed?.aboutPage) {
          setPageConfig((prev) => ({ ...prev, ...parsed.aboutPage }));
        }
      }
      const cachedSite = localStorage.getItem("app_site_settings");
      if (cachedSite) {
        const parsedSite = JSON.parse(cachedSite);
        if (parsedSite?.general) {
          setSiteSettings((prev) => ({ ...prev, ...parsedSite }));
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch fresh page theme config
    const loadConfig = () => {
      fetch("/api/page-theme-config")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.aboutPage) {
            setPageConfig(data.data.aboutPage);
            try {
              localStorage.setItem("app_page_theme_config", JSON.stringify(data.data));
            } catch {
              // ignore
            }
          }
        })
        .catch((err) => console.error("Failed to load page theme config:", err));
    };
    loadConfig();

    // 3. Fetch site settings
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSiteSettings(data.data);
          try {
            localStorage.setItem("app_site_settings", JSON.stringify(data.data));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => console.error("Failed to load site settings:", err));

    window.addEventListener("pageThemeConfigUpdated", loadConfig);
    return () => window.removeEventListener("pageThemeConfigUpdated", loadConfig);
  }, []);

  const brandName = siteSettings.general?.siteName || "MSH BloomCraft";
  const storeAddress = siteSettings.general?.storeAddress || "Uttara, Dhaka, Bangladesh";

  const { hero, philosophy, ecosystem, standards, ctaBanner } = pageConfig;

  const cleanPhilosophyHtml = (philosophy?.contentHtml || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");

  const brandInitials =
    brandName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "MB";

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800">
      {/* ─── SECTION 1: HERO & STATS ─────────────────────────────────────── */}
      {hero?.isEnabled !== false && (
        <>
          <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-transparent">
            <div className="max-w-5xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-6"
              >
                <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{hero?.badge || "Our Botanical Philosophy"}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-slate-900 tracking-tight leading-[1.15]"
              >
                {hero?.title || "Rooted in Passion. Growing Green Homes Across Bangladesh."}
              </motion.h1>

              {hero?.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line"
                >
                  {hero.subtitle}
                </motion.p>
              )}
            </div>
          </section>

          {/* Stats Bar */}
          {Array.isArray(hero?.stats) && hero.stats.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-emerald-100/60 shadow-xs">
                {hero.stats.map((stat, i) => (
                  <div key={i} className="text-center p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-[#2D6A4F] tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      {stat.label}
                    </div>
                    {stat.sublabel && (
                      <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                        {stat.sublabel}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ─── SECTION 2: PHILOSOPHY & CORE PROMISE ────────────────────────── */}
      {philosophy?.isEnabled !== false && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{philosophy?.badge || "Our Botanical Philosophy"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
                {philosophy?.title || "We Do Not Just Sell Plants, We Nurture Living Companions"}
              </h2>

              {cleanPhilosophyHtml ? (
                <div
                  className="prose prose-emerald max-w-none text-slate-600 leading-relaxed botanical-prose break-words"
                  dangerouslySetInnerHTML={{ __html: cleanPhilosophyHtml }}
                />
              ) : (
                <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
                  <p>
                    Living in fast-paced urban environments like Dhaka, Chittagong, and Sylhet often means losing touch with nature. Concrete balconies and indoor workspaces leave us yearning for clean oxygen, fresh greenery, and calming aesthetics.
                  </p>
                  <p>
                    At {brandName}, our team of passionate botanists and greenhouse growers cultivate plant varieties chosen specifically for Bangladesh’s humidity and climate.
                  </p>
                </div>
              )}

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/#products"
                  className="px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-xs sm:text-sm tracking-wide shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Nursery Collection</span>
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-slate-800 font-medium text-xs sm:text-sm shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Visit Our Greenhouse</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-8 sm:p-10 shadow-xs space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Our Core Promise</h3>
                <blockquote className="text-sm sm:text-base text-slate-700 italic font-medium leading-relaxed">
                  &ldquo;{philosophy?.promiseQuote || "If any plant arrives stressed, damaged, or fails to thrive within the first 48 hours of delivery, we replace it free of charge. Your gardening success is our badge of honor."}&rdquo;
                </blockquote>
                <div className="pt-3 border-t border-emerald-200/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {brandInitials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {philosophy?.promiseAuthor ? `${brandName} ${philosophy.promiseAuthor}` : `${brandName} Horticultural Team`}
                    </p>
                    <p className="text-xs text-[#2D6A4F] font-medium">
                      {philosophy?.promiseLocation || storeAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 3: ECOSYSTEM GRID ───────────────────────────────────── */}
      {ecosystem?.isEnabled !== false && Array.isArray(ecosystem?.cards) && ecosystem.cards.length > 0 && (
        <section className="bg-white py-20 border-y border-emerald-100/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">
                {ecosystem.badge || "Complete Nursery Ecosystem"}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-serif">
                {ecosystem.title || "Everything Your Urban Garden Needs"}
              </h2>
              {ecosystem.subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  {ecosystem.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ecosystem.cards.map((item, i) => {
                const Icon = ECOSYSTEM_ICONS[i % ECOSYSTEM_ICONS.length];
                return (
                  <div
                    key={i}
                    className="bg-[#FAFBF9] rounded-2xl p-6 border border-emerald-100/60 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:shadow-xs space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 4: STANDARDS GRID ───────────────────────────────────── */}
      {standards?.isEnabled !== false && Array.isArray(standards?.cards) && standards.cards.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">
              {standards.badge || "What Sets Us Apart"}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-serif">
              {standards.title || "Our Non-Negotiable Standards"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.cards.map((val, idx) => {
              const Icon = STANDARD_ICONS[idx % STANDARD_ICONS.length];
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-emerald-100/60 shadow-xs flex items-start gap-5 hover:border-emerald-200 transition-colors"
                >
                  <div className="shrink-0 p-3 bg-emerald-50 text-[#2D6A4F] rounded-2xl border border-emerald-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{val.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── SECTION 5: CTA BANNER ───────────────────────────────────────── */}
      {ctaBanner?.isEnabled !== false && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-10 sm:p-14 text-center text-slate-800 relative overflow-hidden shadow-xs">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center mx-auto shadow-2xs">
                <Sprout className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {ctaBanner?.title || "Ready to Bring Nature Home?"}
              </h2>
              {ctaBanner?.subtitle && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {ctaBanner.subtitle}
                </p>
              )}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={ctaBanner?.buttonUrl || "/#products"}
                  className="px-8 py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{ctaBanner?.buttonText || "Shop All Plants"}</span>
                </Link>
                {ctaBanner?.secondaryButtonText && (
                  <Link
                    href={ctaBanner?.secondaryButtonUrl || "/contact"}
                    className="px-8 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-slate-800 font-medium text-sm shadow-2xs transition-all flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>{ctaBanner.secondaryButtonText}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
