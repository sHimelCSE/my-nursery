"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  Truck,
  MessageSquare,
  Lock,
  FileCheck,
} from "lucide-react";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function PrivacyPolicyPage() {
  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_THEME_CONFIG);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Try local cache
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
            privacy: {
              ...(prev.policyPages?.privacy || {}),
              ...(parsed.policyPages?.privacy || {}),
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
                privacy: {
                  ...(prev.policyPages?.privacy || {}),
                  ...(data.data.policyPages?.privacy || {}),
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
        .catch((err) => console.error("Failed to load privacy page config:", err));
    };

    // 3. Fetch fresh site settings for contact email / hotline
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

  const privacy = pageConfig.policyPages?.privacy || DEFAULT_PAGE_THEME_CONFIG.policyPages.privacy;
  const general = siteSettings.general || DEFAULT_SITE_SETTINGS.general;

  const brandName = general.siteName || "MSH BloomCraft";
  const badgeText = privacy.badge || "Customer Data Protection Guarantee";
  const pageTitle = privacy.title || "Privacy & Customer Data Protection Policy";
  const lastUpdated = privacy.lastUpdated || "Recently Updated";
  const contactEmail = general.contactEmail || "support@bloomcraftnursery.com";
  const hotlinePhone = general.hotlinePhone || "+880 1712-345678";

  const cleanHtml = (privacy.contentHtml || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{badgeText}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: {lastUpdated} · {brandName}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-xs p-8 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          {/* Dynamic Policy Content */}
          <section className="leading-relaxed">
            {cleanHtml ? (
              <div
                className="prose prose-emerald max-w-none text-slate-700 leading-relaxed botanical-prose break-words"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
              />
            ) : (
              <div className="space-y-4 whitespace-pre-line leading-relaxed break-words text-slate-500 italic">
                Policy details are currently being updated.
              </div>
            )}
          </section>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Truck className="w-4 h-4 text-[#2D6A4F]" />
                <span>Courier Coordination</span>
              </div>
              <p className="text-xs text-slate-600">
                Delivery details transmitted only to our trusted courier partners (Pathao, Steadfast, RedX) for doorstep delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-[#2D6A4F]" />
                <span>Payment Privacy</span>
              </div>
              <p className="text-xs text-slate-600">
                We operate primarily on Cash on Delivery. We never store credit or debit card PINs on our servers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                <span>Order Notifications</span>
              </div>
              <p className="text-xs text-slate-600">
                Automated order confirmation and courier dispatch notifications sent directly to your phone.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileCheck className="w-4 h-4 text-[#2D6A4F]" />
                <span>Zero-Spam Policy</span>
              </div>
              <p className="text-xs text-slate-600">
                We never monetize, rent, or sell your information to third-party telemarketers.
              </p>
            </div>
          </div>

          {/* Contact Box */}
          <section className="pt-4 border-t border-emerald-100/60">
            <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#2D6A4F] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Privacy Questions or Requests?</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Email our Data Compliance team at{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-bold text-[#2D6A4F] hover:underline"
                  >
                    {contactEmail}
                  </a>{" "}
                  or call our hotline at{" "}
                  <a
                    href={`tel:${hotlinePhone.replace(/[^\d+]/g, "")}`}
                    className="font-bold text-[#2D6A4F] hover:underline"
                  >
                    {hotlinePhone}
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
