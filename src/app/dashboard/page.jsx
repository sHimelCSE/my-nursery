"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  UserOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  SyncOutlined,
  DownloadOutlined,
  DollarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { App, Tag } from "antd";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { message } = App.useApp();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // Authentication protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  // Fetch orders for logged-in user
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("/api/orders/user");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      message.error("Could not load your orders. Please refresh.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  // Computed summary metrics
  const totalOrders = orders.length;
  const totalSpent = useMemo(
    () => orders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0),
    [orders]
  );
  const pendingOrders = useMemo(
    () => orders.filter((o) => (o.status || "").toLowerCase() === "pending").length,
    [orders]
  );
  const deliveredOrders = useMemo(
    () => orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length,
    [orders]
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by status tab
      if (activeFilter !== "all") {
        const orderStatus = (order.status || "Pending").toLowerCase();
        if (activeFilter === "pending" && orderStatus !== "pending") return false;
        if (
          activeFilter === "processing" &&
          orderStatus !== "processing" &&
          orderStatus !== "shipped"
        )
          return false;
        if (activeFilter === "delivered" && orderStatus !== "delivered") return false;
      }

      // Filter by search query (Order ID, products title, phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = (order._id || "").toLowerCase().includes(q);
        const titleMatch = order.products?.some((p) =>
          p.title?.toLowerCase().includes(q)
        );
        const phoneMatch = order.shippingAddress?.phone?.includes(q);
        return idMatch || titleMatch || phoneMatch;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // Status Badge Component
  const renderStatusBadge = (orderStatus = "Pending") => {
    const s = orderStatus.toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Delivered
        </span>
      );
    }
    if (s === "processing" || s === "shipped") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Processing & Dispatch
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        Order Placed (Pending)
      </span>
    );
  };

  // Direct PDF invoice downloader
  const handleQuickDownloadPdf = async (order) => {
    try {
      setDownloadingId(order._id);
      message.loading({ content: "Preparing invoice...", key: "pdf_dl" });
      // Redirect directly to the invoice page for rich printing and downloading
      router.push(`/order-success/${order._id}`);
    } catch (err) {
      message.error({ content: "Failed to download invoice", key: "pdf_dl" });
    } finally {
      setDownloadingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FBFBFA]">
        <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#2D6A4F]">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
              <Link href="/" className="hover:text-[#2D6A4F] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#1A2E22] font-medium">Customer Dashboard</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E22] tracking-tight">
              My Profile & Orders
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-[#4A5568] hover:text-[#2D6A4F] hover:border-[#40916C]/60 hover:bg-[#F4F7F4] transition-all shadow-xs"
            >
              <SyncOutlined spin={loadingOrders} />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all shadow-xs"
            >
              <LogoutOutlined />
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Customer Profile Card & Stats Grid ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm relative overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788]" />

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-green-900/10">
                {session.user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-[#1A2E22] truncate">
                  {session.user.name}
                </h2>
                <p className="text-xs text-[#6B7280] truncate">{session.user.email}</p>
                <div className="mt-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#D8F3DC] text-[#2D6A4F] border border-[#B7E4C7]">
                    {session.user.role === "admin" ? "🌿 Store Administrator" : "🌱 Valued Customer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-[#4A5568]">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280]">Account Status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircleOutlined /> Active
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280]">Shipping Region:</span>
                <span className="font-semibold text-[#1A2E22]">Bangladesh 🇧🇩</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280]">Payment Mode:</span>
                <span className="font-semibold text-[#1A2E22]">Cash on Delivery / bKash</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link
                href="/products"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] transition-all shadow-sm shadow-green-900/10"
              >
                <ShoppingOutlined /> Browse Nursery Plants
              </Link>
            </div>
          </motion.div>

          {/* Quick Metrics (3 Stat Cards) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Total Orders Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center text-sm">
                  <ShoppingOutlined />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#1A2E22]">
                  {loadingOrders ? "..." : totalOrders}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-1">Placed all-time</p>
              </div>
            </motion.div>

            {/* Total Amount Spent Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Total Spent
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                  ৳
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#2D6A4F]">
                  {loadingOrders ? "..." : `৳${totalSpent.toLocaleString("en-BD")}`}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-1">Plants & Garden tools</p>
              </div>
            </motion.div>

            {/* Active & Delivered Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Order Status
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                  <CheckCircleOutlined />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-amber-600 flex items-center gap-1">
                    <ClockCircleOutlined /> {pendingOrders} Pending
                  </span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircleOutlined /> {deliveredOrders} Delivered
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-2">Real-time status updates</p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── Order History Section ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Controls Bar: Filter tabs & Search */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Orders", count: totalOrders },
                { id: "pending", label: "Pending", count: pendingOrders },
                { id: "processing", label: "Processing", count: orders.filter(o => ["processing", "shipped"].includes((o.status || "").toLowerCase())).length },
                { id: "delivered", label: "Delivered", count: deliveredOrders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === tab.id
                      ? "bg-[#2D6A4F] text-white shadow-xs"
                      : "text-[#4A5568] hover:bg-[#F4F7F4] hover:text-[#2D6A4F]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeFilter === tab.id
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search by order ID or plant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/30 focus:border-[#40916C] transition-all"
              />
            </div>
          </div>

          {/* Orders List Container */}
          {loadingOrders ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-[#4A5568]">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] text-3xl flex items-center justify-center mx-auto shadow-inner">
                🌿
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-[#1A2E22]">
                  {searchQuery || activeFilter !== "all"
                    ? "No matching orders found"
                    : "No orders placed yet"}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  {searchQuery || activeFilter !== "all"
                    ? "Try clearing your search filters or status selection."
                    : "Browse our fresh collection of nursery plants, fertilizers, and pots to start planting today!"}
                </p>
              </div>
              <div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm hover:shadow-md transition-all"
                >
                  <ShoppingOutlined /> Start Shopping
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Orders Cards Grid */
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => {
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  const refCode = order._id ? order._id.slice(-6).toUpperCase() : "ORD";

                  return (
                    <motion.div
                      key={order._id || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-white rounded-2xl border border-gray-100/90 shadow-xs hover:shadow-md hover:border-[#40916C]/40 transition-all p-5 overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F4F7F4] flex items-center justify-center text-[#2D6A4F] font-bold text-xs border border-gray-100">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-[#1A2E22]">
                                #ORD-{refCode}
                              </span>
                              {renderStatusBadge(order.status)}
                            </div>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1.5">
                              <ClockCircleOutlined style={{ fontSize: "10px" }} />
                              {orderDate}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons on header */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/order-success/${order._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2D6A4F] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] border border-[#B7E4C7]/60 transition-all shadow-2xs"
                          >
                            <FileTextOutlined /> View Invoice
                          </Link>
                          <button
                            onClick={() => handleQuickDownloadPdf(order)}
                            disabled={downloadingId === order._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4A5568] hover:text-[#2D6A4F] bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                            title="Download PDF Invoice"
                          >
                            <DownloadOutlined /> PDF
                          </button>
                        </div>
                      </div>

                      {/* Order Body: Products list & shipping details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4 border-b border-gray-100">

                        {/* Left 2 Cols: Ordered Items */}
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                            Ordered Items ({order.products?.reduce((s, p) => s + (p.quantity || 1), 0) || 0} plants)
                          </p>
                          <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto pr-1">
                            {order.products?.map((item, idx) => (
                              <div
                                key={idx}
                                className="py-2 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-5 h-5 rounded-md bg-[#F4F7F4] text-[#2D6A4F] text-[10px] flex items-center justify-center font-bold">
                                    {item.quantity}×
                                  </span>
                                  <span className="font-medium text-[#1A2E22]">
                                    {item.title}
                                  </span>
                                </div>
                                <span className="font-semibold text-[#4A5568]">
                                  ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Col: Shipping info */}
                        <div className="md:col-span-1 bg-[#FBFBFA] rounded-xl p-3 border border-gray-100 space-y-1.5 text-xs">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                            Shipping Details
                          </p>
                          <p className="font-bold text-[#1A2E22] truncate">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-[#6B7280] flex items-center gap-1.5 truncate">
                            <PhoneOutlined style={{ fontSize: "10px" }} />
                            {order.shippingAddress?.phone}
                          </p>
                          <p className="text-[#6B7280] flex items-start gap-1.5 line-clamp-2">
                            <EnvironmentOutlined style={{ fontSize: "10px", marginTop: "2px" }} />
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}
                          </p>
                          <div className="pt-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                              {order.paymentMethod === "bkash" ? "📱 bKash / Nagad" : "💵 Cash on Delivery"}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Order Footer: Subtotal, Delivery & Total */}
                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 text-[#6B7280]">
                          <span>
                            Subtotal: <strong className="text-[#1A2E22]">৳{order.subtotal?.toLocaleString("en-BD")}</strong>
                          </span>
                          <span>
                            Delivery: <strong className="text-[#1A2E22]">{order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge}`}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B7280]">Total Amount:</span>
                          <span className="text-base font-extrabold text-[#2D6A4F]">
                            ৳{order.totalPrice?.toLocaleString("en-BD")}
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
