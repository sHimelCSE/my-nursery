"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  Sprout,
} from "lucide-react";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function RefundPolicyPage() {
  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_THEME_CONFIG);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Local caching
    try {
      const cachedPage = localStorage.getItem("app_page_theme_config");
      if (cachedPage) {
        const parsed = JSON.parse(cachedPage);
        setPageConfig((prev) => ({
          ...prev,
          ...parsed,
          policyPages: {
            ...prev.policyPages,
            ...(parsed.policyPages || {}),
            refund: {
              ...(prev.policyPages?.refund || {}),
              ...(parsed.policyPages?.refund || {}),
            },
          },
        }));
      }
    } catch {
      // ignore
    }

    try {
      const cachedSite = localStorage.getItem("app_site_settings");
      if (cachedSite) {
        const parsed = JSON.parse(cachedSite);
        setSiteSettings((prev) => ({
          ...prev,
          ...parsed,
          general: { ...prev.general, ...(parsed.general || {}) },
          whatsapp: { ...prev.whatsapp, ...(parsed.whatsapp || {}) },
        }));
      }
    } catch {
      // ignore
    }

    // 2. Fetch fresh page theme config
    const loadPageConfig = () => {
      fetch("/api/page-theme-config")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setPageConfig((prev) => ({
              ...prev,
              ...data.data,
              policyPages: {
                ...prev.policyPages,
                ...(data.data.policyPages || {}),
                refund: {
                  ...(prev.policyPages?.refund || {}),
                  ...(data.data.policyPages?.refund || {}),
                },
              },
            }));
            try {
              localStorage.setItem("app_page_theme_config", JSON.stringify(data.data));
            } catch {
              // ignore
            }
          }
        })
        .catch((err) => console.error("Failed to load refund page config:", err));
    };

    // 3. Fetch fresh site settings for WhatsApp & Hotline
    const loadSiteSettings = () => {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSiteSettings((prev) => ({
              ...prev,
              ...data.data,
              general: { ...prev.general, ...(data.data.general || {}) },
              whatsapp: { ...prev.whatsapp, ...(data.data.whatsapp || {}) },
            }));
            try {
              localStorage.setItem("app_site_settings", JSON.stringify(data.data));
            } catch {
              // ignore
            }
          }
        })
        .catch((err) => console.error("Failed to load site settings:", err));
    };

    loadPageConfig();
    loadSiteSettings();

    const handlePageUpdate = () => loadPageConfig();
    const handleSiteUpdate = () => loadSiteSettings();
    window.addEventListener("pageThemeConfigUpdated", handlePageUpdate);
    window.addEventListener("siteSettingsUpdated", handleSiteUpdate);

    return () => {
      window.removeEventListener("pageThemeConfigUpdated", handlePageUpdate);
      window.removeEventListener("siteSettingsUpdated", handleSiteUpdate);
    };
  }, []);

  const refund = pageConfig.policyPages?.refund || DEFAULT_PAGE_THEME_CONFIG.policyPages.refund;
  const general = siteSettings.general || DEFAULT_SITE_SETTINGS.general;
  const whatsapp = siteSettings.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp;

  const brandName = general.siteName || "MSH BloomCraft";
  const badgeText = refund.badge || "100% Risk-Free Botanical Guarantee";
  const pageTitle = refund.title || "48-Hour Live Plant Replacement & Refund Guarantee";
  const lastUpdated = refund.lastUpdated || "Recently Updated";
  const guaranteeTitle = refund.guaranteeTitle || "48-Hour Live Plant Replacement Guarantee";
  const guaranteeText = refund.guaranteeText || "We take immense pride in our protective packaging. If your plant arrives broken, dead, or severely damaged during courier handling, we will send you a brand new plant completely free or provide a full refund.";
  const steps = Array.isArray(refund.steps) && refund.steps.length > 0 ? refund.steps : DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.steps;
  const hotlinePhone = general.hotlinePhone || "";

  const waRaw = whatsapp.whatsappNumber || general.hotlinePhone || "";
  const waClean = waRaw.replace(/[^\d]/g, "");
  const waHref = waClean
    ? `https://wa.me/${waClean}?text=${encodeURIComponent(`Hello ${brandName}, I need assistance with a damaged plant claim.`)}`
    : "";

  const cleanHtml = (refund.contentHtml || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          {badgeText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{badgeText}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: {lastUpdated} · {brandName}
          </p>
        </div>

        {/* Highlight Guarantee Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center shrink-0 shadow-2xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                {guaranteeTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {guaranteeText}
              </p>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-xs p-8 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          {/* Dynamic Policy Paragraphs */}
          {cleanHtml ? (
            <section className="leading-relaxed">
              <div
                className="prose prose-emerald max-w-none text-slate-700 leading-relaxed botanical-prose break-words"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
              />
            </section>
          ) : null}

          {/* Quick Action Claims Guide */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How to Claim Within 48 Hours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {steps.map((stepItem, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-100 space-y-1">
                  <span className="font-bold text-[#2D6A4F] block">
                    {stepItem.step ? `${stepItem.step}: ` : `Step ${idx + 1}: `}{stepItem.title}
                  </span>
                  <p className="text-slate-500 leading-relaxed">{stepItem.desc}</p>
                </div>
              ))}
            </div>

            {(waHref || hotlinePhone) && (
              <div className="pt-2 flex flex-wrap gap-3">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Submit Claim on WhatsApp</span>
                  </a>
                )}
                {hotlinePhone && (
                  <a
                    href={`tel:${hotlinePhone.replace(/[^\d+]/g, "")}`}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Call Hotline Support</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
