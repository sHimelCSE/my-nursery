"use client";

import Link from "next/link";
import { FileTextOutlined } from "@ant-design/icons";

export default function TermsAndConditionsPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-3">
            <FileTextOutlined />
            <span>Store Agreement & Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Effective Date: {lastUpdated} · GreenLeaf Nursery Bangladesh
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-8 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing the GreenLeaf Nursery website, placing an order, or utilizing our customer services, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">2</span>
              Living Botanical Products & Natural Variations
            </h2>
            <p>
              Plants are living, growing organisms. While we make every endeavor to provide photographs that accurately represent the species, health, and maturity of our inventory, you acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>Individual leaf counts, variegation patterns, and exact stem lengths may naturally differ from catalog preview photographs.</li>
              <li>Seasonal flowering varieties may arrive with mature buds that will bloom shortly after delivery rather than in full bloom, ensuring longer flowering longevity in your home.</li>
              <li>Minor transit stress (such as a bent leaf or loose soil in the carton) is normal and typically resolves within 24 hours of hydration and ambient placement.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">3</span>
              Ordering & Cash on Delivery (COD) Commitment
            </h2>
            <p>
              To ensure convenience for all plant enthusiasts across Bangladesh, we offer Cash on Delivery without requiring upfront card payments. In return, we expect genuine customer commitment:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>Providing an accurate, working 11-digit Bangladeshi mobile phone number is mandatory. Our dispatch team may call or SMS to verify high-value orders before courier pickup.</li>
              <li>Customers are expected to receive their parcel and pay the delivery rider upon arrival. Because living plants cannot endure weeks in transit hubs, frivolous refusal of confirmed shipments creates unnecessary botanical mortality and may restrict future orders.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">4</span>
              Pricing, Currency & Delivery Charges
            </h2>
            <p>
              All prices displayed on GreenLeaf Nursery are stated in <strong className="text-slate-800">Bangladeshi Taka (BDT / ৳)</strong>. Delivery fees are calculated dynamically based on location (Inside Dhaka vs. Outside Dhaka) and will be explicitly shown during checkout before order placement. We reserve the right to correct typographical errors in pricing.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">5</span>
              Delivery Timelines & Courier Handling
            </h2>
            <p>
              We partner with trusted express couriers specialized in live parcel handling. Typical delivery timeframes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="font-bold text-sm text-[#2D6A4F]">📍 Inside Dhaka City</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">24 to 48 Hours</p>
                <p className="text-xs text-slate-500">Direct courier van or express rider</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="font-bold text-sm text-[#2D6A4F]">🗺️ Outside Dhaka (All Districts)</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">48 to 72 Hours</p>
                <p className="text-xs text-slate-500">Specialized moisture-locked shockproof packaging</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">6</span>
              Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms and Conditions shall be governed by, and construed in accordance with, the laws of the <strong className="text-slate-800">People&apos;s Republic of Bangladesh</strong>. Any disputes arising in connection with orders or website usage shall be resolved amicably through our customer support or via competent courts in Dhaka, Bangladesh.
            </p>
          </section>

          {/* Footer note */}
          <section className="pt-4 border-t border-emerald-100/60 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-slate-500">
              Questions regarding these Terms? Contact us at{" "}
              <a href="mailto:legal@greenleafnursery.com" className="text-[#2D6A4F] font-bold hover:underline">
                legal@greenleafnursery.com
              </a>
            </p>
            <Link href="/refund" className="text-[#2D6A4F] font-bold hover:underline">
              View Return & Replacement Policy →
            </Link>
          </section>

        </div>

      </div>
    </div>
  );
}
