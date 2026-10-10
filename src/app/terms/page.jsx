"use client";

import { useState, useEffect } from "react";
import { FileText, Truck, Mail, Phone } from "lucide-react";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function TermsAndConditionsPage() {
  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_THEME_CONFIG);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Local storage caching
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
            terms: {
              ...(prev.policyPages?.terms || {}),
              ...(parsed.policyPages?.terms || {}),
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
                terms: {
                  ...(prev.policyPages?.terms || {}),
                  ...(data.data.policyPages?.terms || {}),
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
        .catch((err) => console.error("Failed to load terms page config:", err));
    };

    // 3. Fetch fresh site settings
    const loadSiteSettings = () => {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSiteSettings((prev) => ({
              ...prev,
              ...data.data,
              general: { ...prev.general, ...(data.data.general || {}) },
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

  const terms = pageConfig.policyPages?.terms || DEFAULT_PAGE_THEME_CONFIG.policyPages.terms;
  const general = siteSettings.general || DEFAULT_SITE_SETTINGS.general;

  const brandName = general.siteName || "MSH BloomCraft";
  const badgeText = terms.badge || "Store Agreement & Policies";
  const pageTitle = terms.title || "Terms & Conditions";
  const effectiveDate = terms.lastUpdated || "Recently Updated";
  const dhakaTimeline = terms.dhakaTimeline || "24 to 48 Hours";
  const outsideTimeline = terms.outsideTimeline || "48 to 72 Hours";
  const contactEmail = general.contactEmail || "";
  const hotlinePhone = general.hotlinePhone || "";

  const cleanHtml = (terms.contentHtml || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          {badgeText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
              <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{badgeText}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: {effectiveDate} · {brandName}
          </p>
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

          {/* Delivery Timelines Card */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Standard Delivery Timelines Across Bangladesh</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="font-bold text-xs text-[#2D6A4F] uppercase tracking-wide">
                  Inside Dhaka City
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">{dhakaTimeline}</p>
                <p className="text-xs text-slate-500">Direct courier van or express rider</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="font-bold text-xs text-[#2D6A4F] uppercase tracking-wide">
                  Outside Dhaka (All Districts)
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">{outsideTimeline}</p>
                <p className="text-xs text-slate-500">Secured live transit botanical cradles</p>
              </div>
            </div>
          </div>

          {/* Support Strip */}
          {(contactEmail || hotlinePhone) && (
            <div className="pt-4 border-t border-emerald-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span>Questions regarding our terms or bulk orders?</span>
              <div className="flex items-center gap-4">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-bold text-[#2D6A4F] hover:underline flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{contactEmail}</span>
                  </a>
                )}
                {hotlinePhone && (
                  <a
                    href={`tel:${hotlinePhone.replace(/[^\d+]/g, "")}`}
                    className="font-bold text-[#2D6A4F] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{hotlinePhone}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
