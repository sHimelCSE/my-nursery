"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";

const TIMELINE_STEPS = [
  {
    stepIndex: 0,
    title: "Order Placed",
    description: "Order received in our nursery system and verified.",
    icon: FileText,
  },
  {
    stepIndex: 1,
    title: "Processing / Packaging",
    description: "Plants acclimated, soil moistened, and securely packaged.",
    icon: PackageCheck,
  },
  {
    stepIndex: 2,
    title: "Shipped / On the Way",
    description: "Dispatched with express delivery partner with live transit care.",
    icon: Truck,
  },
  {
    stepIndex: 3,
    title: "Delivered",
    description: "Successfully handed over at your doorstep.",
    icon: CheckCircle2,
  },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("orderId") || searchParams.get("phone") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  const fetchTracking = async (searchTarget) => {
    const q = (searchTarget || "").trim();
    if (!q) {
      setErrorMsg("Please enter an Order ID or Mobile Number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/track-order?query=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
        setSelectedOrderIndex(0);
      } else {
        setOrders([]);
        setErrorMsg(data.message || "No orders found. Please verify your details.");
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      setErrorMsg("Unable to reach tracking server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(query);
  };

  const currentOrder = orders[selectedOrderIndex] || null;

  const handleCopyOrderId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ─── Header & Search Card ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-wider">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Botanical Order Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900 tracking-tight">
            Track Your Plant Order
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Check the live fulfillment and delivery journey of your botanical specimens, fertilizers, and gardening tools.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto pt-3">
            <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-0 items-center border-2 border-[#2D5A27]/20 focus-within:border-[#2D5A27] rounded-2xl bg-white p-1.5 transition-all shadow-xs">
              <div className="flex items-center gap-3 w-full px-3 py-1 sm:py-0">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Mobile Number (e.g. 017...) or Order ID"
                  className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#7BAE37] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:bg-gray-300"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* ─── Multi-Order Selector (if customer placed multiple orders) ──── */}
        {orders.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0 px-2">
              <Layers className="w-3.5 h-3.5" /> Multiple Orders Found:
            </span>
            {orders.map((ord, idx) => (
              <button
                key={ord._id}
                onClick={() => setSelectedOrderIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedOrderIndex === idx
                    ? "bg-[#2D5A27] text-white"
                    : "bg-[#F4F7F4] text-gray-700 hover:bg-gray-200"
                }`}
              >
                #{ord.orderId.slice(-6).toUpperCase()} · ৳{ord.totalPrice} ({ord.status})
              </button>
            ))}
          </div>
        )}

        {/* ─── Tracking Results Content ────────────────────────────────────── */}
        {currentOrder && (
          <div className="space-y-6">
            {/* Top Status & Estimated Delivery Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Order ID:</span>
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      #{currentOrder.orderId}
                    </span>
                    <button
                      onClick={() => handleCopyOrderId(currentOrder.orderId)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Copy full Order ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Placed on: {new Date(currentOrder.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Current Status</span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentOrder.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : currentOrder.status === "Shipped"
                          ? "bg-sky-100 text-sky-800"
                          : currentOrder.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {currentOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery Highlight */}
              {currentOrder.status !== "Cancelled" && (
                <div className="p-4 rounded-2xl bg-[#F1F8E9] border border-[#2D5A27]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                        Estimated Delivery Arrival
                      </h4>
                      <p className="text-sm font-extrabold text-gray-900">
                        {currentOrder.estimatedDelivery}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500 font-medium">
                    Destination: {currentOrder.shippingAddress?.city || currentOrder.shippingAddress?.district || "Bangladesh"}
                  </span>
                </div>
              )}

              {/* ─── Visual Progress Timeline (4 Steps) ───────────────────── */}
              {currentOrder.status === "Cancelled" ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <h4 className="text-sm font-bold text-red-800">This Order Has Been Cancelled</h4>
                  <p className="text-xs text-red-600 max-w-md mx-auto">
                    If you did not request this cancellation or have payment questions, please contact our support team.
                  </p>
                </div>
              ) : (
                <div className="pt-4 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-8 text-center sm:text-left">
                    Fulfillment Progress
                  </h4>

                  <div className="relative">
                    {/* Connecting progress bar */}
                    <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-0">
                      <div
                        className="h-full bg-[#2D5A27] transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (currentOrder.timeline.currentStep / 3) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                      {TIMELINE_STEPS.map((step) => {
                        const IconComponent = step.icon;
                        const isDone = currentOrder.timeline.currentStep >= step.stepIndex;
                        const isCurrent = currentOrder.timeline.currentStep === step.stepIndex;

                        return (
                          <div
                            key={step.stepIndex}
                            className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2 text-left"
                          >
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                                isDone
                                  ? "bg-[#2D5A27] border-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20"
                                  : isCurrent
                                  ? "bg-white border-[#7BAE37] text-[#7BAE37] animate-pulse"
                                  : "bg-white border-gray-200 text-gray-300"
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>

                            <div>
                              <p
                                className={`text-xs font-bold tracking-tight ${
                                  isDone ? "text-gray-900" : "text-gray-400"
                                }`}
                              >
                                {step.title}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug hidden sm:block">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── 2-Column Details: Shipping Info & Order Items ──────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Shipping Address & Payment (col-span-5) */}
              <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#7BAE37]" />
                  <span>Delivery Address</span>
                </h3>

                <div className="space-y-2 text-xs text-gray-600">
                  <p className="font-bold text-gray-900 text-sm">
                    {currentOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-gray-500">
                    Phone: <span className="font-medium text-gray-800">{currentOrder.shippingAddress?.phone}</span>
                  </p>
                  <p className="leading-relaxed">
                    {currentOrder.shippingAddress?.street}
                  </p>
                  <p className="font-medium text-gray-700">
                    {[
                      currentOrder.shippingAddress?.city,
                      currentOrder.shippingAddress?.district,
                      currentOrder.shippingAddress?.division,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 uppercase font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#7BAE37]" /> Payment Method:
                    </span>
                    <span className="font-bold uppercase text-gray-800">
                      {currentOrder.paymentMethod === "bkash" ? "bKash Digital Payment" : "Cash on Delivery (COD)"}
                    </span>
                  </div>

                  {currentOrder.notes && (
                    <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-500">
                      <span className="font-bold text-gray-700 block mb-0.5">Special Instructions:</span>
                      {currentOrder.notes}
                    </div>
                  )}
                </div>

                {/* Need Help Banner */}
                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Need help with order?</p>
                      <p className="text-[11px] text-gray-500">Our horticulturists are live</p>
                    </div>
                    <a
                      href="https://wa.me/8801712345678?text=Hello%2C%20I%20need%20assistance%20tracking%20my%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#7BAE37] text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Items & Price Breakdown (col-span-7) */}
              <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
                  <span>Order Items ({currentOrder.products.length})</span>
                  <span className="text-[11px] text-gray-400 font-normal">Standard Botanical Packaging</span>
                </h3>

                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {currentOrder.products.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          ৳{item.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>

                      <span className="text-xs font-extrabold text-[#2D5A27] shrink-0 font-mono">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-gray-800">৳{currentOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Express Delivery Charge</span>
                    <span className="font-mono text-gray-800">
                      {currentOrder.deliveryCharge === 0 ? "FREE" : `৳${currentOrder.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span className="text-[#2D5A27] font-mono">
                      ৳{currentOrder.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/#products"
                    className="text-xs font-bold text-[#7BAE37] hover:text-[#2D5A27] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Browse more plants</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
