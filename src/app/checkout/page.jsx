"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { App } from "antd";
import { useSession } from "next-auth/react";
import {
  UserOutlined, PhoneOutlined, EnvironmentOutlined,
  FileTextOutlined, LoadingOutlined, CheckCircleOutlined,
  ArrowLeftOutlined, CompassOutlined, MailOutlined,
} from "@ant-design/icons";
import {
  Banknote,
  Smartphone,
  Tag,
  X,
  ShieldCheck,
  RotateCcw,
  Truck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import useCartStore from "@/lib/cartStore";
import { lookupPostcode, getDistricts, getDivisions } from "@/lib/postcodeHelper";

const ALL_DISTRICTS = getDistricts();
const ALL_DIVISIONS = getDivisions();

const PAYMENT_OPTIONS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay cash when your order arrives at your door.",
    iconNode: <Banknote className="w-6 h-6 text-[#2D6A4F]" />,
  },
  {
    id: "bkash",
    label: "bKash / Nagad",
    desc: "Manual payment — we will confirm via call or SMS after order.",
    iconNode: <Smartphone className="w-6 h-6 text-[#2D6A4F]" />,
  },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=100&q=70";

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, icon, error, required, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[13px] font-semibold text-[#374151]">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#6B7280]">{hint}</span>}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const { data: session } = useSession();

  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const appliedDiscounts = useCartStore((s) => s.appliedDiscounts || []);
  const discountTotal = useCartStore((s) => s.discountTotal || 0);
  const isFreeShipping = useCartStore((s) => s.isFreeShipping || false);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const setCustomerEmail = useCartStore((s) => s.setCustomerEmail);

  const [checkoutPromoInput, setCheckoutPromoInput] = useState("");
  const [applyingCheckoutPromo, setApplyingCheckoutPromo] = useState(false);
  const [checkoutPromoMsg, setCheckoutPromoMsg] = useState({ type: "", text: "" });

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPayment] = useState("cod");
  const orderPlacedRef = useRef(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    postalCode: "",
    division: "",
    district: "",
    upazila: "",
    address: "",
    notes: "",
  });

  const [autoDetected, setAutoDetected] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => setMounted(true), []);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || "",
        email: prev.email || session.user.email || "",
        phone: prev.phone || session.user.phone || "",
      }));
    }
  }, [session?.user]);

  // Redirect to home if cart is empty (unless an order was just placed)
  useEffect(() => {
    if (mounted && !orderPlacedRef.current && items.length === 0) {
      router.replace("/");
    }
  }, [mounted, items.length, router]);

  if (!mounted) return null;
  if (!orderPlacedRef.current && items.length === 0) return null;

  // ── Delivery & Total calculation ──────────────────────
  // ৳60 if District is 'Dhaka', otherwise ৳120 (Free for orders >= ৳1,000 or Free Shipping coupon)
  const subtotal = getTotalPrice();
  const isDhaka = form.district?.trim().toLowerCase() === "dhaka";
  const standardDeliveryFee = !form.district ? 60 : isDhaka ? 60 : 120;
  const deliveryCharge = (subtotal >= 1000 || isFreeShipping) ? 0 : standardDeliveryFee;
  const total = Math.max(0, subtotal - discountTotal) + deliveryCharge;
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

  // ── Form handling ────────────────────────────────────
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    if (key === "email" && setCustomerEmail) {
      setCustomerEmail(value);
    }
  };

  const handleApplyCheckoutCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!checkoutPromoInput.trim()) return;
    setApplyingCheckoutPromo(true);
    setCheckoutPromoMsg({ type: "", text: "" });
    try {
      const res = await applyCoupon(checkoutPromoInput.trim(), form.email);
      if (res.success) {
        setCheckoutPromoMsg({ type: "success", text: res.message || "Coupon applied!" });
        setCheckoutPromoInput("");
      } else {
        setCheckoutPromoMsg({ type: "error", text: res.message || "Invalid coupon" });
      }
    } catch {
      setCheckoutPromoMsg({ type: "error", text: "Failed to apply coupon." });
    } finally {
      setApplyingCheckoutPromo(false);
    }
  };

  // Smart Postal Code Auto-fill
  const handlePostalCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setField("postalCode", value);

    if (value.length === 4) {
      const match = lookupPostcode(value);
      if (match) {
        setForm((prev) => ({
          ...prev,
          postalCode: value,
          division: match.division || prev.division,
          district: match.district || prev.district,
          upazila: match.upazila || match.postOffice || prev.upazila,
        }));
        setAutoDetected({
          upazila: match.upazila || match.postOffice,
          district: match.district,
          division: match.division,
          postOffice: match.postOffice,
        });
        setErrors((prev) => ({
          ...prev,
          postalCode: "",
          district: "",
          division: "",
          upazila: "",
        }));
      } else {
        setAutoDetected(null);
      }
    } else {
      setAutoDetected(null);
    }
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setField("district", newDistrict);
    // If the district is manually changed and doesn't match autoDetected, clear the badge
    if (autoDetected && autoDetected.district !== newDistrict) {
      setAutoDetected(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";

    // 11 digits starting with 01
    const cleanPhone = form.phone.trim().replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (!/^01\d{9}$/.test(cleanPhone)) {
      errs.phone = "Phone number must be 11 digits starting with 01 (e.g. 01712345678)";
    }

    const cleanEmail = form.email.trim();
    if (!cleanEmail) {
      errs.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (!form.district) errs.district = "Please select or auto-fill your district";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      message.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: form.fullName.trim(),
            email: form.email.toLowerCase().trim(),
            phone: form.phone.trim(),
            street: form.address.trim(),
            city: form.district,
            state: form.division || form.district,
            postalCode: form.postalCode.trim() || "N/A",
            country: "Bangladesh",
            district: form.district,
            division: form.division,
            upazila: form.upazila,
          },
          email: form.email.toLowerCase().trim(),
          userId: session?.user?.id || undefined,
          paymentMethod,
          notes: form.notes.trim(),
          products: items.map((item) => ({
            productId: item._id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
          discountAmount: discountTotal,
          appliedCouponCode: appliedDiscounts.map((d) => d.code).join(", "),
          isFreeShipping,
          deliveryCharge,
          totalPrice: total,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Order failed");

      // Extract order ID with all possible response shapes
      const orderId =
        data.orderId ||
        data.data?.orderId ||
        data.data?._id ||
        data._id ||
        data.order?._id;

      if (!orderId) {
        throw new Error("Order was placed, but no Order ID was returned.");
      }

      const isNewUser = !!(data.isNewUser || data.data?.isNewUser);

      // Mark order as placed so empty cart does NOT trigger redirect to "/"
      orderPlacedRef.current = true;

      // Clear the cart
      clearCart();

      // Explicitly navigate to order success receipt
      router.push(`/order-success/${orderId}${isNewUser ? "?newUser=1" : ""}`);
    } catch (err) {
      message.error(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full py-3 pr-4 rounded-xl border text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all ${
      errors[field] ? "border-red-300 focus:ring-red-200/40 focus:border-red-400" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#2D6A4F] text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeftOutlined /> Back to Shopping
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-xl">🛒</div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A2E22]">Checkout</h1>
              <p className="text-[#6B7280] text-sm">{totalQty} item{totalQty !== 1 ? "s" : ""} · ৳{total.toLocaleString()} total</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            {/* ════════════════════════════════════════
                LEFT — Shipping Form
            ════════════════════════════════════════ */}
            <div className="space-y-6">

              {/* Shipping info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <EnvironmentOutlined style={{ color: "#2D6A4F", fontSize: "16px" }} />
                  <h2 className="text-[15px] font-bold text-[#1A2E22]">Delivery Information</h2>
                </div>

                {/* Contact info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <Field label="Full Name" required error={errors.fullName} icon={<UserOutlined />}>
                    <input
                      id="checkout-fullname"
                      type="text"
                      placeholder="e.g. Himel Rahman"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      className={`${inputClass("fullName")} pl-10`}
                    />
                  </Field>

                  {/* Phone */}
                  <Field
                    label="Phone Number"
                    required
                    error={errors.phone}
                    hint="11 digits starting with 01"
                    icon={<PhoneOutlined />}
                  >
                    <input
                      id="checkout-phone"
                      type="tel"
                      maxLength={11}
                      placeholder="e.g. 01712345678"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className={`${inputClass("phone")} pl-10`}
                    />
                  </Field>
                </div>

                {/* Email Address (ইমেইল) */}
                <Field
                  label="Email Address (ইমেইল)"
                  required
                  error={errors.email}
                  hint="Order confirmation and account login will be linked here"
                  icon={<MailOutlined />}
                >
                  <input
                    id="checkout-email"
                    type="email"
                    placeholder="e.g. himel@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={`${inputClass("email")} pl-10`}
                  />
                </Field>

                {/* ── Postal Code Auto-fill Box ── */}
                <div className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#E2E8F0]">
                  <Field
                    label="Postal Code (Auto-fill)"
                    hint="Type 4 digits to auto-detect area & district"
                    icon={<CompassOutlined />}
                    error={errors.postalCode}
                  >
                    <input
                      id="checkout-postalcode"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="e.g. 1214 or 6280"
                      value={form.postalCode}
                      onChange={handlePostalCodeChange}
                      className={`${inputClass("postalCode")} pl-10 font-mono tracking-wider`}
                    />
                  </Field>

                  {/* Green Auto-detected Badge */}
                  <AnimatePresence>
                    {autoDetected && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D8F3DC] border border-[#74C69D] text-[#1B4332] text-[12px] font-semibold shadow-xs"
                      >
                        <CheckCircleOutlined className="text-[#2D6A4F]" />
                        <span>✓ Auto-detected: {autoDetected.upazila || autoDetected.postOffice}, {autoDetected.district}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location Fields (Fully Editable) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Division */}
                  <Field label="Division" error={errors.division}>
                    <select
                      id="checkout-division"
                      value={form.division}
                      onChange={(e) => setField("division", e.target.value)}
                      className={`${inputClass("division")} pl-3 cursor-pointer`}
                    >
                      <option value="">Select Division…</option>
                      {ALL_DIVISIONS.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </Field>

                  {/* District */}
                  <Field label="District / City" required error={errors.district}>
                    <select
                      id="checkout-district"
                      value={form.district}
                      onChange={handleDistrictChange}
                      className={`${inputClass("district")} pl-3 cursor-pointer`}
                    >
                      <option value="">Select District…</option>
                      {ALL_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Upazila / Area */}
                  <Field label="Upazila / Area" error={errors.upazila}>
                    <input
                      id="checkout-upazila"
                      type="text"
                      placeholder="e.g. Sabujbag / Bagha"
                      value={form.upazila}
                      onChange={(e) => setField("upazila", e.target.value)}
                      className={`${inputClass("upazila")} pl-3`}
                    />
                  </Field>
                </div>

                {/* Street Address */}
                <Field label="Delivery Address" required error={errors.address}>
                  <textarea
                    id="checkout-address"
                    rows={3}
                    placeholder="House no, Road no, Sector / Block, Flat no..."
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className={`${inputClass("address")} pl-4 resize-none`}
                  />
                </Field>

                {/* Delivery fee notice */}
                <motion.div
                  className="flex items-center justify-between bg-[#D8F3DC]/60 border border-[#B7E4C7] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚚</span>
                    <div>
                      <p className="text-[13px] text-[#2D6A4F] font-semibold">
                        {form.district ? (
                          isDhaka ? "Inside Dhaka Delivery: ৳60" : `Outside Dhaka (${form.district}) Delivery: ৳120`
                        ) : (
                          "Standard Delivery: ৳60 Inside Dhaka · ৳120 Outside"
                        )}
                      </p>
                      {subtotal >= 1000 && (
                        <p className="text-[11px] text-[#40916C]">
                          🎉 Free delivery applied (orders over ৳1,000)!
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#2D6A4F]">
                    {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                  </span>
                </motion.div>

                {/* Notes */}
                <Field label="Order Notes" icon={<FileTextOutlined />}>
                  <textarea
                    id="checkout-notes"
                    rows={2}
                    placeholder="Any special instructions for delivery? (Optional)"
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#1A2E22] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all resize-none"
                  />
                </Field>
              </motion.div>

              {/* Payment method card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="text-[15px] font-bold text-[#1A2E22] mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <motion.label
                      key={opt.id}
                      whileTap={{ scale: 0.99 }}
                      htmlFor={`payment-${opt.id}`}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentMethod === opt.id
                          ? "border-[#40916C] bg-[#D8F3DC]/40"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        id={`payment-${opt.id}`}
                        name="payment"
                        value={opt.id}
                        checked={paymentMethod === opt.id}
                        onChange={() => setPayment(opt.id)}
                        className="sr-only"
                      />
                      <span className="shrink-0 mt-0.5">{opt.iconNode}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-[#1A2E22]">{opt.label}</p>
                          {paymentMethod === opt.id && (
                            <span className="bg-[#2D6A4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#6B7280] mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        paymentMethod === opt.id ? "border-[#2D6A4F] bg-[#2D6A4F]" : "border-gray-300"
                      }`}>
                        {paymentMethod === opt.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ════════════════════════════════════════
                RIGHT — Order Summary (sticky)
            ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-[15px] font-bold text-[#1A2E22]">
                    Order Summary
                    <span className="ml-2 text-[#6B7280] font-normal text-[13px]">({totalQty} items)</span>
                  </h2>
                </div>

                {/* Items */}
                <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#D8F3DC]/30 shrink-0">
                        <img
                          src={item.image || FALLBACK_IMG}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1A2E22] line-clamp-1">{item.title}</p>
                        <p className="text-[12px] text-[#6B7280]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[14px] font-bold text-[#2D6A4F] shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box in Checkout Order Summary */}
                <div className="px-5 py-3 border-t border-gray-100 bg-[#FAFBF9] space-y-2">
                  <form onSubmit={handleApplyCheckoutCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. WELCOME10)"
                        value={checkoutPromoInput}
                        onChange={(e) => {
                          setCheckoutPromoInput(e.target.value.toUpperCase());
                          setCheckoutPromoMsg({ type: "", text: "" });
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 uppercase font-mono tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={applyingCheckoutPromo || !checkoutPromoInput.trim()}
                      className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#1E3F20] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {applyingCheckoutPromo ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </form>

                  {checkoutPromoMsg.text && (
                    <p
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        checkoutPromoMsg.type === "success" ? "text-[#2D6A4F]" : "text-red-500"
                      }`}
                    >
                      {checkoutPromoMsg.type === "success" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      <span>{checkoutPromoMsg.text}</span>
                    </p>
                  )}

                  {appliedDiscounts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {appliedDiscounts.map((disc) => (
                        <div
                          key={disc.code}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EBF0E6] border border-emerald-300 text-[#1E3F20] text-xs font-semibold"
                        >
                          <Tag className="w-3 h-3 text-[#2D6A4F]" />
                          <span className="font-mono font-bold">{disc.code}</span>
                          {disc.discountAmount > 0 && (
                            <span className="text-[11px] text-[#2D6A4F] font-bold">
                              (-৳{disc.discountAmount.toLocaleString()})
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCoupon(disc.code)}
                            className="p-0.5 hover:text-red-600 transition-colors cursor-pointer rounded-full"
                            title="Remove coupon"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between text-[13px] text-[#6B7280]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1A2E22]">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-[13px] text-[#2D6A4F] font-bold">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Discount Applied</span>
                      </span>
                      <span>-৳{discountTotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[13px] text-[#6B7280]">
                    <span>Delivery Charge</span>
                    <span className={`font-semibold ${deliveryCharge === 0 ? "text-[#2D6A4F] font-bold" : "text-[#1A2E22]"}`}>
                      {deliveryCharge === 0 ? (
                        "Free Shipping"
                      ) : (
                        `৳${deliveryCharge} (${isDhaka ? "Inside Dhaka" : "Outside Dhaka"})`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[15px] font-extrabold text-[#1A2E22] border-t border-gray-100 pt-2.5">
                    <span>Grand Total</span>
                    <span className="text-[#2D6A4F] text-base font-black">৳{total.toLocaleString()}</span>
                  </div>

                  {/* Payment badge */}
                  <div className="flex items-center gap-2 bg-[#F4F7F4] rounded-xl px-3 py-2 mt-1">
                    <span className="text-[#2D6A4F]">
                      {paymentMethod === "cod" ? (
                        <Banknote className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                    </span>
                    <span className="text-[12px] text-[#4A5568] font-medium">
                      {PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={submitting}
                    id="place-order-btn"
                    className="w-full py-4 rounded-2xl bg-[#2D6A4F] text-white font-bold text-[15px] hover:bg-[#1E3F20] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <LoadingOutlined spin />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <CheckCircleOutlined />
                        Place Order · ৳{total.toLocaleString()}
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Secure Payment</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Easy Returns</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Fast Delivery</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
