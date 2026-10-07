"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sprout,
  DollarSign,
  Package,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function RefundPolicyPage() {
  const [content, setContent] = useState(DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy);
  const [whatsapp, setWhatsapp] = useState(DEFAULT_SITE_SETTINGS.whatsapp);
  const [general, setGeneral] = useState(DEFAULT_SITE_SETTINGS.general);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.pagesContent?.refundPolicy) {
            setContent(data.data.pagesContent.refundPolicy);
          }
          if (data.data.whatsapp) {
            setWhatsapp(data.data.whatsapp);
          }
          if (data.data.general) {
            setGeneral(data.data.general);
          }
        }
      })
      .catch(() => {});
  }, []);

  const whatsappNum = (whatsapp.whatsappNumber || "8801712345678").replace(/[^\d]/g, "");

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>100% Risk-Free Botanical Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {content.title || "48-Hour Live Plant Replacement & Refund Guarantee"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: {content.lastUpdated || "October 2026"} · GreenLeaf Nursery Bangladesh
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
                48-Hour Live Plant Replacement Guarantee
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                We take immense pride in our protective packaging. If your plant arrives broken, dead, or severely damaged during courier handling, <strong className="text-[#2D6A4F] underline">we will send you a brand new plant completely free</strong> or provide a full refund.
              </p>
            </div>
          </div>
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

          {/* Quick Action Claims Guide */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How to Claim Within 48 Hours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-100 space-y-1">
                <span className="font-bold text-[#2D6A4F] block">Step 1: Take Photos</span>
                <p className="text-slate-500">Snap 2 clear photos of the damaged foliage and carton label upon unboxing.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-100 space-y-1">
                <span className="font-bold text-[#2D6A4F] block">Step 2: Message Us</span>
                <p className="text-slate-500">Send photos via WhatsApp with your Order ID or phone number.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-100 space-y-1">
                <span className="font-bold text-[#2D6A4F] block">Step 3: Instant Dispatch</span>
                <p className="text-slate-500">Our botanists review within 2 hours and dispatch your replacement.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%2C%20I%20need%20assistance%20with%20a%20damaged%20plant%20claim`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Submit Claim on WhatsApp</span>
              </a>
              <a
                href={`tel:${(general.hotlinePhone || "+8801712345678").replace(/\s+/g, "")}`}
                className="px-6 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#2D6A4F]" />
                <span>Call Hotline Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
