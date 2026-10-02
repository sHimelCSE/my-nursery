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
  LockOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { App, Tag } from "antd";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { message } = App.useApp();

  // Navigation tab state: "orders" | "profile"
  const [mainTab, setMainTab] = useState("orders");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // Profile & Security state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    hasPassword: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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

  // Fetch profile and password status
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (json.success && json.data) {
        setProfileForm({
          name: json.data.name || session?.user?.name || "",
          email: json.data.email || session?.user?.email || "",
          phone: json.data.phone || "",
          address: json.data.address || "",
          postalCode: json.data.postalCode || "",
          hasPassword: json.data.hasPassword ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
      fetchProfile();
    }
  }, [status]);

  // Handle Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      message.error("Full Name cannot be empty.");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile",
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          address: profileForm.address.trim(),
          postalCode: profileForm.postalCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      message.success("Profile updated successfully! (প্রোফাইল আপডেট সম্পন্ন হয়েছে)");
      if (update) {
        await update({ name: profileForm.name.trim() });
      }
    } catch (err) {
      message.error(err.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      message.error("New password must be at least 6 characters long. (পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে)");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error("Passwords do not match. Please recheck. (পাসওয়ার্ড দুটি মিলছে না)");
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      message.success(data.message || "Password updated successfully! (পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে)");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      setProfileForm((prev) => ({ ...prev, hasPassword: true }));
    } catch (err) {
      message.error(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

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
        const phoneMatch = (order.shippingAddress?.phone || "").toLowerCase().includes(q);
        const nameMatch = (order.shippingAddress?.fullName || "").toLowerCase().includes(q);
        const itemMatch = (order.items || []).some((item) =>
          (item.title || "").toLowerCase().includes(q)
        );
        return idMatch || phoneMatch || nameMatch || itemMatch;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // Color mapping for badge states
  const getStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase();
    switch (s) {
      case "pending":
        return <Tag color="gold" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">⏳ Pending</Tag>;
      case "processing":
        return <Tag color="blue" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">🌱 Processing</Tag>;
      case "shipped":
        return <Tag color="cyan" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">🚚 Shipped</Tag>;
      case "delivered":
        return <Tag color="success" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">✅ Delivered</Tag>;
      case "cancelled":
        return <Tag color="error" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">❌ Cancelled</Tag>;
      default:
        return <Tag color="default" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">{status}</Tag>;
    }
  };

  const handleQuickDownloadPdf = async (order) => {
    try {
      setDownloadingId(order._id);
      message.loading({ content: "Opening invoice receipt...", key: "pdf_dl" });
      router.push(`/order-success/${order._id}`);
    } catch (err) {
      message.error({ content: "Failed to open invoice", key: "pdf_dl" });
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

  const userDisplayName = profileForm.name || session.user.name || "Customer";
  const userDisplayEmail = profileForm.email || session.user.email || "";

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
              My Profile & Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchOrders();
                fetchProfile();
              }}
              disabled={loadingOrders || profileLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-[#4A5568] hover:text-[#2D6A4F] hover:border-[#40916C]/60 hover:bg-[#F4F7F4] transition-all shadow-xs cursor-pointer"
            >
              <SyncOutlined spin={loadingOrders || profileLoading} />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all shadow-xs cursor-pointer"
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-green-900/10 overflow-hidden">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={userDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userDisplayName.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-[#1A2E22] truncate">
                  {userDisplayName}
                </h2>
                <p className="text-xs text-[#6B7280] truncate">{userDisplayEmail}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#D8F3DC] text-[#2D6A4F] border border-[#B7E4C7]">
                    {session.user.role === "admin" ? "🌿 Store Administrator" : "🌱 Valued Customer"}
                  </span>
                  {!profileForm.hasPassword && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ✓ Google User
                    </span>
                  )}
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
                <span className="text-[#6B7280]">Phone:</span>
                <span className="font-semibold text-[#1A2E22]">
                  {profileForm.phone || "Not set yet"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280]">Postal Code:</span>
                <span className="font-semibold text-[#1A2E22]">
                  {profileForm.postalCode || "Not set yet"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280]">Shipping Region:</span>
                <span className="font-semibold text-[#1A2E22]">Bangladesh 🇧🇩</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setMainTab(mainTab === "profile" ? "orders" : "profile")}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  mainTab === "profile"
                    ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm"
                    : "bg-[#F4F7F4] text-[#2D6A4F] border-[#B7E4C7] hover:bg-[#E8F5E9]"
                }`}
              >
                <SettingOutlined />
                {mainTab === "profile" ? "← Back to My Orders" : "Edit Profile & Security"}
              </button>
              <Link
                href="/products"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all text-center"
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

        {/* ── Main Navigation Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <button
            onClick={() => setMainTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainTab === "orders"
                ? "bg-[#2D6A4F] text-white shadow-sm shadow-green-950/15"
                : "bg-white text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#F4F7F4] border border-gray-200"
            }`}
          >
            <ShoppingOutlined />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setMainTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainTab === "profile"
                ? "bg-[#2D6A4F] text-white shadow-sm shadow-green-950/15"
                : "bg-white text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#F4F7F4] border border-gray-200"
            }`}
          >
            <SettingOutlined />
            Profile & Security Settings
          </button>
        </div>

        {/* ── TAB 1: ORDER HISTORY ────────────────────────────────────────── */}
        {mainTab === "orders" && (
          <div className="space-y-4">

            {/* Controls Bar: Filter tabs & Search */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All Orders", count: totalOrders },
                  { id: "pending", label: "Pending", count: pendingOrders },
                  {
                    id: "processing",
                    label: "Processing",
                    count: orders.filter((o) =>
                      ["processing", "shipped"].includes((o.status || "").toLowerCase())
                    ).length,
                  },
                  { id: "delivered", label: "Delivered", count: deliveredOrders },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                        key={order._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xs font-extrabold text-[#1A2E22] bg-[#F4F7F4] px-2.5 py-1 rounded-lg border border-gray-200">
                              #{refCode}
                            </span>
                            <span className="text-xs text-[#6B7280] flex items-center gap-1">
                              <ClockCircleOutlined style={{ fontSize: "11px" }} />
                              {orderDate}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickDownloadPdf(order)}
                              disabled={downloadingId === order._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#2D6A4F] bg-[#D8F3DC]/60 hover:bg-[#D8F3DC] border border-[#B7E4C7] transition-all cursor-pointer"
                            >
                              <DownloadOutlined />
                              Invoice Receipt
                            </button>
                            <Link
                              href={`/order-success/${order._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-[#2D6A4F] hover:bg-gray-100 transition-all"
                            >
                              Details <ArrowRightOutlined style={{ fontSize: "10px" }} />
                            </Link>
                          </div>
                        </div>

                        {/* Order Body: Items preview & Shipping info */}
                        <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                          {/* Ordered Products summary */}
                          <div className="md:col-span-2 space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#F4F7F4] border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm">🌿</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-[#1A2E22] truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-[#6B7280]">
                                    Qty: <strong>{item.quantity}</strong> × ৳{item.price}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-[#2D6A4F]">
                                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Delivery info snapshot */}
                          <div className="md:col-span-1 bg-[#FBFBFA] rounded-xl p-3 border border-gray-100/80 text-xs space-y-1">
                            <p className="font-semibold text-[#1A2E22] flex items-center gap-1.5">
                              <UserOutlined style={{ fontSize: "11px", color: "#2D6A4F" }} />
                              {order.shippingAddress?.fullName}
                            </p>
                            <p className="text-[#6B7280] flex items-center gap-1.5">
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
                        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-gray-100">
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
        )}

        {/* ── TAB 2: PROFILE & SECURITY SETTINGS ──────────────────────────── */}
        {mainTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Section A: Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center text-lg shadow-xs">
                  <UserOutlined />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A2E22]">Personal Information</h3>
                  <p className="text-xs text-[#6B7280]">Update your personal details & default shipping address</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151]">
                      Email Address
                    </label>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <LockOutlined style={{ fontSize: "10px" }} /> Read-only account ID
                    </span>
                  </div>
                  <div className="relative">
                    <MailOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-500 cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Email address cannot be changed as it is securely linked to your orders and account identity.
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Phone Number (ফোন নম্বর)
                  </label>
                  <div className="relative">
                    <PhoneOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                  </div>
                </div>

                {/* Default Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Default Delivery Address (ঠিকানা)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="House, Road, Area, Thana, District"
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Postal Code (পোস্টাল কোড)
                  </label>
                  <div className="relative">
                    <EnvironmentOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      maxLength={6}
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      placeholder="e.g. 1214, 6280"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {profileSaving ? (
                      <>
                        <SyncOutlined spin /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <SaveOutlined /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Section B: Change Password (Security) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shadow-xs">
                  <SafetyCertificateOutlined />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A2E22]">Security & Password</h3>
                  <p className="text-xs text-[#6B7280]">Manage authentication and password access</p>
                </div>
              </div>

              {/* Google OAuth Banner */}
              {!profileForm.hasPassword ? (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <span>Account connected with Google (Gmail)</span>
                  </div>
                  <p className="text-[#2D6A4F] pl-7">
                    Your account was created via Google Sign-In. You can set an initial password below to also enable Email & Password login anytime.
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs text-gray-600 flex items-center gap-2.5">
                  <KeyOutlined className="text-[#2D6A4F] text-base" />
                  <span>Choose a secure password with at least 6 characters.</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    New Password (নতুন পাসওয়ার্ড) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                    >
                      {showNewPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Confirm Password (কনফার্ম পাসওয়ার্ড) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Re-type your new password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                    >
                      {showConfirmPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                {/* Password Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {passwordSaving ? (
                      <>
                        <SyncOutlined spin /> Updating Password...
                      </>
                    ) : (
                      <>
                        <LockOutlined /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        )}

      </div>
    </div>
  );
}
