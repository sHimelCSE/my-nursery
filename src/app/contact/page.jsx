"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Headphones,
  Stethoscope,
  Sprout,
  Lock,
} from "lucide-react";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

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

  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_THEME_CONFIG.contactPage);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Instant cache hydration
    try {
      const cachedPage = localStorage.getItem("app_page_theme_config");
      if (cachedPage) {
        const parsed = JSON.parse(cachedPage);
        if (parsed?.contactPage) {
          setPageConfig((prev) => ({ ...prev, ...parsed.contactPage }));
        }
      }
      const cachedSite = localStorage.getItem("app_site_settings");
      if (cachedSite) {
        const parsedSite = JSON.parse(cachedSite);
        if (parsedSite?.general) {
          setSiteSettings((prev) => ({ ...prev, ...parsedSite }));
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch page theme config
    const loadConfig = () => {
      fetch("/api/page-theme-config")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.contactPage) {
            setPageConfig(json.data.contactPage);
            try {
              localStorage.setItem("app_page_theme_config", JSON.stringify(json.data));
            } catch {
              // ignore
            }
          }
        })
        .catch((err) => console.error("Failed to load contact page theme config:", err));
    };
    loadConfig();

    // 3. Fetch global site settings (for address, hotline, email, WhatsApp)
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteSettings(json.data);
          try {
            localStorage.setItem("app_site_settings", JSON.stringify(json.data));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => console.error("Failed to load site settings:", err));

    window.addEventListener("pageThemeConfigUpdated", loadConfig);
    return () => window.removeEventListener("pageThemeConfigUpdated", loadConfig);
  }, []);

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

  const brandName = siteSettings?.general?.siteName || "MSH BloomCraft";
  const contactPageBadge = pageConfig?.badge || "We are here to help you grow";
  const contactPageTitle =
    pageConfig?.title || `Get in Touch with ${brandName}`;
  const contactPageSubtitle =
    pageConfig?.subtitle ||
    "Have a question about a plant species, need sick plant care diagnosis, or have an order inquiry? Reach out to our dedicated botanists and support specialists.";

  const storeAddress =
    siteSettings?.general?.storeAddress || "Sector 7, Uttara, Dhaka-1230, Bangladesh";
  const hotlinePhone = siteSettings?.general?.hotlinePhone || "+880 1712-345678";
  const contactEmail = siteSettings?.general?.contactEmail || "support@bloomcraftnursery.com";
  const businessHours = siteSettings?.general?.businessHours || "Monday – Sunday: 9:00 AM – 9:00 PM";

  const waRaw =
    siteSettings?.whatsapp?.whatsappNumber || siteSettings?.general?.hotlinePhone || "";
  const waClean = waRaw.replace(/[^\d]/g, "");
  const waDefaultMsg = encodeURIComponent(
    siteSettings?.whatsapp?.defaultMessage ||
      `Hello ${brandName}, I have an inquiry regarding plants`
  );
  const waHref = waClean ? `https://wa.me/${waClean}?text=${waDefaultMsg}` : "#";

  const doctorCard = pageConfig?.doctorCard;

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ─── Breadcrumb & Header ────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-4"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>{contactPageBadge}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
          >
            {contactPageTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed"
          >
            {contactPageSubtitle}
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
            <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-xs p-8 sm:p-10 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Headphones className="w-5 h-5 text-[#2D6A4F]" />
                <span>Customer Support Hub</span>
              </h2>

              <div className="space-y-5 text-sm">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{brandName} Nursery &amp; Greenhouse</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-0.5">
                      {storeAddress}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      Central Display &amp; Plant Care Center
                    </span>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Direct Support Hotline</h3>
                    <a
                      href={`tel:${hotlinePhone.replace(/[^\d+]/g, "")}`}
                      className="text-[#2D6A4F] hover:text-[#1B4332] font-bold text-sm block mt-0.5 transition-colors"
                    >
                      {hotlinePhone}
                    </a>
                    <p className="text-xs text-slate-500">Toll-free customer guidance &amp; voice support</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Official Email Inquiries</h3>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-[#2D6A4F] hover:underline font-semibold text-xs sm:text-sm block mt-0.5"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Nursery &amp; Service Hours</h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                      {businessHours}
                    </p>
                    <p className="text-xs text-slate-500">Open 7 days a week including public holidays</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-4 border-t border-emerald-100/60">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (Instant Reply)</span>
                </a>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Average response time: &lt; 15 minutes
                </p>
              </div>
            </div>

            {/* Plant Doctor Consultation Card */}
            {doctorCard?.isEnabled !== false && (
              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/60 text-[#2D6A4F] flex items-center justify-center shrink-0 shadow-2xs">
                    <Stethoscope className="w-6 h-6 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {doctorCard?.title || "Free Plant Doctor Consultation"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {doctorCard?.description ||
                        "Have a plant showing yellow leaves, pests, or drooping stems? Send clear photos to our WhatsApp or attach details in this form for free advice from our nursery botanists."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>{doctorCard?.buttonText || "100% Free Lifetime Horticultural Support"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-xs p-8 sm:p-10 relative">
              {/* Success Notification Banner */}
              {submittedSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
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
                        <CheckCircle2 className="absolute right-3.5 top-3.5 text-emerald-600 w-4 h-4" />
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
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:scale-[0.99] text-white font-medium text-sm tracking-wide shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 pt-1 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>We respect your privacy. Your phone and email are safe and never shared.</span>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
