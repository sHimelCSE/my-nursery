"use client";

import {
  SafetyCertificateOutlined,
  MailOutlined,
} from "@ant-design/icons";

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-3">
            <SafetyCertificateOutlined />
            <span>Customer Data Protection Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last updated: {lastUpdated} · GreenLeaf Nursery Bangladesh
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-8 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">1</span>
              Introduction & Commitment
            </h2>
            <p>
              At GreenLeaf Nursery, your trust is the foundation of our business. We are committed to safeguarding the personal information of our customers across Bangladesh. This Privacy Policy details how we collect, store, utilize, and protect your information when you browse our website, purchase plants, or contact our support team.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">2</span>
              Information We Collect
            </h2>
            <p>
              We collect only the essential information required to fulfill your orders and provide personalized plant care assistance:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>
                <strong className="text-slate-800">Contact Information:</strong> Full name, 11-digit Bangladeshi mobile number, and email address.
              </li>
              <li>
                <strong className="text-slate-800">Delivery Address:</strong> Street address, apartment/holding number, city/district, and postal code for precise doorstep courier delivery.
              </li>
              <li>
                <strong className="text-slate-800">Order & Plant History:</strong> Specific plant species, organic fertilizers, tools ordered, and total transaction values.
              </li>
              <li>
                <strong className="text-slate-800">Communications:</strong> Messages sent via our Contact Us form or WhatsApp for plant diagnosis.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">3</span>
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <h3 className="font-bold text-sm text-slate-900">🚚 Courier Coordination</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Transmitting delivery address and phone number to our courier partners (Pathao, Steadfast, RedX) for doorstep delivery.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <h3 className="font-bold text-sm text-slate-900">📱 Order Updates & SMS</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Sending automated SMS notifications regarding order confirmation, dispatch, and estimated arrival time.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <h3 className="font-bold text-sm text-slate-900">🌿 Plant Health Advice</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Reviewing plant health inquiries and connecting you with our botanists for tailored care instructions.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                <h3 className="font-bold text-sm text-slate-900">🔒 Fraud Prevention</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Validating mobile numbers to minimize spurious Cash on Delivery orders and protect our nursery inventory.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">4</span>
              Payment Security & Cash on Delivery (COD)
            </h2>
            <p>
              GreenLeaf Nursery operates primarily with <strong className="text-slate-800">Cash on Delivery (COD)</strong> across all 64 districts in Bangladesh. We never store, process, or view credit/debit card numbers or bank account PINs on our servers. Any future online payments are handled directly by PCI-DSS compliant payment gateways with bank-grade SSL encryption.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">5</span>
              Data Protection & Non-Disclosure
            </h2>
            <p>
              We adhere to a strict zero-spam and zero-data-monetization policy. <strong className="text-[#2D6A4F]">We never sell, rent, or trade your personal data to any third-party marketing companies.</strong> Your contact details are stored securely in encrypted databases accessible only by authorized GreenLeaf operational staff.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-gray-100 pb-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#2D6A4F] border border-emerald-200/60 flex items-center justify-center text-xs font-bold">6</span>
              Your Rights & Data Removal
            </h2>
            <p>
              You maintain full authority over your data. At any time, you may:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
              <li>Request an export of all personal details and order records linked to your account.</li>
              <li>Request correction or updating of your phone number or shipping address.</li>
              <li>Request permanent deletion of your profile and historical records.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="pt-4 border-t border-emerald-100/60">
            <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <MailOutlined className="text-lg text-[#2D6A4F] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Privacy Questions or Requests?</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Email our Data Compliance team at{" "}
                  <a href="mailto:privacy@greenleafnursery.com" className="font-bold text-[#2D6A4F] hover:underline">
                    privacy@greenleafnursery.com
                  </a>{" "}
                  or call our hotline at +880 1712-345678.
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
