"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  Phone,
  Truck,
  MessageSquare,
  Lock,
  FileCheck,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy);
  const [general, setGeneral] = useState(DEFAULT_SITE_SETTINGS.general);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.pagesContent?.privacyPolicy) {
            setContent(data.data.pagesContent.privacyPolicy);
          }
          if (data.data.general) {
            setGeneral(data.data.general);
          }
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Customer Data Protection Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            {content.title || "Privacy & Customer Data Protection Policy"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: {content.lastUpdated || "October 2026"} · GreenLeaf Nursery Bangladesh
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
                <span>SMS Notifications</span>
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
                    href={`mailto:${general.contactEmail || "support@greenleafnursery.com"}`}
                    className="font-bold text-[#2D6A4F] hover:underline"
                  >
                    {general.contactEmail || "support@greenleafnursery.com"}
                  </a>{" "}
                  or call our hotline at{" "}
                  <a
                    href={`tel:${(general.hotlinePhone || "+8801712345678").replace(/\s+/g, "")}`}
                    className="font-bold text-[#2D6A4F] hover:underline"
                  >
                    {general.hotlinePhone || "+880 1712-345678"}
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
