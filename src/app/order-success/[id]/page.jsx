"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircleOutlined, LoadingOutlined, EnvironmentOutlined,
  ShoppingOutlined, PhoneOutlined, UserOutlined, PrinterOutlined,
  HomeOutlined, CalendarOutlined, DownloadOutlined, SafetyCertificateOutlined,
  LockOutlined, KeyOutlined, EyeOutlined, EyeInvisibleOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import { Sprout, Truck, Phone, Banknote, AlertCircle } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export default function OrderSuccessPage({ params }) {
  // Unwrap async params for Next.js 16
  const { id } = use(params);
  const { message } = App.useApp();

  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Auto-created guest account & set password state
  const [isNewUser, setIsNewUser] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordSetSuccess, setPasswordSetSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("newUser") === "1") {
        setIsNewUser(true);
      }
    }

    try {
      const cached = localStorage.getItem("app_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.general) setSiteSettings(parsed);
      }
    } catch {}

    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSiteSettings(data.data);
          try {
            localStorage.setItem("app_site_settings", JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const brandName = siteSettings.general?.siteName || "MSH BloomCraft";
  const contactEmail = siteSettings.general?.contactEmail || "support@bloomcraftnursery.com";
  const storeAddress = siteSettings.general?.storeAddress || "Sector 7, Uttara, Dhaka-1230, Bangladesh";

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordInput || passwordInput.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setSettingPassword(true);
    try {
      const email = order?.userEmail || order?.shippingAddress?.email || order?.customerEmail;
      const res = await fetch("/api/user/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordInput,
          email,
          orderId: order?._id || id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to set password");
      }

      message.success("Password set successfully! Your account is ready.");
      setPasswordSetSuccess(true);
    } catch (err) {
      setPasswordError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSettingPassword(false);
    }
  };

  // Fetch order data from /api/orders/[id]
  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && (json.data || json.order)) {
          const ord = json.data || json.order;
          setOrder(ord);
          if (ord.userHasTemporaryPassword || ord.isNewUser) {
            setIsNewUser(true);
          }
        } else {
          setError(json.message || "Order details not found");
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        if (isMounted) setError("Could not load order details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // One-click PDF download handler using modern html2canvas-pro (full oklch/lab support) + jspdf
  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-receipt");
    if (!element) return;

    setDownloadingPdf(true);
    try {
      const rawId = order?._id || id || "";
      const suffix = rawId.length >= 6 ? rawId.slice(-6).toUpperCase() : rawId ? rawId.toUpperCase() : "ORD";
      const sanitizedBrand = (brandName || "Invoice").replace(/[^a-zA-Z0-9]/g, "-");
      const filename = `${sanitizedBrand}-Invoice-${suffix}.pdf`;

      // Import modern html2canvas-pro and jspdf dynamically to avoid SSR issues
      const [html2canvasModule, jsPdfModule] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jsPDF = jsPdfModule.jsPDF || jsPdfModule.default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, contentHeight);
      pdf.save(filename);
      message.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      message.info("Opening browser print dialog as fallback...");
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const confettiItems = CONFETTI_EMOJIS.map((emoji, i) => ({
    emoji,
    style: {
      left: `${10 + i * 11}%`,
      x: (i % 2 === 0 ? 1 : -1) * (10 + i * 4),
      rotate: (i % 2 === 0 ? 15 : -20) * (i * 0.5),
      delay: 0.1 + i * 0.12,
    },
  }));

  const shipping = order?.shippingAddress;
  const rawId = order?._id || id || "";
  const invoiceNumber = `ORD-${rawId.slice(-6).toUpperCase()}`;
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const isDhaka = shipping?.district?.toLowerCase() === "dhaka" || shipping?.city?.toLowerCase() === "dhaka";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F4] via-[#FBFBFA] to-[#EEF7EE] py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:min-h-0">
      
      {/* ── Print Specific Styles ── */}
      <style jsx global>{`
        @media print {
          nav, footer, .print\\:hidden, #app-navbar {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #invoice-receipt {
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="relative max-w-3xl mx-auto">

        {/* Floating nature confetti leaves */}
        {showConfetti && confettiItems.map(({ emoji, style }, i) => (
          <FloatingEmoji key={i} emoji={emoji} style={style} />
        ))}

        {/* ── Celebratory Header Banner (hidden on print) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 print:hidden"
        >
          {/* Green checkmark badge */}
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 220, delay: 0.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#D8F3DC] to-[#B7E4C7] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200/50"
          >
            <CheckCircleOutlined className="text-3xl sm:text-4xl text-[#2D6A4F]" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E22] tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-[#4B5563] text-sm mt-1">
            Thank you for shopping with {brandName}. Your official money receipt is ready below.
          </p>
        </motion.div>

        {/* ════════════════════════════════════════════
            ACTION BUTTONS BAR (Top — Hidden in Print & PDF)
        ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white p-3 rounded-2xl border border-gray-100 shadow-xs"
        >
          {/* Prominent Primary PDF Download Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading || !order}
            className="flex-1 sm:flex-initial py-3 px-6 rounded-xl bg-[#2D6A4F] text-white font-bold text-[14px] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloadingPdf ? (
              <>
                <LoadingOutlined spin /> Generating PDF…
              </>
            ) : (
              <>
                <DownloadOutlined className="text-base" /> Download PDF Invoice
              </>
            )}
          </motion.button>

          {/* Small Secondary Print & Home Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={loading}
              className="flex-1 sm:flex-initial py-3 px-4 rounded-xl border border-gray-200 hover:border-[#2D6A4F] text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#F4F7F4] text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print receipt"
            >
              <PrinterOutlined className="text-sm" /> Print
            </button>

            <Link
              href="/"
              className="flex-1 sm:flex-initial py-3 px-4 rounded-xl border border-emerald-200 bg-[#D8F3DC]/40 text-[#2D6A4F] hover:bg-[#D8F3DC] text-[13px] font-semibold text-center transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <HomeOutlined className="text-sm" /> Back to Home
            </Link>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════
            MONEY RECEIPT / INVOICE CARD (Captured by PDF)
            id="invoice-receipt"
        ════════════════════════════════════════════ */}
        <div
          id="invoice-receipt"
          className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-green-950/5 overflow-hidden print:border-none print:shadow-none print:rounded-none"
        >
          {/* Top green decorative bar */}
          <div className="h-2.5 bg-gradient-to-r from-[#40916C] via-[#52B788] to-[#2D6A4F] print:h-2" />

          <div className="p-6 sm:p-10">

            {/* ── Receipt Header: Nursery Brand + Invoice Info ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-sm">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1A2E22] tracking-tight">
                    {brandName}
                  </h2>
                  <p className="text-[12px] text-[#6B7280]">
                    Official Money Receipt & Customer Invoice
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {storeAddress} · {contactEmail}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F7F4] border border-gray-200 text-xs font-mono font-bold text-[#1A2E22] mb-1">
                  Invoice #{invoiceNumber}
                </div>
                <p className="text-[11px] text-[#6B7280] flex items-center sm:justify-end gap-1">
                  <CalendarOutlined /> {orderDate}
                </p>
                <p className="text-[11px] text-[#9CA3AF] font-mono">
                  Order Ref: #{rawId}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#6B7280]">
                <LoadingOutlined style={{ fontSize: 32, color: "#2D6A4F" }} spin />
                <p className="mt-3 text-sm font-medium">Fetching receipt details…</p>
              </div>
            ) : error && !order ? (
              <div className="py-10 text-center">
                <AlertCircle className="w-9 h-9 text-amber-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1A2E22] mb-1">Receipt Notice</h3>
                <p className="text-sm text-[#6B7280] max-w-sm mx-auto mb-4">
                  {error}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  Reference ID: <span className="font-mono font-semibold">{id}</span>
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">

                {/* ── Payment Method & Delivery Badge ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFBFA] border border-gray-100 rounded-2xl p-4">
                  <div>
                    <span className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      Payment Method
                    </span>
                    {order?.paymentMethod === "bkash" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold">
                        <Phone className="w-3 h-3" /> bKash / Nagad (Pending Verification)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                        <Banknote className="w-3 h-3" /> Cash on Delivery (Unpaid)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      Delivery Window
                    </span>
                    <span className="text-[13px] font-semibold text-[#2D6A4F] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> 2–3 Business Days (Express Courier)
                    </span>
                  </div>
                </div>

                {/* ── Customer & Delivery Information ── */}
                {shipping && (
                  <div className="rounded-2xl border border-gray-100 bg-[#F4F7F4]/60 p-5">
                    <h3 className="text-[13px] font-bold text-[#1A2E22] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <EnvironmentOutlined className="text-[#2D6A4F]" /> Customer & Delivery Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <p className="text-[#6B7280] text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                          Recipient
                        </p>
                        <p className="font-semibold text-[#1A2E22] flex items-center gap-1.5">
                          <UserOutlined className="text-gray-400" /> {shipping.fullName}
                        </p>
                        <p className="text-[#4B5563] flex items-center gap-1.5 mt-1 font-mono">
                          <PhoneOutlined className="text-gray-400" /> {shipping.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#6B7280] text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                          Destination Address
                        </p>
                        <p className="text-[#1A2E22] font-medium leading-relaxed">
                          {shipping.street}
                        </p>
                        <p className="text-[#4B5563] mt-0.5">
                          {[shipping.upazila, shipping.district, shipping.division]
                            .filter(Boolean)
                            .join(", ")}
                          {shipping.postalCode && shipping.postalCode !== "N/A"
                            ? ` (Postal Code: ${shipping.postalCode})`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {order?.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200/80 text-[12px]">
                        <span className="font-semibold text-[#6B7280]">Customer Note: </span>
                        <span className="text-[#4B5563] italic">"{order.notes}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Order Breakdown Table ── */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-[#F8F9FA] px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#1A2E22] flex items-center gap-1.5">
                      <ShoppingOutlined className="text-[#2D6A4F]" /> Ordered Items Breakdown
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      {order?.products?.length || 0} item{(order?.products?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FBFBFA] text-[11px] text-[#6B7280] uppercase font-bold border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3">#</th>
                          <th className="px-4 py-3">Plant / Item Description</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-5 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order?.products?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/40">
                            <td className="px-5 py-3.5 text-xs text-[#9CA3AF] font-mono">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-[#1A2E22] text-[13px]">
                                {item.title}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-center text-[#4B5563] font-mono">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3.5 text-right text-[#4B5563]">
                              ৳{item.price?.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-[#1A2E22]">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Totals */}
                  <div className="bg-[#FBFBFA] px-5 py-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-[13px] text-[#6B7280]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#1A2E22]">
                        ৳{order?.subtotal?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-[13px] text-[#6B7280]">
                      <span>
                        Delivery Charge ({isDhaka ? "Inside Dhaka ৳60" : "Outside Dhaka ৳120"})
                      </span>
                      <span className="font-medium text-[#1A2E22]">
                        {order?.deliveryCharge === 0 ? "Free" : `৳${order?.deliveryCharge}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-extrabold text-[#1A2E22] border-t border-gray-200 pt-3">
                      <span>Total {order?.paymentMethod === "cod" ? "Due on Delivery" : "Paid"}</span>
                      <span className="text-[#2D6A4F] text-lg">
                        ৳{order?.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-4 border-t border-gray-100 text-center space-y-1">
                  <p className="text-[13px] font-bold text-[#2D6A4F] flex items-center justify-center gap-1.5">
                    <Sprout className="w-4 h-4" /> Thank you for shopping green!
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    We hope your new plants bring joy and freshness to your home. For support or plant care guidance, reach out to us at {contactEmail}.
                  </p>
                  <p className="text-[10px] text-[#9CA3AF]">
                    Quote Invoice #{invoiceNumber} for any customer care inquiries.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* ── Set Password Card for Auto-Created Guest Accounts ── */}
        {(isNewUser || order?.userHasTemporaryPassword) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-br from-[#F4F9F4] to-[#EAF5EC] border border-[#B7E4C7] rounded-3xl p-6 sm:p-8 shadow-sm print:hidden"
          >
            {passwordSetSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center text-xl mx-auto font-bold shadow-xs">
                  <CheckCircleOutlined />
                </div>
                <h3 className="text-lg font-bold text-[#1A2E22]">
                  Password Set Successfully!
                </h3>
                <p className="text-xs text-[#4A5568] max-w-md mx-auto">
                  Your account is now fully secured. You can log in anytime using{" "}
                  <strong className="text-[#1A2E22]">
                    {order?.userEmail || order?.shippingAddress?.email || order?.customerEmail}
                  </strong>{" "}
                  or your phone number to track your orders.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all"
                  >
                    <ShoppingOutlined /> Go to Customer Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                    <Sprout className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D8F3DC] text-[#2D6A4F] border border-[#B7E4C7] mb-1">
                      Account Created Automatically
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1A2E22]">
                      Set a password to easily track this & future orders
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-1">
                      We&apos;ve created an account for you with{" "}
                      <strong className="text-[#1A2E22]">
                        {order?.userEmail || order?.shippingAddress?.email || order?.customerEmail}
                      </strong>.
                      Set a secure password now so you can manage delivery status and view past receipts anytime!
                    </p>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleSetPassword} className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        <LockOutlined />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a new password (min. 6 chars)"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={settingPassword}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm disabled:opacity-60 transition-all shrink-0 cursor-pointer"
                    >
                      {settingPassword ? <LoadingOutlined /> : <KeyOutlined />} Set Password
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>Minimum 6 characters</span>
                    <Link href="/dashboard" className="text-[#2D6A4F] hover:underline font-medium">
                      Skip for now & view dashboard →
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer info (hidden on print) */}
        <p className="text-center text-[12px] text-[#9CA3AF] mt-6 print:hidden">
          {brandName} — Bringing Nature to Your Living Spaces
        </p>

      </div>
    </div>
  );
}
