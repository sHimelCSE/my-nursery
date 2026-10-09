"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Plus,
  Percent,
  Truck,
  Banknote,
  Sparkles,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Check,
  Layers,
  ShoppingBag,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { App, Modal, Switch } from "antd";

export default function DiscountsTab() {
  const { message, modal } = App.useApp();

  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive' | 'expired'
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State
  const [form, setForm] = useState({
    code: "",
    type: "percentage", // 'percentage' | 'fixed_amount' | 'free_shipping'
    value: 10,
    appliesTo: "all_products", // 'all_products' | 'specific_collections' | 'specific_products'
    collectionIds: [],
    productIds: [],
    minOrderAmount: 0,
    isAutomatic: false,
    autoTrigger: "none", // 'none' | 'new_subscriber_first_order' | 'cart_threshold'
    allowStacking: false,
    maxUses: "",
    isActive: true,
    expiryDate: "",
  });

  // Fetch Discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/discounts");
      const data = await res.json();
      if (data.success && Array.isArray(data.discounts)) {
        setDiscounts(data.discounts);
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
      message.error("Failed to load discount rules.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories & products for applicability selectors
  const fetchMetadata = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products?limit=100"),
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      if (catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories);
      }
      if (prodData.success && Array.isArray(prodData.data)) {
        setProducts(prodData.data);
      }
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchMetadata();
  }, []);

  // Filtered Discounts
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      // Search
      const matchSearch =
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.type && d.type.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const now = new Date();
      const isExpired = d.expiryDate && new Date(d.expiryDate) < now;
      let matchStatus = true;
      if (statusFilter === "active") {
        matchStatus = d.isActive && !isExpired;
      } else if (statusFilter === "inactive") {
        matchStatus = !d.isActive;
      } else if (statusFilter === "expired") {
        matchStatus = isExpired;
      }

      // Type
      let matchType = true;
      if (typeFilter !== "all") {
        matchType = d.type === typeFilter;
      }

      return matchSearch && matchStatus && matchType;
    });
  }, [discounts, searchQuery, statusFilter, typeFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDiscount(null);
    setForm({
      code: "",
      type: "percentage",
      value: 10,
      appliesTo: "all_products",
      collectionIds: [],
      productIds: [],
      minOrderAmount: 0,
      isAutomatic: false,
      autoTrigger: "none",
      allowStacking: false,
      maxUses: "",
      isActive: true,
      expiryDate: "",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (disc) => {
    setEditingDiscount(disc);
    setForm({
      code: disc.code || "",
      type: disc.type || "percentage",
      value: disc.value ?? 0,
      appliesTo: disc.appliesTo || "all_products",
      collectionIds: (disc.collectionIds || []).map((c) => c._id || c),
      productIds: (disc.productIds || []).map((p) => p._id || p),
      minOrderAmount: disc.minOrderAmount ?? 0,
      isAutomatic: Boolean(disc.isAutomatic),
      autoTrigger: disc.autoTrigger || "none",
      allowStacking: Boolean(disc.allowStacking),
      maxUses: disc.maxUses !== null && disc.maxUses !== undefined ? disc.maxUses : "",
      isActive: disc.isActive !== false,
      expiryDate: disc.expiryDate ? new Date(disc.expiryDate).toISOString().slice(0, 10) : "",
    });
    setIsModalOpen(true);
  };

  // Auto-generate Promo Code
  const handleGenerateCode = () => {
    const prefixes = ["BLOOM", "GARDEN", "FLORA", "GREEN", "BOTANICAL", "NURSERY", "SPRING"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let suffix = "";
    if (form.type === "percentage") {
      suffix = form.value ? `${form.value}` : "10";
    } else if (form.type === "fixed_amount") {
      suffix = form.value ? `${form.value}` : "100";
    } else {
      suffix = "SHIP";
    }
    const randomDigits = Math.floor(10 + Math.random() * 90);
    setForm((prev) => ({ ...prev, code: `${prefix}${suffix}${randomDigits}` }));
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle active status directly from table
  const handleToggleActive = async (disc) => {
    try {
      const res = await fetch(`/api/admin/discounts/${disc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !disc.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        message.success(`Coupon ${disc.code} ${!disc.isActive ? "activated" : "deactivated"}`);
        setDiscounts((prev) =>
          prev.map((d) => (d._id === disc._id ? { ...d, isActive: !d.isActive } : d))
        );
      } else {
        message.error(data.message || "Failed to update status");
      }
    } catch {
      message.error("Failed to update status");
    }
  };

  // Delete Discount
  const handleDeleteDiscount = (disc) => {
    modal.confirm({
      title: "Delete Promotional Coupon",
      content: `Are you sure you want to permanently delete coupon "${disc.code}"? Customers will no longer be able to use it.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/discounts/${disc._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            message.success(`Coupon "${disc.code}" deleted`);
            setDiscounts((prev) => prev.filter((d) => d._id !== disc._id));
          } else {
            message.error(data.message || "Failed to delete discount");
          }
        } catch {
          message.error("Failed to delete discount");
        }
      },
    });
  };

  // Submit Modal
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      message.error("Coupon code cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: form.type === "free_shipping" ? 0 : Number(form.value) || 0,
        appliesTo: form.appliesTo,
        collectionIds: form.appliesTo === "specific_collections" ? form.collectionIds : [],
        productIds: form.appliesTo === "specific_products" ? form.productIds : [],
        minOrderAmount: Number(form.minOrderAmount) || 0,
        isAutomatic: Boolean(form.isAutomatic),
        autoTrigger: form.isAutomatic ? form.autoTrigger : "none",
        allowStacking: Boolean(form.allowStacking),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        isActive: Boolean(form.isActive),
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      };

      const url = editingDiscount
        ? `/api/admin/discounts/${editingDiscount._id}`
        : "/api/admin/discounts";
      const method = editingDiscount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      message.success(data.message || "Discount saved successfully");
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (err) {
      message.error(err.message || "Failed to save discount rule");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = discounts.filter((d) => {
    const isExpired = d.expiryDate && new Date(d.expiryDate) < new Date();
    return d.isActive && !isExpired;
  }).length;

  return (
    <div className="space-y-6">
      {/* ── Top Header / Action Bar ── */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1E3F20] tracking-tight">
                Discounts &amp; Promotional Engine (ডিসকাউন্ট ও কুপন)
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage promotional coupon codes, cart threshold vouchers, and subscriber-exclusive auto discounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#EBF0E6] border border-emerald-200/60 text-xs font-bold text-[#1E3F20] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
            <span>Active Coupons: {activeCount}</span>
          </div>

          <button
            type="button"
            onClick={fetchDiscounts}
            className="p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#2D6A4F]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-[#1E3F20] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Discount</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code (e.g. WELCOME10)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F4F6F4] p-1 rounded-2xl border border-gray-200 text-xs font-medium text-gray-600">
            {[
              { id: "all", label: "All Status" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
              { id: "expired", label: "Expired" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-[#1E3F20] font-bold shadow-2xs"
                    : "hover:text-[#1E3F20]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-2xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount (৳)</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
        </div>
      </div>

      {/* ── Discounts Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading && discounts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2D6A4F] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading promotional discounts...</p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">No discounts found</p>
            <p className="text-xs text-gray-400 max-w-sm">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search query or filters to find discount coupons."
                : "No promotional rules created yet. Click '+ Create New Discount' to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBF9] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Coupon Code</th>
                  <th className="py-3.5 px-4">Type &amp; Value</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Applies To</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredDiscounts.map((disc) => {
                  const now = new Date();
                  const isExpired = disc.expiryDate && new Date(disc.expiryDate) < now;
                  const isMaxed = disc.maxUses && disc.usedCount >= disc.maxUses;

                  return (
                    <tr
                      key={disc._id}
                      className="hover:bg-[#FAFBF9]/80 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#EBF0E6] text-[#1E3F20] px-2.5 py-1 rounded-xl border border-emerald-300/60 inline-flex items-center gap-1.5">
                            {disc.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(disc.code)}
                            className="p-1 text-gray-400 hover:text-[#1E3F20] transition-colors cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === disc.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {disc.isAutomatic && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Auto-applied ({disc.autoTrigger})</span>
                          </div>
                        )}
                      </td>

                      {/* Type & Value */}
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {disc.type === "percentage" && (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Percent className="w-3 h-3" />
                            <span>{disc.value}% OFF</span>
                          </span>
                        )}
                        {disc.type === "fixed_amount" && (
                          <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            <Banknote className="w-3 h-3" />
                            <span>৳{disc.value} OFF</span>
                          </span>
                        )}
                        {disc.type === "free_shipping" && (
                          <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                            <Truck className="w-3 h-3" />
                            <span>Free Delivery</span>
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-4 px-4 text-gray-600">
                        {disc.minOrderAmount > 0 ? (
                          <span>৳{disc.minOrderAmount}</span>
                        ) : (
                          <span className="text-gray-400">No minimum</span>
                        )}
                      </td>

                      {/* Applies To */}
                      <td className="py-4 px-4">
                        {disc.appliesTo === "all_products" && (
                          <span className="text-gray-600">All Products</span>
                        )}
                        {disc.appliesTo === "specific_collections" && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Layers className="w-3 h-3 text-[#2D6A4F]" />
                            <span>{disc.collectionIds?.length || 0} Collections</span>
                          </span>
                        )}
                        {disc.appliesTo === "specific_products" && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <ShoppingBag className="w-3 h-3 text-[#2D6A4F]" />
                            <span>{disc.productIds?.length || 0} Products</span>
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4 text-gray-600">
                        <span className="font-semibold">{disc.usedCount || 0}</span>
                        {disc.maxUses ? (
                          <span className="text-gray-400 text-[11px]"> / {disc.maxUses} uses</span>
                        ) : (
                          <span className="text-gray-400 text-[11px]"> (unlimited)</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-4">
                        {disc.expiryDate ? (
                          <div className={`text-[11px] ${isExpired ? "text-red-500 font-bold" : "text-gray-600"}`}>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(disc.expiryDate).toLocaleDateString("en-GB")}</span>
                            </div>
                            {isExpired && <span className="text-[10px] text-red-500 font-semibold">Expired</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Never expires</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="small"
                            checked={disc.isActive && !isExpired && !isMaxed}
                            disabled={isExpired || isMaxed}
                            onChange={() => handleToggleActive(disc)}
                          />
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              !disc.isActive
                                ? "bg-gray-100 text-gray-500"
                                : isExpired
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : isMaxed
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {!disc.isActive
                              ? "Inactive"
                              : isExpired
                              ? "Expired"
                              : isMaxed
                              ? "Limit Reached"
                              : "Active"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(disc)}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-[#1E3F20] transition-colors cursor-pointer"
                            title="Edit Discount"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiscount(disc)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Discount"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Discount Modal ── */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={680}
        centered
        title={
          <div className="flex items-center gap-2 text-base font-extrabold text-[#1E3F20] pb-2 border-b border-gray-100">
            <Tag className="w-4 h-4 text-[#2D6A4F]" />
            <span>{editingDiscount ? `Edit Coupon "${editingDiscount.code}"` : "Create New Discount & Promotion"}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-4 text-xs">
          {/* Coupon Code Input & Auto-generate */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Coupon Code * (কুপন কোড)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().trim() })}
                placeholder="e.g. WELCOME10, FREESHIP"
                className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono font-bold tracking-wider uppercase text-[#1E3F20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-3.5 py-2 rounded-2xl border border-emerald-200 bg-[#EBF0E6] text-[#1E3F20] font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Must be unique. Customers will enter this code at checkout or in the cart drawer.
            </p>
          </div>

          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Discount Type * (ডিসকাউন্ট ধরন)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "percentage",
                  label: "Percentage (%)",
                  icon: <Percent className="w-3.5 h-3.5" />,
                  desc: "Take % off order/items",
                },
                {
                  id: "fixed_amount",
                  label: "Fixed Amount (৳)",
                  icon: <Banknote className="w-3.5 h-3.5" />,
                  desc: "Subtract ৳ amount",
                },
                {
                  id: "free_shipping",
                  label: "Free Delivery",
                  icon: <Truck className="w-3.5 h-3.5" />,
                  desc: "Waive delivery fee",
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    form.type === t.id
                      ? "border-[#1E3F20] bg-[#EBF0E6] text-[#1E3F20] font-bold shadow-2xs"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                    {t.icon}
                    <span>{t.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value */}
          {form.type !== "free_shipping" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Discount Value * {form.type === "percentage" ? "(Percentage %)" : "(Fixed Amount ৳)"}
              </label>
              <input
                type="number"
                required
                min={1}
                max={form.type === "percentage" ? 100 : 100000}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })}
                placeholder={form.type === "percentage" ? "15" : "150"}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs text-[#1E3F20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>
          )}

          {/* Minimum Order Threshold */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Minimum Order Subtotal (৳) (সর্বনিম্ন অর্ডারের পরিমাণ)
            </label>
            <input
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) || 0 })}
              placeholder="0 (no minimum required)"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs text-[#1E3F20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Example: Set 1000 to require orders to reach at least ৳1000 before applying.
            </p>
          </div>

          {/* Applicability */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Applies To * (প্রযোজ্য পণ্য)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { id: "all_products", label: "All Products" },
                { id: "specific_collections", label: "Specific Collections" },
                { id: "specific_products", label: "Specific Products" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, appliesTo: opt.id })}
                  className={`py-2 px-2.5 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    form.appliesTo === opt.id
                      ? "border-[#1E3F20] bg-[#EBF0E6] text-[#1E3F20]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Collection multi-select */}
            {form.appliesTo === "specific_collections" && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-gray-700 block">
                  Select Applicable Plant Collections:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {categories.map((c) => {
                    const isChecked = form.collectionIds.includes(c._id);
                    return (
                      <label
                        key={c._id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-[11px] cursor-pointer hover:border-emerald-300"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, collectionIds: [...form.collectionIds, c._id] });
                            } else {
                              setForm({
                                ...form,
                                collectionIds: form.collectionIds.filter((id) => id !== c._id),
                              });
                            }
                          }}
                          className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product multi-select */}
            {form.appliesTo === "specific_products" && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-gray-700 block">
                  Select Applicable Products ({form.productIds.length} selected):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {products.map((p) => {
                    const isChecked = form.productIds.includes(p._id);
                    return (
                      <label
                        key={p._id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-[11px] cursor-pointer hover:border-emerald-300"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, productIds: [...form.productIds, p._id] });
                            } else {
                              setForm({
                                ...form,
                                productIds: form.productIds.filter((id) => id !== p._id),
                              });
                            }
                          }}
                          className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span className="truncate font-medium">{p.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rule Type: Manual Promo Code vs Automatic */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  Automatic Trigger (অটোমেটিক ডিসকাউন্ট)
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Auto-apply to cart without requiring customer to manually type the code.
                </p>
              </div>
              <Switch
                checked={form.isAutomatic}
                onChange={(checked) => setForm({ ...form, isAutomatic: checked })}
              />
            </div>

            {form.isAutomatic && (
              <div className="pt-2 border-t border-gray-200/60">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Trigger Condition:
                </label>
                <select
                  value={form.autoTrigger}
                  onChange={(e) => setForm({ ...form, autoTrigger: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none"
                >
                  <option value="new_subscriber_first_order">
                    New Newsletter Subscriber (First Order Exclusive)
                  </option>
                  <option value="cart_threshold">
                    Cart Subtotal Threshold Reached (e.g. Free Delivery above ৳1000)
                  </option>
                  <option value="none">Always auto-apply to eligible items</option>
                </select>
              </div>
            )}
          </div>

          {/* Stacking Rule */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Allow Discount Stacking (অন্যান্য অফারের সাথে কম্বাইন)
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                If disabled, this coupon cannot be combined with other promotional codes.
              </p>
            </div>
            <Switch
              checked={form.allowStacking}
              onChange={(checked) => setForm({ ...form, allowStacking: checked })}
            />
          </div>

          {/* Expiry Date, Usage Limit, Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Expiry Date (মেয়াদ শেষ)
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Max Usages (সর্বোচ্চ ব্যবহার)
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Leave blank for unlimited"
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Active Status
              </label>
              <div className="pt-1.5 flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <span className="text-xs font-bold text-gray-700">
                  {form.isActive ? "Active (সক্রিয়)" : "Inactive (নিষ্ক্রিয়)"}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-[#1E3F20] hover:bg-[#2D6A4F] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingDiscount ? "Save Changes" : "Create Discount Rule"}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
