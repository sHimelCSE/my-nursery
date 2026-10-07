"use client";

import { useState, useEffect } from "react";
import { FileText, MapPin, Truck, AlertCircle, ShieldCheck } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function TermsAndConditionsPage() {
  const [content, setContent] = useState(DEFAULT_SITE_SETTINGS.pagesContent.termsOfService);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.pagesContent?.termsOfService) {
          setContent(data.data.pagesContent.termsOfService);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Store Agreement & Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {content.title || "Terms & Conditions"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: {content.lastUpdated || "October 2026"} · GreenLeaf Nursery Bangladesh
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-8 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          {/* Dynamic Policy Paragraphs */}
          <section className="leading-relaxed">
            {content.contentHtml ? (
              <div
                className="prose prose-emerald max-w-none text-slate-700 leading-relaxed botanical-prose"
                dangerouslySetInnerHTML={{ __html: content.contentHtml }}
              />
            ) : (
              <div className="space-y-4 whitespace-pre-line leading-relaxed">
                {content.contentText}
              </div>
            )}
          </section>

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
                <p className="text-sm font-bold text-slate-900 mt-1">24 to 48 Hours</p>
                <p className="text-xs text-slate-500">Direct courier van or express rider</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="font-bold text-xs text-[#2D6A4F] uppercase tracking-wide">
                  Outside Dhaka (All Districts)
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">48 to 72 Hours</p>
                <p className="text-xs text-slate-500">Secured live transit botanical cradles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
