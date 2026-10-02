"use client";

import {
  SafetyCertificateOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

export default function RefundPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-3">
            <SafetyCertificateOutlined />
            <span>100% Risk-Free Botanical Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last Updated: {lastUpdated} · GreenLeaf Nursery Bangladesh
          </p>
        </div>

        {/* Highlight Guarantee Card (Light Theme) */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-xs mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center text-3xl shrink-0 shadow-2xs">
              🌿
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
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
          
          {/* Section 1: Conditions */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">1</span>
              Situations Covered Under Free Replacement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-3">
                <CheckCircleOutlined className="text-emerald-700 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Dead / Dehydrated on Arrival</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    If roots or leaves are completely desiccated or rotted upon unboxing.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-3">
                <CheckCircleOutlined className="text-emerald-700 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Snapped Main Stems or Shattered Pot</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Severe transit drop impact resulting in irreversible plant breakage or crushed pots.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-3">
                <CheckCircleOutlined className="text-emerald-700 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Incorrect Variety Dispatched</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    If our nursery packers accidentally sent a different plant species from what you ordered.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-3">
                <CheckCircleOutlined className="text-emerald-700 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Missing Items from Package</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    If an accessory, fertilizer bag, or secondary plant was omitted from parcel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: How to Claim */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">2</span>
              How to Claim a Replacement in 3 Easy Steps
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Photograph the Plant on Unboxing</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Take 1–2 clear photographs or a short 10-second video of the damaged plant, pot, and shipping label within 48 hours of delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Send via WhatsApp or Email</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Send the photos along with your 11-digit phone number or Order ID to our WhatsApp at{" "}
                    <strong className="text-[#2D6A4F]">+880 1712-345678</strong> or email to{" "}
                    <strong className="text-[#2D6A4F]">support@greenleafnursery.com</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Instant Approval & Dispatch</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Our botanist team reviews your request within 2–4 hours. Once verified, a healthy replacement is dispatched immediately via express courier.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Non-Plant items */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">3</span>
              Non-Plant Goods: Fertilizers, Pots & Gardening Tools
            </h2>
            <p>
              For non-perishable goods (planters, organic fertilizers, secateurs, trowels, sprayers):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>You may request a return within <strong className="text-slate-800">7 calendar days</strong> of delivery.</li>
              <li>Products must be unused, unadulterated, and in their original packaging.</li>
              <li>If returning due to personal change of mind, the customer is responsible for the return courier cost (৳80 in Dhaka, ৳150 outside Dhaka).</li>
            </ul>
          </section>

          {/* Section 4: Refund Method */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">4</span>
              Refund Processing Methods & Timelines
            </h2>
            <p>
              When a refund is approved instead of a replacement:
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <DollarCircleOutlined className="text-emerald-700 text-base" />
                <span>bKash / Nagad / Upay / Bank Transfer</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Refunds are sent directly to your registered personal bKash or Nagad wallet within <strong className="text-slate-800">24 to 72 hours</strong> of approval. Zero deductions or processing fees apply.
              </p>
            </div>
          </section>

          {/* WhatsApp Direct Help */}
          <section className="pt-4 border-t border-emerald-100/60">
            <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                  <WhatsAppOutlined />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Need Help with an Order?</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Our customer care desk is active daily from 9 AM to 9 PM.</p>
                </div>
              </div>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-xs transition-all whitespace-nowrap"
              >
                Open WhatsApp Support ↗
              </a>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
