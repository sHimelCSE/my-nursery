"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CheckCircleOutlined,
  WhatsAppOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Plant Care & Sick Plant Diagnosis",
  "Order Tracking & Delivery Status",
  "Bulk & Corporate Greenery Orders",
  "Wholesale Plant & Fertilizer Supply",
  "Feedback & Suggestions",
];

export default function ContactPage() {
  const { message: antdMessage } = App.useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
    b_hp_field: "", // Anti-spam honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "Please provide a valid email address.";
    }

    const cleanedPhone = form.phone.trim().replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!BD_PHONE_REGEX.test(cleanedPhone)) {
      newErrors.phone = "Must be an 11-digit BD mobile number (e.g. 01712345678).";
    }

    if (!form.subject) {
      newErrors.subject = "Please select a subject.";
    }

    if (!form.message.trim()) {
      newErrors.message = "Please write your message.";
    } else if (form.message.trim().length < 15) {
      newErrors.message = `Message is too short (${form.message.trim().length}/15 characters minimum).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      antdMessage.error("Please fix the errors in the form before sending.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSubmittedSuccess(true);
      antdMessage.success("Thank you! Your message has been sent successfully.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
        b_hp_field: "",
      });
      setErrors({});
    } catch (err) {
      antdMessage.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Breadcrumb & Header ────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-4"
          >
            <span>🌿</span>
            <span>We are here to help you grow</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
          >
            Get in Touch with GreenLeaf
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed"
          >
            Have a question about a plant species, need sick plant care diagnosis, or have an order inquiry? Reach out to our dedicated botanists and support specialists.
          </motion.p>
        </div>

        {/* ─── Main 2-Column Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════
              LEFT COLUMN: CONTACT INFO & CHANNELS
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Primary Details Card */}
            <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-8 sm:p-10 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <CustomerServiceOutlined className="text-[#2D6A4F]" />
                Customer Support Hub
              </h2>

              <div className="space-y-5 text-sm">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    <EnvironmentOutlined />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">GreenLeaf Nursery & Greenhouse</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-0.5">
                      Plot #12, Road #4, Sector 7, Uttara, Dhaka-1230, Bangladesh
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      Central Plant Display & Greenhouse
                    </span>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    <PhoneOutlined />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Direct Support Hotline</h3>
                    <a
                      href="tel:+8801712345678"
                      className="text-[#2D6A4F] hover:text-[#1B4332] font-bold text-sm block mt-0.5 transition-colors"
                    >
                      +880 1712-345678
                    </a>
                    <p className="text-xs text-slate-500">Toll-free customer guidance & voice support</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    <MailOutlined />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Official Email Inquiries</h3>
                    <a
                      href="mailto:support@greenleafnursery.com"
                      className="text-[#2D6A4F] hover:underline font-semibold text-xs sm:text-sm block mt-0.5"
                    >
                      support@greenleafnursery.com
                    </a>
                    <a
                      href="mailto:hello@greenleafnursery.com"
                      className="text-slate-500 hover:underline text-xs block"
                    >
                      hello@greenleafnursery.com
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    <ClockCircleOutlined />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Nursery & Service Hours</h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                      Monday – Sunday: 9:00 AM – 9:00 PM
                    </p>
                    <p className="text-xs text-slate-500">Open 7 days a week including public holidays</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-4 border-t border-emerald-100/60">
                <a
                  href="https://wa.me/8801712345678?text=Hello%20GreenLeaf%20Nursery,%20I%20have%20an%20inquiry%20regarding%20plants"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <WhatsAppOutlined className="text-xl" />
                  <span>Chat on WhatsApp (Instant Reply)</span>
                </a>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Average WhatsApp response time: &lt; 15 minutes
                </p>
              </div>
            </div>

            {/* Plant Doctor Consultation Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  🩺
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Free Plant Doctor Consultation</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Have a plant showing yellow leaves, pests, or drooping stems? Send clear photos to our WhatsApp or attach details in this form for free advice from our nursery botanists.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                    <SafetyCertificateOutlined />
                    <span>100% Free Lifetime Horticultural Support</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT COLUMN: STRICT CONTACT FORM
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-8 sm:p-10 relative">
              
              {/* Success Notification Banner */}
              {submittedSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
                >
                  <CheckCircleOutlined className="text-xl text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      Message Dispatched to Nursery Desk!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      We have logged your inquiry and dispatched an alert to our team. A nursery specialist will reply to your email or call your number shortly.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="border-b border-gray-100 pb-5 mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Send Us a Direct Message
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Fill in your inquiry details below. All fields with asterisk (<span className="text-red-500">*</span>) are strictly required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* ── Anti-Spam Honeypot Field ── */}
                <input
                  type="text"
                  name="b_hp_field"
                  value={form.b_hp_field}
                  onChange={(e) => setForm({ ...form, b_hp_field: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      className={`w-full bg-white border text-sm text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all ${
                        errors.name
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone (11-digit BD) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-900">
                        Bangladeshi Mobile No. <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">11 digits</span>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setForm({ ...form, phone: val });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                        className={`w-full bg-white border text-sm font-mono text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all ${
                          errors.phone
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                      />
                      {BD_PHONE_REGEX.test(form.phone) && (
                        <CheckCircleOutlined className="absolute right-3.5 top-3.5 text-emerald-600 text-sm" />
                      )}
                    </div>
                    {errors.phone ? (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.phone}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">Example: 01712345678</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="tanvir@example.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={`w-full bg-white border text-sm text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all ${
                        errors.email
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Inquiry Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => {
                        setForm({ ...form, subject: e.target.value });
                        if (errors.subject) setErrors({ ...errors, subject: null });
                      }}
                      className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-900">
                      Your Detailed Message <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        form.message.length >= 15 ? "text-emerald-700 font-bold" : "text-slate-400"
                      }`}
                    >
                      {form.message.length} chars (min 15)
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Tell us about the plants you're interested in, your order number, or any specific gardening questions you have..."
                    value={form.message}
                    onChange={(e) => {
                      setForm({ ...form, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: null });
                    }}
                    className={`w-full bg-white border text-sm text-gray-800 rounded-xl p-4 focus:outline-none transition-all ${
                      errors.message
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:scale-[0.99] text-white font-medium text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message…</span>
                    </>
                  ) : (
                    <>
                      <SendOutlined className="text-base" />
                      <span>Send Message (বার্তা পাঠান)</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  🔒 We respect your privacy. Your phone and email are safe and never shared.
                </p>
              </form>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
