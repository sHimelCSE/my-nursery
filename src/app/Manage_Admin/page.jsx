"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { App, Modal, Tag, Select, Switch } from "antd";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TeamOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  FilterOutlined,
  BellOutlined,
  CheckOutlined,
  InboxOutlined,
  WalletOutlined,
  RiseOutlined,
  FallOutlined,
  DollarCircleOutlined,
  LayoutOutlined,
  TagsOutlined,
  SettingOutlined,
  StarOutlined,
} from "@ant-design/icons";
import ThemeBuilderTab from "@/components/ThemeBuilderTab";
import SiteSettingsTab from "@/components/SiteSettingsTab";
import ReviewsTab from "@/components/ReviewsTab";
import BlogsManagerTab from "@/components/BlogsManagerTab";
import SubscribersTab from "@/components/SubscribersTab";
import DiscountsTab from "@/components/DiscountsTab";
import RichTextEditor from "@/components/editor/RichTextEditor";
import imageCompression from "browser-image-compression";
import {
  UploadCloud,
  Image as ImageIcon,
  X as CloseIcon,
  Loader2,
  Sprout,
  Tag as TagIcon,
  FolderTree,
  Layers,
  Trash2,
  Edit3,
  Globe,
  Check,
  ExternalLink,
  BookOpen,
  Mail,
  User,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Package,
  Plus,
  Sparkles,
  Sun,
  Droplets,
  PawPrint,
  Heart,
  Award,
  CheckCircle2,
} from "lucide-react";

// ── Chart Custom Tooltip ──────────────────────────────────────────────────
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-950/10 text-xs space-y-1.5 min-w-[170px]">
        <p className="font-extrabold text-[#1A2E22] text-sm border-b border-gray-100 pb-1">
          {data.fullLabel || label}
        </p>
        <div className="flex items-center justify-between gap-3 text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" /> Revenue:
          </span>
          <span className="font-bold">৳{(data.revenue || 0).toLocaleString("en-BD")}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-blue-800">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Orders:
          </span>
          <span className="font-bold">{data.orders || 0}</span>
        </div>
        {data.deliveredRevenue > 0 && (
          <div className="flex items-center justify-between gap-3 text-emerald-600 text-[11px] pt-1 border-t border-gray-50">
            <span>Delivered:</span>
            <span className="font-semibold">৳{data.deliveredRevenue.toLocaleString("en-BD")}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}


// ── Notification Helpers ───────────────────────────────────────────────────
function formatTimeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getNotificationBadge(type) {
  switch (type) {
    case "order":
      return {
        icon: <Package className="w-3.5 h-3.5 text-emerald-700" />,
        bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        label: "Order",
      };
    case "admin_request":
      return {
        icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />,
        bg: "bg-amber-50 border-amber-200 text-amber-800",
        label: "Admin Request",
      };
    case "stock_alert":
      return {
        icon: <ShoppingBag className="w-3.5 h-3.5 text-rose-700" />,
        bg: "bg-rose-50 border-rose-200 text-rose-800",
        label: "Stock Alert",
      };
    default:
      return {
        icon: <BellOutlined className="text-xs text-blue-700" />,
        bg: "bg-blue-50 border-blue-200 text-blue-800",
        label: "System",
      };
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();

  // Current authenticated admin
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab: "overview" | "orders" | "products" | "expenses" | "customers" | "notifications" | "team" | "reviews"
  const [activeTab, setActiveTab] = useState("overview");

  // Reviews count state
  const [reviewsCount, setReviewsCount] = useState(0);

  // Blogs count state
  const [blogsCount, setBlogsCount] = useState(0);

  // Subscribers count state
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Discounts count state
  const [discountsCount, setDiscountsCount] = useState(0);

  // Overview & Stats metrics state
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [mounted, setMounted] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Product form state (including descriptions, variants & care customization)
  const [productForm, setProductForm] = useState({
    title: "",
    category: "plant",
    categories: [],
    costPrice: "",
    price: "",
    stock_quantity: "",
    description: "",
    shortDescription: "",
    fullDescriptionHtml: "",
    hasVariants: false,
    variantGroupTitle: "Select Option",
    variants: [
      { name: "Small Pot", price: "", originalPrice: "", stock: "10", sku: "" },
    ],
    tags: [],
    hasCareGuide: true,
    careGuide: {
      lightLocation: "",
      hydrationWatering: "",
      safetyDifficulty: "",
      horticulturistNote: "",
    },
    showCareGuideBadges: true,
    careBadges: {
      sunlight: "Medium Indirect",
      water: "Once a week",
      petSafe: "Non-Toxic",
      difficulty: "Beginner",
    },
    customTabTitle: "Botanical Background & Characteristics",
    care_instructions: "",
    images: "",
  });
  const [productTagInput, setProductTagInput] = useState("");

  // Product Image Upload & Compression state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const [catProductSearch, setCatProductSearch] = useState("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    showInNavbar: true,
    order: 0,
    isUnlisted: false,
    productIds: [],
  });

  // Team & permissions state
  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [actionAdminId, setActionAdminId] = useState(null);

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSubTab, setCustomerSubTab] = useState("registered"); // "registered" | "subscribers"

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");

  // ─────────────────────────────────────────────
  // 1. Authenticate Admin
  // ─────────────────────────────────────────────
  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/admin-auth/me");
      const data = await res.json();

      if (!res.ok || !data.success || !data.admin) {
        router.replace("/Manage_Admin/login");
        return;
      }

      setAdmin(data.admin);
    } catch (err) {
      console.error("Auth verification failed:", err);
      router.replace("/Manage_Admin/login");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const handleNavigateTab = (e) => {
      if (e?.detail) {
        setActiveTab(e.detail);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("admin:navigate-tab", handleNavigateTab);
    return () => window.removeEventListener("admin:navigate-tab", handleNavigateTab);
  }, []);

  // ─────────────────────────────────────────────
  // 2. Fetchers for Tabs
  // ─────────────────────────────────────────────
  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      setLoadingStats(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        setOverview(json.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingOverview(false);
      setLoadingStats(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await fetch("/api/admin/expenses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setExpenses(json.data);
      }
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.categories || json.data)) {
        setCategories(json.categories || json.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch("/api/admin-auth/manage-admin");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTeam(json.data);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
        setUnreadNotifsCount(json.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchReviewsCount = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.success && json.summary) {
        setReviewsCount(json.summary.totalReviews || 0);
      }
    } catch (err) {
      console.error("Failed to load reviews count:", err);
    }
  };

  const fetchSubscribersCount = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      const json = await res.json();
      if (json.success && Array.isArray(json.subscribers)) {
        setSubscribersCount(json.subscribers.length);
      }
    } catch (err) {
      console.error("Failed to load subscribers count:", err);
    }
  };

  const fetchDiscountsCount = async () => {
    try {
      const res = await fetch("/api/admin/discounts");
      const json = await res.json();
      if (json.success && Array.isArray(json.discounts)) {
        const active = json.discounts.filter((d) => {
          const isExpired = d.expiryDate && new Date(d.expiryDate) < new Date();
          return d.isActive && !isExpired;
        });
        setDiscountsCount(active.length);
      }
    } catch (err) {
      console.error("Failed to load discounts count:", err);
    }
  };

  const handleMarkNotificationRead = async (id, targetLink = null) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
      setIsNotifDropdownOpen(false);

      if (targetLink) {
        if (targetLink.includes("tab=orders")) {
          handleTabChange("orders");
        } else if (targetLink.includes("tab=team")) {
          handleTabChange("team");
        } else if (targetLink.includes("tab=customers")) {
          handleTabChange("customers");
        } else if (targetLink.includes("tab=products")) {
          handleTabChange("products");
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotifsCount(0);
        message.success("All notifications marked as read");
      }
    } catch (err) {
      message.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (data.unreadCount !== undefined) {
          setUnreadNotifsCount(data.unreadCount);
        }
        message.success("Notification deleted");
      }
    } catch (err) {
      message.error("Failed to delete notification");
    }
  };

  const handleClearAllNotifications = async () => {
    modal.confirm({
      title: "Clear all notifications?",
      content: "This will permanently delete all notification records.",
      okText: "Clear All",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch("/api/admin/notifications?clearAll=true", {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            setNotifications([]);
            setUnreadNotifsCount(0);
            message.success("All notifications cleared");
          }
        } catch (err) {
          message.error("Failed to clear notifications");
        }
      },
    });
  };

  // Initial load when admin authenticated
  useEffect(() => {
    if (admin) {
      fetchOverview();
      fetchOrders();
      fetchProducts();
      fetchCategories();
      fetchExpenses();
      fetchCustomers();
      fetchNotifications();
      fetchTeam();
      fetchReviewsCount();
      fetchSubscribersCount();
      fetchDiscountsCount();
    }
  }, [admin]);

  // Tab switch refresher
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "overview") fetchOverview();
    if (tabKey === "orders") fetchOrders();
    if (tabKey === "products") fetchProducts();
    if (tabKey === "categories") fetchCategories();
    if (tabKey === "discounts") fetchDiscountsCount();
    if (tabKey === "expenses") fetchExpenses();
    if (tabKey === "customers") fetchCustomers();
    if (tabKey === "notifications") fetchNotifications();
    if (tabKey === "team") fetchTeam();
    if (tabKey === "reviews") fetchReviewsCount();
    if (tabKey === "subscribers") fetchSubscribersCount();
  };

  // ─────────────────────────────────────────────
  // 3. Actions
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/admin-auth/logout", { method: "POST" });
      message.success("Logged out successfully");
      router.replace("/Manage_Admin/login");
    } catch (err) {
      router.replace("/Manage_Admin/login");
    }
  };

  // Change order status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status");
      }
      message.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchOverview();
    } catch (err) {
      message.error(err.message || "Status update failed");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Variant options repeater helpers
  const handleAddVariant = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { name: "", price: "", originalPrice: "", stock: "10", sku: "" },
      ],
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setProductForm((prev) => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index) => {
    setProductForm((prev) => {
      const current = prev.variants || [];
      if (current.length <= 1) {
        message.warning("At least one variant option is required when variants are enabled.");
        return prev;
      }
      return {
        ...prev,
        variants: current.filter((_, i) => i !== index),
      };
    });
  };

  // Open Product Modal (New or Edit)
  const openProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);

      // Extract assigned category IDs
      const assignedCatIds =
        Array.isArray(prod.categories) && prod.categories.length > 0
          ? prod.categories.map((c) => (c?._id ? c._id.toString() : c?.toString()))
          : [];
      if (assignedCatIds.length === 0 && prod.category) {
        const matched = categories.find(
          (c) =>
            c.slug === prod.category ||
            c.name?.toLowerCase() === prod.category?.toLowerCase() ||
            c._id?.toString() === prod.category ||
            c._id?.toString() === prod.categoryId
        );
        if (matched) {
          assignedCatIds.push(matched._id.toString());
        }
      }

      setProductForm({
        title: prod.title || "",
        category: prod.category || "plant",
        categories: assignedCatIds,
        costPrice: prod.costPrice !== undefined ? prod.costPrice.toString() : "0",
        price: prod.price?.toString() || "",
        stock_quantity: prod.stock_quantity?.toString() || "",
        description: prod.description || "",
        shortDescription: prod.shortDescription || prod.description || "",
        fullDescriptionHtml: prod.fullDescriptionHtml || prod.description || "",
        hasVariants: Boolean(prod.hasVariants),
        variantGroupTitle: prod.variantGroupTitle || "Select Option",
        variants:
          Array.isArray(prod.variants) && prod.variants.length > 0
            ? prod.variants.map((v) => ({
                name: v.name || "",
                price: v.price !== undefined ? v.price.toString() : "",
                originalPrice: v.originalPrice !== undefined ? v.originalPrice.toString() : "",
                stock: v.stock !== undefined ? v.stock.toString() : "10",
                sku: v.sku || "",
              }))
            : [
                {
                  name: "Standard",
                  price: prod.price?.toString() || "",
                  originalPrice: prod.originalPrice?.toString() || "",
                  stock: prod.stock_quantity?.toString() || "10",
                  sku: "",
                },
              ],
        hasCareGuide: prod.hasCareGuide !== false,
        careGuide: {
          lightLocation: prod.careGuide?.lightLocation || "",
          hydrationWatering: prod.careGuide?.hydrationWatering || "",
          safetyDifficulty: prod.careGuide?.safetyDifficulty || "",
          horticulturistNote: prod.careGuide?.horticulturistNote || prod.care_instructions || "",
        },
        showCareGuideBadges: prod.showCareGuideBadges !== false,
        careBadges: {
          sunlight: prod.careBadges?.sunlight || "Medium Indirect",
          water: prod.careBadges?.water || "Once a week",
          petSafe: prod.careBadges?.petSafe || "Non-Toxic",
          difficulty: prod.careBadges?.difficulty || "Beginner",
        },
        customTabTitle: prod.customTabTitle || "Botanical Background & Characteristics",
        care_instructions: prod.care_instructions || "",
        tags: Array.isArray(prod.tags) ? prod.tags : [],
        images: Array.isArray(prod.images) ? prod.images.join(", ") : "",
      });
      setProductTagInput("");
    } else {
      setEditingProduct(null);
      setProductForm({
        title: "",
        category: "plant",
        categories: [],
        costPrice: "",
        price: "",
        stock_quantity: "",
        description: "",
        shortDescription: "",
        fullDescriptionHtml: "",
        hasVariants: false,
        variantGroupTitle: "Select Option",
        variants: [
          { name: "Small Pot", price: "", originalPrice: "", stock: "10", sku: "" },
        ],
        tags: [],
        hasCareGuide: true,
        careGuide: {
          lightLocation: "",
          hydrationWatering: "",
          safetyDifficulty: "",
          horticulturistNote: "",
        },
        showCareGuideBadges: true,
        careBadges: {
          sunlight: "Medium Indirect",
          water: "Once a week",
          petSafe: "Non-Toxic",
          difficulty: "Beginner",
        },
        customTabTitle: "Botanical Background & Characteristics",
        care_instructions: "",
        images: "",
      });
      setProductTagInput("");
    }
    setIsProductModalOpen(true);
  };

  // Cloudinary Direct Unsigned Upload with Client-Side Compression
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      message.error("Cloudinary credentials are not configured in environment variables.");
      return;
    }

    setUploadingImage(true);
    setUploadStatusText("Compressing & Uploading...");

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Compressing & Uploading (${i + 1}/${files.length})...`);

        // Client-side compression: ~200KB, max 1080px, WebWorker
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1080,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        // Upload compressed file directly to Cloudinary
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else if (data.error?.message) {
          throw new Error(data.error.message);
        }
      }

      if (uploadedUrls.length > 0) {
        const existing = productForm.images
          ? productForm.images.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const updated = [...existing, ...uploadedUrls].join(", ");
        setProductForm((prev) => ({ ...prev, images: updated }));
        message.success(`Uploaded ${uploadedUrls.length} compressed image(s) to Cloudinary successfully!`);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      message.error(err.message || "Failed to upload image to Cloudinary.");
    } finally {
      setUploadingImage(false);
      setUploadStatusText("");
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveProductImage = async (indexToRemove) => {
    const urls = productForm.images
      ? productForm.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const targetUrl = urls[indexToRemove];
    if (!targetUrl) return;

    try {
      setDeletingImageIndex(indexToRemove);

      // 1. Call server-side Cloudinary Image Deletion API
      const res = await fetch("/api/admin/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.warn("Cloudinary deletion status:", data?.message);
      }

      // 2. Remove from local state
      const filtered = urls.filter((_, i) => i !== indexToRemove);
      setProductForm((prev) => ({ ...prev, images: filtered.join(", ") }));

      // 3. Remove from MongoDB product document if editing
      if (editingProduct?._id) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: editingProduct._id,
            images: filtered,
          }),
        });
        fetchProducts();
      }

      // 4. Show success toast as requested
      message.success("Image deleted from cloud & database.");
    } catch (err) {
      console.error("Failed to delete image:", err);
      const filtered = urls.filter((_, i) => i !== indexToRemove);
      setProductForm((prev) => ({ ...prev, images: filtered.join(", ") }));
      message.success("Image removed from form.");
    } finally {
      setDeletingImageIndex(null);
    }
  };

  // ─── Category Management Handlers ──────────────────────────────────────────
  const openCategoryModal = (cat = null) => {
    setCatProductSearch("");
    if (cat) {
      setEditingCategory(cat);
      const catId = cat._id?.toString();
      const preCheckedProductIds = (products || [])
        .filter((p) => {
          const inArray =
            Array.isArray(p.categories) &&
            p.categories.some((c) => (c?._id ? c._id.toString() : c?.toString()) === catId);
          const bySlug = cat.slug && p.category?.toLowerCase() === cat.slug?.toLowerCase();
          const byName = cat.name && p.category?.toLowerCase() === cat.name?.toLowerCase();
          const byId = p.categoryId?.toString() === catId || p.category?.toString() === catId;
          return inArray || bySlug || byName || byId;
        })
        .map((p) => p._id.toString());

      setCategoryForm({
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
        image: cat.image || "",
        showInNavbar: cat.showInNavbar !== false,
        order: cat.order ?? 0,
        isUnlisted: Boolean(cat.isUnlisted),
        productIds: preCheckedProductIds,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        image: "",
        showInNavbar: true,
        order: categories.length,
        isUnlisted: false,
        productIds: [],
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategoryUploadImage = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      message.error("Cloudinary credentials are not configured.");
      return;
    }

    setUploadingCatImage(true);
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setCategoryForm((prev) => ({ ...prev, image: data.secure_url }));
        message.success("Category image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      message.error(err.message || "Failed to upload image");
    } finally {
      setUploadingCatImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      message.error("Please enter a category name.");
      return;
    }

    try {
      setSavingCategory(true);
      const isEdit = Boolean(editingCategory?._id);
      const url = isEdit
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit && { _id: editingCategory._id, id: editingCategory._id }),
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim(),
        showInNavbar: categoryForm.showInNavbar,
        order: Number(categoryForm.order) || 0,
        isUnlisted: Boolean(categoryForm.isUnlisted),
        productIds: categoryForm.productIds || [],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save category");
      }

      message.success(
        isEdit ? "Category updated and products synced!" : "Category created successfully!"
      );
      setIsCategoryModalOpen(false);
      fetchCategories();
      fetchProducts();
    } catch (err) {
      message.error(err.message || "Could not save category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleNavbarCategory = async (cat) => {
    try {
      const nextShow = !cat.showInNavbar;
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: cat._id,
          showInNavbar: nextShow,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        message.success(
          nextShow ? `"${cat.name}" added to Navbar.` : `"${cat.name}" hidden from Navbar.`
        );
        fetchCategories();
      }
    } catch (err) {
      message.error("Failed to update category visibility.");
    }
  };

  const handleDeleteCategory = (cat) => {
    Modal.confirm({
      title: "Delete Category?",
      content: `Are you sure you want to delete "${cat.name}"? Products currently in this category will keep their records.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/categories?id=${cat._id}`, {
            method: "DELETE",
          });
          const json = await res.json();
          if (res.ok && json.success) {
            message.success("Category deleted successfully.");
            fetchCategories();
          } else {
            throw new Error(json.message || "Failed to delete");
          }
        } catch (err) {
          message.error(err.message || "Could not delete category.");
        }
      },
    });
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim() || !productForm.price) {
      message.error("Please fill in title and price.");
      return;
    }

    try {
      setSavingProduct(true);
      const url = "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const cleanedVariants = productForm.hasVariants
        ? (productForm.variants || [])
            .filter((v) => v.name && v.name.trim())
            .map((v) => ({
              name: v.name.trim(),
              price: Number(v.price) || Number(productForm.price) || 0,
              originalPrice: Number(v.originalPrice) || 0,
              stock: Number(v.stock) >= 0 ? Number(v.stock) : 10,
              sku: (v.sku || "").trim(),
            }))
        : [];

      // Resolve primary category slug for backward compatibility
      let primaryCategorySlug = productForm.category || "plant";
      const selectedCatIds = Array.isArray(productForm.categories) ? productForm.categories : [];
      if (selectedCatIds.length > 0) {
        const firstCat = categories.find(
          (c) => (c._id?.toString() || c.id?.toString()) === selectedCatIds[0] || c.slug === selectedCatIds[0]
        );
        if (firstCat) {
          primaryCategorySlug = firstCat.slug || firstCat.name?.toLowerCase().replace(/\s+/g, "-") || primaryCategorySlug;
        }
      }

      const payload = {
        title: productForm.title.trim(),
        category: primaryCategorySlug,
        categories: selectedCatIds,
        costPrice: Number(productForm.costPrice) || 0,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity) || 0,
        description: productForm.description.trim() || productForm.shortDescription.trim() || "Botanical specimen",
        shortDescription: (productForm.shortDescription || productForm.description || "").trim(),
        fullDescriptionHtml: (productForm.fullDescriptionHtml || productForm.description || "").trim(),
        hasVariants: Boolean(productForm.hasVariants),
        variantGroupTitle: (productForm.variantGroupTitle || "Select Option").trim(),
        variants: cleanedVariants,
        hasCareGuide: Boolean(productForm.hasCareGuide !== false),
        careGuide: {
          lightLocation: (productForm.careGuide?.lightLocation || "").trim(),
          hydrationWatering: (productForm.careGuide?.hydrationWatering || "").trim(),
          safetyDifficulty: (productForm.careGuide?.safetyDifficulty || "").trim(),
          horticulturistNote: (productForm.careGuide?.horticulturistNote || productForm.care_instructions || "").trim(),
        },
        showCareGuideBadges: Boolean(productForm.showCareGuideBadges),
        careBadges: {
          sunlight: productForm.careBadges?.sunlight || "Medium Indirect",
          water: productForm.careBadges?.water || "Once a week",
          petSafe: productForm.careBadges?.petSafe || "Non-Toxic",
          difficulty: productForm.careBadges?.difficulty || "Beginner",
        },
        customTabTitle: (productForm.customTabTitle || "Botanical Background & Characteristics").trim(),
        care_instructions: productForm.care_instructions.trim(),
        tags: Array.isArray(productForm.tags)
          ? productForm.tags.map((t) => t.trim()).filter(Boolean)
          : [],
        images: productForm.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        ...(editingProduct && { productId: editingProduct._id }),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      message.success(
        editingProduct ? "Product updated successfully!" : "Product created successfully!"
      );
      setIsProductModalOpen(false);
      fetchProducts();
      fetchCategories();
      fetchOverview();
    } catch (err) {
      message.error(err.message || "Could not save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  // Expense Handlers
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) {
      message.error("Please fill in expense title and amount.");
      return;
    }

    try {
      setSavingExpense(true);
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record expense");
      }

      message.success("Expense recorded successfully!");
      setIsExpenseModalOpen(false);
      setExpenseForm({
        title: "",
        amount: "",
        category: "Salary",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchExpenses();
      fetchOverview();
    } catch (err) {
      message.error(err.message || "Could not save expense.");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = (exp) => {
    modal.confirm({
      title: "Delete Expense Record",
      content: `Are you sure you want to delete "${exp.title}" (৳${Number(exp.amount).toLocaleString("en-BD")})?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/expenses?id=${exp._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            message.success("Expense deleted successfully");
            fetchExpenses();
            fetchOverview();
          } else {
            message.error(data.message || "Failed to delete expense");
          }
        } catch (err) {
          message.error("Failed to delete expense");
        }
      },
    });
  };

  // Delete Product
  const handleDeleteProduct = (prod) => {
    modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to permanently delete "${prod.title}" from inventory?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/products?id=${prod._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete product");
          }
          message.success("Product deleted successfully");
          fetchProducts();
          fetchOverview();
        } catch (err) {
          message.error(err.message || "Could not delete product");
        }
      },
    });
  };

  // Super Admin: Manage Admin Approval/Rejection
  const handleManageAdminStatus = async (adminId, action) => {
    try {
      setActionAdminId(adminId);
      const res = await fetch("/api/admin-auth/manage-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Action failed");
      }
      message.success(data.message || `Admin status updated to ${action}`);
      fetchTeam();
      fetchOverview();
    } catch (err) {
      message.error(err.message || "Could not update admin permissions");
    } finally {
      setActionAdminId(null);
    }
  };

  // ─────────────────────────────────────────────
  // 4. Computed Filters
  // ─────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderFilter !== "all") {
        if ((order.status || "").toLowerCase() !== orderFilter.toLowerCase()) {
          return false;
        }
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const idMatch = (order._id || "").toLowerCase().includes(q);
        const nameMatch = (order.shippingAddress?.fullName || "").toLowerCase().includes(q);
        const phoneMatch = (order.shippingAddress?.phone || "").toLowerCase().includes(q);
        const cityMatch = (order.shippingAddress?.city || "").toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch || cityMatch;
      }
      return true;
    });
  }, [orders, orderFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (productCategory !== "all") {
        if ((prod.category || "").toLowerCase() !== productCategory.toLowerCase()) {
          return false;
        }
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const titleMatch = (prod.title || "").toLowerCase().includes(q);
        const descMatch = (prod.description || "").toLowerCase().includes(q);
        return titleMatch || descMatch;
      }
      return true;
    });
  }, [products, productCategory, productSearch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase().trim();
      const nameMatch = (c.name || "").toLowerCase().includes(q);
      const emailMatch = (c.email || "").toLowerCase().includes(q);
      const phoneMatch = (c.phone || "").toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [customers, customerSearch]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifFilter === "all") return true;
      if (notifFilter === "unread") return !n.isRead;
      return n.type === notifFilter;
    });
  }, [notifications, notifFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (expenseCategoryFilter !== "all" && exp.category !== expenseCategoryFilter) {
        return false;
      }
      if (expenseSearch.trim()) {
        const q = expenseSearch.toLowerCase().trim();
        const titleMatch = (exp.title || "").toLowerCase().includes(q);
        const notesMatch = (exp.notes || "").toLowerCase().includes(q);
        const catMatch = (exp.category || "").toLowerCase().includes(q);
        return titleMatch || notesMatch || catMatch;
      }
      return true;
    });
  }, [expenses, expenseCategoryFilter, expenseSearch]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center text-gray-800">
        <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin mb-4" />
        <p className="text-xs font-bold tracking-wider text-gray-600 uppercase">
          Securing Admin Session…
        </p>
      </div>
    );
  }

  if (!admin) return null;

  const isSuperAdmin = admin.role === "super_admin";
  const pendingRequestsCount = team.filter((m) => m.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-gray-800">

      {/* ═══════════════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION (Fixed Left Sidebar)
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="fixed inset-y-0 left-0 w-80 h-screen z-40 bg-white border-r border-gray-200 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-5 px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#2D6A4F] flex items-center justify-center text-xl shadow-xs font-bold">
                🌿
              </div>
              <div>
                <h1 className="font-bold text-sm text-emerald-900 tracking-tight">
                  Admin Panel
                </h1>
                <p className="text-[10px] text-gray-400 font-mono">Executive Portal</p>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-b border-gray-100">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#2D6A4F] border border-emerald-200/80 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                {admin.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{admin.name}</p>
                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <CrownOutlined className="text-[10px]" /> Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <SafetyCertificateOutlined className="text-[10px]" /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-3.5 space-y-1">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: <DashboardOutlined />,
              },
              {
                key: "orders",
                label: "Orders Management",
                icon: <ShoppingOutlined />,
                badge: orders.filter((o) => (o.status || "").toLowerCase() === "pending").length,
              },
              {
                key: "products",
                label: "Products Catalog",
                icon: <AppstoreOutlined />,
                badge: products.length,
              },
              {
                key: "reviews",
                label: "Reviews",
                icon: <StarOutlined />,
                badge: reviewsCount > 0 ? reviewsCount : null,
              },
              {
                key: "blogs",
                label: "Blogs",
                icon: <BookOpen className="w-4 h-4" />,
                badge: blogsCount > 0 ? blogsCount : null,
              },
              {
                key: "categories",
                label: "Categories",
                icon: <TagsOutlined />,
                badge: categories.length > 0 ? categories.length : null,
              },
              {
                key: "discounts",
                label: "Discounts (ডিসকাউন্ট ও কুপন)",
                icon: <TagIcon className="w-4 h-4" />,
                badge: discountsCount > 0 ? discountsCount : null,
              },
              {
                key: "theme",
                label: "Theme & Pages",
                icon: <LayoutOutlined />,
              },
              {
                key: "settings",
                label: "Site Settings",
                icon: <SettingOutlined />,
              },
              {
                key: "expenses",
                label: "Expenses",
                icon: <WalletOutlined />,
                badge: expenses.length > 0 ? `${expenses.length}` : null,
              },
              {
                key: "customers",
                label: "Customers (গ্রাহক)",
                icon: <Users className="w-4 h-4" />,
                badge: customers.length,
              },
              {
                key: "notifications",
                label: "Notifications",
                icon: <BellOutlined />,
                badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
                alert: unreadNotifsCount > 0,
              },
              {
                key: "team",
                label: "Admin Team & Access",
                icon: <SafetyCertificateOutlined />,
                badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : null,
                alert: pendingRequestsCount > 0,
              },
            ].map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${isActive
                    ? "bg-[#2D6A4F] text-white shadow-sm font-medium"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl font-medium"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${isActive ? "text-white" : "text-emerald-600/70"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.alert
                        ? isActive
                          ? "bg-amber-300 text-amber-950 font-bold"
                          : "bg-amber-100 text-amber-800"
                        : isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl py-2 px-3 text-xs font-medium transition-all text-center"
          >
            Visit Live Store ↗
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl py-2 px-3 text-xs font-medium transition-all cursor-pointer"
          >
            <LogoutOutlined /> Sign Out of Admin
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="ml-80 min-h-screen flex flex-col bg-[#F4F6F4]">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#F4F6F4]/95 backdrop-blur-md border-b border-gray-200/80 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1A2E22] tracking-tight">
              {activeTab === "overview" && "Dashboard Overview & Financial Analytics"}
              {activeTab === "orders" && "Customer Orders Management"}
              {activeTab === "products" && "Product Catalog & Cost Tracking"}
              {activeTab === "blogs" && "Botanical Blog & Plant Care Guides Management"}
              {activeTab === "categories" && "Categories & Storefront Navigation"}
              {activeTab === "discounts" && "Discounts & Promotion Engine"}
              {activeTab === "theme" && "Theme, Pages & Navigation Builder"}
              {activeTab === "settings" && "Site Settings & Global CMS"}
              {activeTab === "expenses" && "Business Expenses Management"}
              {activeTab === "customers" && (customerSubTab === "registered" ? "Customers & Registered User Directory" : "Newsletter Subscribers & Audience Management")}
              {activeTab === "notifications" && "Notifications Center"}
              {activeTab === "team" && "Administrator Team & Access Permissions"}
            </h2>
            <p className="text-xs text-[#6B7280]">
              Store Administration System · Live Database Mode
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-900 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              Visit Live Store ↗
            </Link>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
                className="relative p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#2D6A4F] transition-all cursor-pointer shadow-2xs"
                title="Notifications"
              >
                <BellOutlined className="text-base" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-black rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotifsCount > 9 ? "9+" : unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Dropdown Card */}
              <AnimatePresence>
                {isNotifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/80 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-3.5 px-4 border-b border-gray-100 flex items-center justify-between bg-[#F8FAF9]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1A2E22]">
                          🔔 Notifications
                        </span>
                        {unreadNotifsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#2D6A4F]">
                            {unreadNotifsCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mx-auto mb-2">
                            <Sprout className="w-4 h-4" />
                          </div>
                          <p className="font-semibold text-gray-600">All caught up!</p>
                          <p className="text-[11px] text-gray-400">No new notifications</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => {
                          const badge = getNotificationBadge(n.type);
                          return (
                            <div
                              key={n._id}
                              onClick={() => handleMarkNotificationRead(n._id, n.link)}
                              className={`p-3.5 px-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-start gap-3 ${!n.isRead ? "bg-emerald-50/20" : ""
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-sm shrink-0 mt-0.5">
                                {badge.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs font-bold truncate ${!n.isRead ? "text-[#1A2E22]" : "text-gray-600"}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 px-4 border-t border-gray-100 bg-[#F8FAF9] text-center">
                      <button
                        onClick={() => {
                          setIsNotifDropdownOpen(false);
                          handleTabChange("notifications");
                        }}
                        className="w-full py-1 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] transition-colors cursor-pointer"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                if (activeTab === "overview") fetchOverview();
                if (activeTab === "orders") fetchOrders();
                if (activeTab === "products") fetchProducts();
                if (activeTab === "categories") fetchCategories();
                if (activeTab === "expenses") fetchExpenses();
                if (activeTab === "customers") fetchCustomers();
                if (activeTab === "notifications") fetchNotifications();
                if (activeTab === "team") fetchTeam();
                message.success("Data refreshed");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:text-[#2D6A4F] hover:border-[#40916C] shadow-2xs transition-all cursor-pointer"
            >
              <SyncOutlined /> Refresh
            </button>
            {activeTab === "products" && (
              <button
                onClick={() => openProductModal()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all cursor-pointer"
              >
                <PlusOutlined /> Add New Product
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => openCategoryModal()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all cursor-pointer"
              >
                <PlusOutlined /> Add New Category
              </button>
            )}
          </div>
        </header>

        {/* Tab View Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* ═════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Alert if pending admins */}
              {pendingRequestsCount > 0 && isSuperAdmin && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        {pendingRequestsCount} Pending Admin Registration Request(s)
                      </p>
                      <p className="text-[11px] text-amber-700">
                        New team members have registered and require Super Admin approval before they can log in.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTabChange("team")}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    Review Requests →
                  </button>
                </div>
              )}

              {/* ── ROW 1: HIGH-IMPACT HIGHLIGHT CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Sales & Orders */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Sales & Orders</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-lg font-bold border border-emerald-100">
                      ৳
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#1A2E22]">
                        ৳{(stats?.totalRevenue ?? overview?.totalSales ?? 0).toLocaleString("en-BD")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {(stats?.totalOrdersCount ?? overview?.totalOrders ?? 0)} Total Orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Delivered (ক্যাশ ইন) */}
                <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between bg-gradient-to-br from-white via-white to-emerald-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Delivered (ক্যাশ ইন)</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                      <CheckCircleOutlined />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-900">
                        ৳{(stats?.deliveredValue || 0).toLocaleString("en-BD")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#1B4332] border border-emerald-200">
                        <CheckCircleOutlined className="text-[10px]" /> {stats?.deliveredCount || 0} Orders Delivered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Pending (প্রক্রিয়াধীন) */}
                <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between bg-gradient-to-br from-white via-white to-amber-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending (প্রক্রিয়াধীন)</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                      <ClockCircleOutlined />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-amber-950">
                        ৳{(stats?.pendingValue || 0).toLocaleString("en-BD")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        <ClockCircleOutlined className="text-[10px]" /> {stats?.pendingCount || 0} Orders Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Net Profit (আসল লাভ) */}
                {(() => {
                  const net = stats?.netProfit || 0;
                  const isProfitable = net >= 0;
                  return (
                    <div
                      className={`rounded-3xl p-5 border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${isProfitable
                        ? "bg-white border-emerald-300 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/30"
                        : "bg-white border-rose-300 bg-gradient-to-br from-white via-rose-50/20 to-rose-100/30"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${isProfitable ? "text-emerald-800" : "text-rose-800"
                            }`}
                        >
                          Net Profit (আসল লাভ)
                        </span>
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-xs font-bold ${isProfitable
                            ? "bg-[#2D6A4F] text-white"
                            : "bg-rose-500 text-white"
                            }`}
                        >
                          {isProfitable ? <RiseOutlined /> : <FallOutlined />}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-2xl font-black ${isProfitable ? "text-[#2D6A4F]" : "text-rose-600"
                              }`}
                          >
                            {isProfitable ? "+" : ""}৳{net.toLocaleString("en-BD")}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">
                          Costs: ৳{(stats?.totalProductCosts || 0).toLocaleString("en-BD")} · Expenses: ৳{(stats?.operationalExpenses || 0).toLocaleString("en-BD")}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ── ROW 2: MONTHLY ORDERS & REVENUE TREND GRAPH ── */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-sm font-bold border border-emerald-100">
                        📈
                      </span>
                      <h3 className="font-extrabold text-sm text-[#1A2E22]">
                        Monthly Orders & Revenue Trend (মাসিক বিক্রয় ও অর্ডার গ্রাফ)
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 pl-10">
                      Historical revenue curves and completed order volume over the last 12 months
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                      <span className="w-3 h-3 rounded-full bg-[#2D6A4F]" />
                      <span>Total Revenue (৳)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                      <span className="w-3 h-3 rounded-full bg-[#52B788]" />
                      <span>Delivered Value (৳)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {mounted && stats?.monthlyData?.length > 0 ? (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats.monthlyData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="nurseryRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="nurseryDeliveredGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#52B788" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#52B788" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F1" vertical={false} />
                          <XAxis
                            dataKey="month"
                            stroke="#9CA3AF"
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            tickLine={false}
                            axisLine={{ stroke: "#E5E7EB" }}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            tickLine={false}
                            axisLine={{ stroke: "#E5E7EB" }}
                            tickFormatter={(val) => `৳${val}`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#2D6A4F"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#nurseryRevenueGrad)"
                            dot={{ r: 4, fill: "#2D6A4F", strokeWidth: 2, stroke: "#FFFFFF" }}
                            activeDot={{ r: 6, fill: "#1B4332", strokeWidth: 2, stroke: "#FFFFFF" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="deliveredRevenue"
                            name="Delivered Value"
                            stroke="#52B788"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fillOpacity={1}
                            fill="url(#nurseryDeliveredGrad)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 w-full flex flex-col items-center justify-center text-gray-400 text-xs">
                      <SyncOutlined spin className="text-xl mb-2 text-[#2D6A4F]" />
                      <span>Loading monthly chart data...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ROW 3: RECENT ORDERS TABLE ── */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-sm text-[#1A2E22] flex items-center gap-2">
                    <ClockCircleOutlined /> Recent Orders (সাম্প্রতিক অর্ডার)
                  </h3>
                  <button
                    onClick={() => handleTabChange("orders")}
                    className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#6B7280]">
                        <th className="pb-3 font-semibold">Order ID</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Total Amount</th>
                        <th className="pb-3 font-semibold">Payment</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(stats?.recentOrders || overview?.recentOrders || orders.slice(0, 8)).map((ord) => (
                        <tr key={ord._id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-mono font-bold text-[#1A2E22]">
                            #{ord._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3">
                            <p className="font-semibold text-[#1A2E22]">
                              {ord.shippingAddress?.fullName}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {ord.shippingAddress?.phone}
                            </p>
                          </td>
                          <td className="py-3 font-bold text-[#2D6A4F]">
                            ৳{ord.totalPrice?.toLocaleString("en-BD")}
                          </td>
                          <td className="py-3 capitalize text-gray-600">
                            {ord.paymentMethod === "bkash" ? "📱 bKash" : "💵 COD"}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ord.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : ord.status === "Processing"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : ord.status === "Cancelled"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                            >
                              {ord.status || "Pending"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleTabChange("orders")}
                              className="text-[11px] font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 2: ORDERS MANAGEMENT
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Status tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${orderFilter === st
                          ? "bg-[#2D6A4F] text-white shadow-xs"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by order ID, name, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C]"
                  />
                </div>
              </div>

              {/* Orders List */}
              {loadingOrders ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <SyncOutlined spin className="text-xl text-[#2D6A4F]" />
                  <p className="text-xs text-gray-500 mt-2">Loading orders…</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <p className="text-sm font-bold text-gray-700">No orders found</p>
                  <p className="text-xs text-gray-400 mt-1">Try changing your filter or search query</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => {
                    const refCode = ord._id.slice(-6).toUpperCase();
                    const isUpdating = updatingOrderId === ord._id;

                    return (
                      <div
                        key={ord._id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg">
                              #{refCode}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Status Change Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Status:</span>
                            <Select
                              value={ord.status || "Pending"}
                              style={{ width: 140 }}
                              size="small"
                              loading={isUpdating}
                              onChange={(val) => handleOrderStatusChange(ord._id, val)}
                              options={[
                                { value: "Pending", label: "Pending" },
                                { value: "Processing", label: "Processing" },
                                { value: "Shipped", label: "Shipped" },
                                { value: "Delivered", label: "Delivered" },
                                { value: "Cancelled", label: "Cancelled" },
                              ]}
                            />
                          </div>
                        </div>

                        {/* Customer & Shipping Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Items */}
                          <div className="md:col-span-2 space-y-2">
                            <p className="font-bold text-gray-700">Ordered Products:</p>
                            <div className="space-y-1.5">
                              {ord.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span>🌿</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#1A2E22] truncate max-w-[220px]">
                                        {item.title}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        Qty: <strong>{item.quantity}</strong> × ৳{item.price}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-[#2D6A4F]">
                                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping info */}
                          <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                            <p className="font-bold text-gray-700 flex items-center gap-1.5">
                              <UserOutlined /> {ord.shippingAddress?.fullName}
                            </p>
                            <p className="text-gray-600 flex items-center gap-1.5">
                              <PhoneOutlined /> {ord.shippingAddress?.phone}
                            </p>
                            <p className="text-gray-500 flex items-start gap-1.5">
                              <EnvironmentOutlined style={{ marginTop: "2px" }} />
                              {ord.shippingAddress?.street}, {ord.shippingAddress?.city}{" "}
                              {ord.shippingAddress?.postalCode && `(${ord.shippingAddress.postalCode})`}
                            </p>
                            {ord.discountAmount > 0 && (
                              <div className="pt-1.5 flex justify-between text-xs text-[#2D6A4F] font-semibold">
                                <span>Discount ({ord.appliedCouponCode || "Promo"}):</span>
                                <span>-৳{ord.discountAmount?.toLocaleString("en-BD")}</span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-200/60 flex justify-between font-bold">
                              <span>Grand Total:</span>
                              <span className="text-[#2D6A4F] text-sm">
                                ৳{ord.totalPrice?.toLocaleString("en-BD")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 3: PRODUCTS MANAGEMENT
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={productCategory}
                    onChange={(val) => setProductCategory(val)}
                    style={{ width: 150 }}
                    size="middle"
                    options={[
                      { value: "all", label: "All Categories" },
                      { value: "plant", label: "Plants" },
                      { value: "fertilizer", label: "Fertilizers" },
                      { value: "tool", label: "Tools & Pots" },
                    ]}
                  />
                  <span className="text-xs text-gray-400">
                    ({filteredProducts.length} items)
                  </span>
                </div>

                <div className="relative w-full sm:w-72">
                  <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search plant title, care tip..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C]"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[#4A5568]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Product</th>
                        <th className="py-3 px-4 font-bold">Category</th>
                        <th className="py-3 px-4 font-bold">Price</th>
                        <th className="py-3 px-4 font-bold">Stock</th>
                        <th className="py-3 px-4 font-bold">Care Instructions</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {prod.images?.[0] ? (
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Sprout className="w-5 h-5 text-[#2D6A4F]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#1A2E22] truncate max-w-[200px]">
                                  {prod.title}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                                  {prod.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold text-gray-600">
                            {prod.category}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#2D6A4F]">
                            ৳{prod.price?.toLocaleString("en-BD")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.stock_quantity === 0
                                ? "bg-red-50 text-red-600"
                                : prod.stock_quantity <= 5
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-emerald-50 text-emerald-700"
                                }`}
                            >
                              {prod.stock_quantity} left
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                            {prod.care_instructions || "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openProductModal(prod)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-[#2D6A4F] hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <EditOutlined />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 4: ADMIN TEAM & PERMISSIONS
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Permission info banner */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1A2E22]">
                    Administrator Hierarchy & Access Control
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Our store operates on a secure 2-tier administrative model.{" "}
                    <strong>Super Admins</strong> hold master privileges to review, approve, or revoke
                    other administrators' access. Approved administrators can manage orders and product catalog inventory.
                  </p>
                </div>
              </div>

              {/* Pending Requests Section (Super Admin Review) */}
              {pendingRequestsCount > 0 && (
                <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                      <ClockCircleOutlined /> Pending Registration Requests ({pendingRequestsCount})
                    </h3>
                    <span className="text-[11px] font-semibold text-amber-700">
                      Requires Super Admin Approval
                    </span>
                  </div>

                  <div className="space-y-3">
                    {team
                      .filter((m) => m.status === "pending")
                      .map((pendingAdmin) => (
                        <div
                          key={pendingAdmin._id}
                          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-wrap items-center justify-between gap-4"
                        >
                          <div>
                            <p className="font-bold text-xs text-[#1A2E22]">{pendingAdmin.name}</p>
                            <p className="text-[11px] text-gray-500">{pendingAdmin.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Registered:{" "}
                              {new Date(pendingAdmin.createdAt).toLocaleDateString("en-GB")}
                            </span>
                          </div>

                          {isSuperAdmin ? (
                            <div className="flex items-center gap-2">
                              <button
                                disabled={actionAdminId === pendingAdmin._id}
                                onClick={() => handleManageAdminStatus(pendingAdmin._id, "approve")}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                              >
                                Approve Admin
                              </button>
                              <button
                                disabled={actionAdminId === pendingAdmin._id}
                                onClick={() => handleManageAdminStatus(pendingAdmin._id, "reject")}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Super Admin approval required
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* All Administrators Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-[#1A2E22]">
                  Registered Administrators ({team.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#6B7280]">
                        <th className="pb-3 font-bold">Admin Member</th>
                        <th className="pb-3 font-bold">Role</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Joined Date</th>
                        {isSuperAdmin && <th className="pb-3 font-bold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {team.map((m) => {
                        const isSelf = m._id === admin.id;

                        return (
                          <tr key={m._id} className="hover:bg-gray-50/50">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {m.name?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                                <div>
                                  <p className="font-bold text-[#1A2E22]">
                                    {m.name} {isSelf && "(You)"}
                                  </p>
                                  <p className="text-[11px] text-gray-400">{m.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              {m.role === "super_admin" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <CrownOutlined /> Super Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                  Admin
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${m.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : m.status === "pending"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500">
                              {new Date(m.createdAt).toLocaleDateString("en-GB")}
                            </td>

                            {isSuperAdmin && (
                              <td className="py-3 text-right">
                                {!isSelf && m.role !== "super_admin" && (
                                  <div className="flex items-center justify-end gap-2">
                                    {m.status !== "approved" ? (
                                      <button
                                        disabled={actionAdminId === m._id}
                                        onClick={() => handleManageAdminStatus(m._id, "approve")}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                    ) : (
                                      <button
                                        disabled={actionAdminId === m._id}
                                        onClick={() => handleManageAdminStatus(m._id, "reject")}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                                      >
                                        Revoke / Reject
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 5: CUSTOMERS & AUDIENCE MANAGEMENT (গ্রাহক ও সাবস্ক্রাইবার)
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              {/* Top Sub-Tab Navigation Toggle */}
              <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-[#F4F6F4] p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCustomerSubTab("registered")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customerSubTab === "registered"
                        ? "bg-[#2D6A4F] text-white shadow-xs"
                        : "text-gray-600 hover:text-[#2D6A4F] hover:bg-white/60"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Registered Users</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        customerSubTab === "registered"
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {customers.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerSubTab("subscribers")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customerSubTab === "subscribers"
                        ? "bg-[#2D6A4F] text-white shadow-xs"
                        : "text-gray-600 hover:text-[#2D6A4F] hover:bg-white/60"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Newsletter Subscribers</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        customerSubTab === "subscribers"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-[#2D6A4F]"
                      }`}
                    >
                      {subscribersCount}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-gray-500 pr-2 hidden sm:block">
                  {customerSubTab === "registered"
                    ? "Verified storefront user accounts"
                    : "Direct marketing newsletter audience"}
                </div>
              </div>

              {/* Sub-Tab A: Registered Users */}
              {customerSubTab === "registered" && (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Total Registered Customers</p>
                        <p className="text-2xl font-black text-[#1A2E22] mt-1">{customers.length}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Verified user accounts</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xl font-bold">
                        <Users className="w-6 h-6 stroke-[2]" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Active Buyers</p>
                        <p className="text-2xl font-black text-[#2D6A4F] mt-1">
                          {customers.filter((c) => (c.totalOrders || 0) > 0).length}
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Placed at least 1 order</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center text-xl font-bold">
                        <ShoppingBag className="w-6 h-6 stroke-[2]" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Orders by Registered Accounts</p>
                        <p className="text-2xl font-black text-[#1A2E22] mt-1">
                          {customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Tracked in database</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">
                        <Package className="w-6 h-6 stroke-[2]" />
                      </div>
                    </div>
                  </div>

                  {/* Main Card with Search Bar & Table */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1A2E22] flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#2D6A4F]" />
                          <span>Customers Directory (গ্রাহক তালিকা)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Search and inspect customer profiles, joined dates, and order history
                        </p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-72">
                        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          placeholder="Search name, email, phone..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
                        />
                        {customerSearch && (
                          <button
                            onClick={() => setCustomerSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table */}
                    {loadingCustomers ? (
                      <div className="py-12 text-center text-xs text-gray-400">
                        <SyncOutlined spin className="text-xl mb-2 text-[#2D6A4F]" />
                        <p>Loading registered customer database...</p>
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-400">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="font-semibold text-gray-600">No customers found</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {customerSearch ? "Try adjusting your search query" : "No users registered yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              <th className="pb-3">Customer Name</th>
                              <th className="pb-3">Email Address</th>
                              <th className="pb-3">Phone Number</th>
                              <th className="pb-3">Joined Date</th>
                              <th className="pb-3">Role</th>
                              <th className="pb-3 text-right">Total Orders</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.map((cust) => {
                              const initial = cust.name?.charAt(0)?.toUpperCase() || "U";
                              return (
                                <tr key={cust._id} className="hover:bg-gray-50/70 transition-colors">
                                  {/* Customer Name */}
                                  <td className="py-3.5 pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-bold text-xs shrink-0 border border-[#B7E4C7]">
                                        {initial}
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#1A2E22]">{cust.name}</p>
                                        {cust.address && cust.address !== "—" && (
                                          <p className="text-[10px] text-gray-400 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-2.5 h-2.5 shrink-0" /> {cust.address}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Email */}
                                  <td className="py-3.5 pr-4 text-gray-700 font-mono text-[11px]">
                                    {cust.email}
                                  </td>

                                  {/* Phone */}
                                  <td className="py-3.5 pr-4">
                                    {cust.phone && cust.phone !== "—" ? (
                                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">
                                        <Phone className="w-2.5 h-2.5 text-gray-500" /> {cust.phone}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 italic">Not provided</span>
                                    )}
                                  </td>

                                  {/* Joined Date */}
                                  <td className="py-3.5 pr-4 text-gray-500 text-[11px]">
                                    {cust.createdAt
                                      ? new Date(cust.createdAt).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                      : "—"}
                                  </td>

                                  {/* Role */}
                                  <td className="py-3.5 pr-4">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${cust.role === "admin"
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        }`}
                                    >
                                      {cust.role === "admin" ? (
                                        <>
                                          <ShieldCheck className="w-3 h-3" /> Admin
                                        </>
                                      ) : (
                                        <>
                                          <User className="w-3 h-3" /> User
                                        </>
                                      )}
                                    </span>
                                  </td>

                                  {/* Total Orders */}
                                  <td className="py-3.5 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cust.totalOrders > 0
                                        ? "bg-[#D8F3DC] text-[#1B4332]"
                                        : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                      <Package className="w-3.5 h-3.5" />
                                      <span>{cust.totalOrders} {cust.totalOrders === 1 ? "order" : "orders"}</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Tab B: Newsletter Subscribers */}
              {customerSubTab === "subscribers" && (
                <SubscribersTab onCountChange={setSubscribersCount} />
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 6: NOTIFICATIONS (বিজ্ঞপ্তি কেন্দ্র)
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Header card with action buttons */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔔</span>
                    <h3 className="text-base font-extrabold text-[#1A2E22]">
                      Notifications Center
                    </h3>
                    {unreadNotifsCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#2D6A4F] border border-[#B7E4C7]">
                        {unreadNotifsCount} Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time activity logs, customer purchases, new admin applications, and inventory alerts
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    disabled={unreadNotifsCount === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-40 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <CheckOutlined /> Mark All as Read
                  </button>
                  <button
                    onClick={handleClearAllNotifications}
                    disabled={notifications.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-red-600 disabled:opacity-40 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <DeleteOutlined /> Clear All
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { key: "all", label: "All Activity", count: notifications.length },
                  {
                    key: "order",
                    label: "Orders",
                    count: notifications.filter((n) => n.type === "order").length,
                  },
                  {
                    key: "admin_request",
                    label: "Admin Requests",
                    count: notifications.filter((n) => n.type === "admin_request").length,
                  },
                  {
                    key: "stock_alert",
                    label: "Stock Alerts",
                    count: notifications.filter((n) => n.type === "stock_alert").length,
                  },
                  {
                    key: "unread",
                    label: "Unread Only",
                    count: unreadNotifsCount,
                  },
                ].map((tab) => {
                  const isActive = notifFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setNotifFilter(tab.key)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${isActive
                        ? "bg-[#2D6A4F] text-white shadow-sm shadow-[#2D6A4F]/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Notifications List */}
              {loadingNotifications ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-xs text-gray-400">
                  <SyncOutlined spin className="text-xl mb-2 text-[#2D6A4F]" />
                  <p>Loading notification center...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-3">
                    🌿
                  </div>
                  <h4 className="text-sm font-extrabold text-[#1A2E22]">
                    All caught up! No notifications
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    {notifFilter !== "all"
                      ? "No notifications found matching your active filter pill."
                      : "When customers place orders or administrators request access, live alerts will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((n) => {
                    const badge = getNotificationBadge(n.type);
                    return (
                      <div
                        key={n._id}
                        className={`bg-white rounded-2xl p-5 border transition-all ${!n.isRead
                          ? "border-emerald-300 bg-emerald-50/10 shadow-sm shadow-emerald-950/5"
                          : "border-gray-100 hover:border-gray-200 shadow-2xs"
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg shrink-0 mt-0.5">
                              {badge.icon}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                                >
                                  {badge.label}
                                </span>
                                {!n.isRead && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                                    NEW
                                  </span>
                                )}
                                <span className="text-[11px] text-gray-400 font-mono">
                                  {new Date(n.createdAt).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  ({formatTimeAgo(n.createdAt)})
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-[#1A2E22]">
                                {n.title}
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {n.type === "order" && (
                              <button
                                onClick={() => handleMarkNotificationRead(n._id, "/Manage_Admin?tab=orders")}
                                className="px-3 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                              >
                                View Order →
                              </button>
                            )}

                            {n.type === "admin_request" && (
                              <button
                                onClick={() => handleMarkNotificationRead(n._id, "/Manage_Admin?tab=team")}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                              >
                                Review & Approve →
                              </button>
                            )}

                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkNotificationRead(n._id)}
                                className="p-2 rounded-xl text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <CheckOutlined className="text-sm" />
                              </button>
                            )}

                            <button
                              onClick={(e) => handleDeleteNotification(n._id, e)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <DeleteOutlined className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB: BUSINESS EXPENSES MANAGEMENT (খরচ)
          ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              {/* Expense Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Total Operational Expenses
                    </p>
                    <p className="text-2xl font-black text-rose-600 mt-1">
                      ৳{expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString("en-BD")}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Across {expenses.length} expense records
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-100">
                    💸
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Top Expense Category
                    </p>
                    {(() => {
                      const catMap = {};
                      expenses.forEach((e) => {
                        catMap[e.category] = (catMap[e.category] || 0) + (Number(e.amount) || 0);
                      });
                      let topCat = "None";
                      let topAmount = 0;
                      Object.entries(catMap).forEach(([cat, amt]) => {
                        if (amt > topAmount) {
                          topCat = cat;
                          topAmount = amt;
                        }
                      });
                      return (
                        <>
                          <p className="text-xl font-black text-[#1A2E22] mt-1">{topCat}</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            ৳{topAmount.toLocaleString("en-BD")} recorded
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold border border-amber-100">
                    🏷️
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Quick Action
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-1">Record Outflow</p>
                    <button
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <PlusOutlined /> Add Expense
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xl font-bold border border-emerald-100">
                    💼
                  </div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={expenseCategoryFilter}
                    onChange={(val) => setExpenseCategoryFilter(val)}
                    style={{ width: 170 }}
                    size="middle"
                    options={[
                      { value: "all", label: "All Categories" },
                      { value: "Salary", label: "Salary" },
                      { value: "Packaging", label: "Packaging" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Nursery Care", label: "Nursery Care" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                  <span className="text-xs text-gray-400">
                    ({filteredExpenses.length} entries)
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search expense title, note..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C]"
                    />
                  </div>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all cursor-pointer"
                  >
                    <PlusOutlined /> Add Expense
                  </button>
                </div>
              </div>

              {/* Expenses Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[#4A5568]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Expense Title & Purpose</th>
                        <th className="py-3 px-4 font-bold">Category</th>
                        <th className="py-3 px-4 font-bold">Date</th>
                        <th className="py-3 px-4 font-bold">Amount (Expense)</th>
                        <th className="py-3 px-4 font-bold">Recorded By</th>
                        <th className="py-3 px-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">
                            {/* <p className="text-xl mb-1">🌿</p> */}
                            <p className="font-semibold text-gray-600">No expense records found</p>
                            <p className="text-[11px] text-gray-400">
                              Click &quot;+ Add Expense&quot; above to log your first business expenditure.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp) => {
                          const getCategoryTagStyle = (cat) => {
                            switch (cat) {
                              case "Salary":
                                return "bg-purple-50 text-purple-800 border-purple-200";
                              case "Packaging":
                                return "bg-blue-50 text-blue-800 border-blue-200";
                              case "Utilities":
                                return "bg-amber-50 text-amber-800 border-amber-200";
                              case "Nursery Care":
                                return "bg-emerald-50 text-emerald-800 border-emerald-200";
                              default:
                                return "bg-gray-100 text-gray-800 border-gray-200";
                            }
                          };
                          return (
                            <tr key={exp._id} className="hover:bg-gray-50/50">
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-[#1A2E22]">{exp.title}</p>
                                {exp.notes && (
                                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                    {exp.notes}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryTagStyle(
                                    exp.category
                                  )}`}
                                >
                                  {exp.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                                {new Date(exp.date || exp.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                                ৳{Number(exp.amount).toLocaleString("en-BD")}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 font-medium">
                                {exp.createdBy || "Admin"}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteExpense(exp)}
                                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Expense"
                                >
                                  <DeleteOutlined />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* THEME & PAGE BUILDER TAB */}
          {activeTab === "theme" && <ThemeBuilderTab onNavigateTab={setActiveTab} />}

          {/* GLOBAL SITE SETTINGS & CMS TAB */}
          {activeTab === "settings" && <SiteSettingsTab />}

          {/* PRODUCT REVIEWS MANAGEMENT TAB */}
          {activeTab === "reviews" && (
            <ReviewsTab onReviewsCountChange={setReviewsCount} />
          )}

          {/* BOTANICAL BLOG & ARTICLES MANAGEMENT TAB */}
          {activeTab === "blogs" && (
            <BlogsManagerTab onBlogsCountChange={setBlogsCount} />
          )}

          {/* CATEGORIES MANAGEMENT TAB */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Category KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xl shrink-0 font-bold">
                    <FolderTree className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Categories</p>
                    <h3 className="text-2xl font-black text-[#1A2E22] mt-0.5">{categories.length}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl shrink-0 font-bold">
                    <Globe className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Botanical Collections</p>
                    <h3 className="text-2xl font-black text-sky-950 mt-0.5">
                      {categories.length} Hubs
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl shrink-0 font-bold">
                    <Layers className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalog Sync Status</p>
                    <h3 className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live & Synchronized
                    </h3>
                  </div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search categories by name or slug..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => openCategoryModal()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm transition-all cursor-pointer"
                  >
                    <PlusOutlined /> Create New Category
                  </button>
                </div>
              </div>

              {/* Category Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-emerald-50/50 text-[#1A2E22] font-extrabold uppercase tracking-wider border-b border-gray-100">
                        <th className="py-3.5 px-4">Order</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Slug (URL identifier)</th>
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4">Collection Page</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingCategories ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">
                            <div className="w-6 h-6 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Loading categories...
                          </td>
                        </tr>
                      ) : categories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">
                            No categories found. Click "+ Create New Category" to add one.
                          </td>
                        </tr>
                      ) : (
                        categories
                          .filter((c) => {
                            if (!categorySearch.trim()) return true;
                            const q = categorySearch.toLowerCase();
                            return (
                              c.name?.toLowerCase().includes(q) ||
                              c.slug?.toLowerCase().includes(q) ||
                              c.description?.toLowerCase().includes(q)
                            );
                          })
                          .map((cat, idx) => (
                            <tr key={cat._id || idx} className="hover:bg-emerald-50/20 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                                #{cat.order ?? idx}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {cat.image ? (
                                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <FolderTree className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-gray-900 text-sm">{cat.name}</h4>
                                      {cat.isUnlisted && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                          Unlisted
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      ID: {cat._id?.substring(cat._id.length - 6)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold border border-gray-200">
                                  /{cat.slug}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs text-gray-500 truncate">
                                {cat.description || "—"}
                              </td>
                              <td className="py-3.5 px-4">
                                <Link
                                  href={`/collections/${cat.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1E3F20] hover:bg-emerald-100 transition-colors"
                                >
                                  <span>View Live</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openCategoryModal(cat)}
                                    className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Edit Category"
                                  >
                                    <EditOutlined />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete Category"
                                  >
                                    <DeleteOutlined />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Discounts Tab */}
          {activeTab === "discounts" && (
            <div className="p-8">
              <DiscountsTab />
            </div>
          )}

        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-[#1A2E22]">
            <Sprout className="w-5 h-5 text-[#2D6A4F]" />
            <span>{editingProduct ? "Edit Botanical Product Details" : "Add New Botanical Product"}</span>
          </div>
        }
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={840}
        className="top-6"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monstera Deliciosa (Swiss Cheese Plant)"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          {/* Product Badges & Tags (Dynamic Chips) */}
          <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-[#E2EBE1] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Product Badges &amp; Tags (Displayed as soft pastel pills on PDP)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {productForm.tags?.length || 0} tag(s) added
              </span>
            </div>

            {/* Current Tags Chips */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
              {(productForm.tags || []).length > 0 ? (
                productForm.tags.map((tag, tIdx) => (
                  <span
                    key={`form-tag-${tIdx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 text-[#1B4332] text-xs font-semibold border border-emerald-200/60 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          tags: (prev.tags || []).filter((_, i) => i !== tIdx),
                        }));
                      }}
                      className="w-4 h-4 rounded-full hover:bg-emerald-200 text-emerald-800 flex items-center justify-center cursor-pointer transition-colors"
                      title="Remove tag"
                    >
                      <CloseIcon className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-gray-400 italic">
                  No tags added yet. Choose suggestions below or type custom tags.
                </span>
              )}
            </div>

            {/* Tag Input & Quick Suggestions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[#E2EBE1]">
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Type badge name (e.g. Organic Feed, Rare Specimen, Air Purifier)..."
                  value={productTagInput}
                  onChange={(e) => setProductTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = productTagInput.trim();
                      if (val) {
                        const current = productForm.tags || [];
                        if (!current.includes(val)) {
                          setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }));
                        }
                        setProductTagInput("");
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = productTagInput.trim();
                    if (val) {
                      const current = productForm.tags || [];
                      if (!current.includes(val)) {
                        setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }));
                      }
                      setProductTagInput("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332] transition-colors cursor-pointer shrink-0"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">Quick Add:</span>
              {[
                "Air Purifier",
                "Organic Feed",
                "Eco Certified",
                "Pet Friendly",
                "Rare Specimen",
                "Low Light",
                "Best Seller",
                "Beginner Friendly",
              ].map((sug) => {
                const isAdded = (productForm.tags || []).includes(sug);
                return (
                  <button
                    key={`sug-${sug}`}
                    type="button"
                    disabled={isAdded}
                    onClick={() => {
                      if (!isAdded) {
                        setProductForm((prev) => ({
                          ...prev,
                          tags: [...(prev.tags || []), sug],
                        }));
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                      isAdded
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                        : "bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#2D6A4F] border border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modern Multi-Collection Selector */}
          <div className="p-3.5 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DC] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1A2E22]">
                Assigned Collections / Categories (কালেকশন নির্বাচন করুন) *
              </label>
              <span className="text-[11px] font-semibold text-[#2D6A4F] bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                {(productForm.categories || []).length} selected
              </span>
            </div>

            {/* Selected Collections Badges (soft green removable badges) */}
            {(productForm.categories || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-0.5">
                {(productForm.categories || []).map((catId) => {
                  const cat = categories.find(
                    (c) =>
                      (c._id?.toString() || c.id?.toString()) === catId ||
                      c.slug === catId
                  );
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#2D6A4F]/25 text-[#1E3F20] text-xs font-semibold shadow-xs"
                    >
                      <span>{cat?.name || catId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (productForm.categories || []).filter(
                            (id) => id !== catId
                          );
                          setProductForm({ ...productForm, categories: next });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove collection"
                      >
                        <CloseIcon className="w-3 h-3 ml-1" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Collections Pill / Checkbox selector */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((c) => {
                const catId = c._id?.toString() || c.id?.toString() || c.slug;
                const isSelected = (productForm.categories || []).includes(catId);
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => {
                      const current = productForm.categories || [];
                      const next = isSelected
                        ? current.filter((id) => id !== catId)
                        : [...current, catId];
                      setProductForm({
                        ...productForm,
                        categories: next,
                        category:
                          next.length > 0
                            ? c.slug ||
                              c.name?.toLowerCase().replace(/\s+/g, "-") ||
                              "plant"
                            : productForm.category,
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#2D6A4F] text-white font-bold shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-[#2D6A4F]/50 hover:bg-emerald-50/20 font-medium"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded border border-gray-300 shrink-0 inline-block" />
                    )}
                    <span>{c.name}</span>
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-gray-400">No categories found.</p>
              )}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Buying Cost (৳)
              </label>
              <input
                type="number"
                min={0}
                placeholder="200"
                value={productForm.costPrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, costPrice: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Selling Price (৳) *
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="450"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stock Qty *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="25"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
          </div>

          {/* Profit Preview */}
          {productForm.price && (
            <div className="p-2.5 px-3 rounded-xl bg-emerald-50/60 border border-emerald-150 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Estimated Profit Margin:</span>
              {(() => {
                const c = Number(productForm.costPrice) || 0;
                const p = Number(productForm.price) || 0;
                const diff = p - c;
                const pct = p > 0 ? Math.round((diff / p) * 100) : 0;
                return diff >= 0 ? (
                  <span className="font-bold text-[#2D6A4F]">
                    +৳{diff.toLocaleString("en-BD")} ({pct}% margin)
                  </span>
                ) : (
                  <span className="font-bold text-rose-600">
                    -৳{Math.abs(diff).toLocaleString("en-BD")} ({pct}% loss)
                  </span>
                );
              })()}
            </div>
          )}

          {/* Enterprise Cloudinary Image Upload & Client-Side Compression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">
                Product Photography (Cloudinary CDN)
              </label>
              <span className="text-[10px] text-gray-400">
                Auto-compressed to ~200KB via WebWorker
              </span>
            </div>

            {/* Hidden File Input & Stylized Dropzone */}
            <input
              type="file"
              accept="image/*"
              multiple
              id="admin-product-image-file"
              onChange={handleImageFileUpload}
              disabled={uploadingImage}
              className="hidden"
            />

            <label
              htmlFor="admin-product-image-file"
              className={`w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                uploadingImage
                  ? "border-[#2D6A4F] bg-emerald-50/50 cursor-not-allowed"
                  : "border-gray-200 hover:border-[#2D6A4F] hover:bg-emerald-50/20 bg-white"
              }`}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-[#2D6A4F] animate-spin" />
                  <p className="text-xs font-bold text-[#2D6A4F]">
                    {uploadStatusText || "Compressing & Uploading..."}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Optimizing resolution and uploading blob directly to Cloudinary
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-800">
                    Click to browse and upload product photo(s)
                  </p>
                  <p className="text-[11px] text-gray-400">
                    JPG, PNG, WebP • Compressed to &lt;200KB @ max 1080px resolution
                  </p>
                </div>
              )}
            </label>

            {/* Uploaded Image Previews */}
            {(() => {
              const currentUrls = productForm.images
                ? productForm.images.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
              if (currentUrls.length === 0) return null;

              return (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Uploaded Gallery Images ({currentUrls.length}):</span>
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {currentUrls.map((url, idx) => (
                      <div
                        key={`modal-img-${idx}`}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-2xs"
                      >
                        <img
                          src={url}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={deletingImageIndex === idx}
                          onClick={() => handleRemoveProductImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700 disabled:opacity-75 cursor-pointer"
                          title="Remove this photo"
                        >
                          {deletingImageIndex === idx ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CloseIcon className="w-3 h-3 stroke-[2.5]" />
                          )}
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-[#2D6A4F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Fallback Direct URL input */}
            <div className="pt-1">
              <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                Direct Image URLs (Optional comma-separated manual override)
              </label>
              <input
                type="text"
                placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                value={productForm.images}
                onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
          </div>

          {/* ════ SECTION A: DESCRIPTIONS & CONTENT ════ */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A2E22] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Section A: Descriptions &amp; Information</span>
            </h4>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Short Description (Top summary beside product photo)
              </label>
              <textarea
                rows={2}
                placeholder="Cultivated in controlled nursery conditions for optimal root development, balanced foliage growth, and seamless indoor acclimatization."
                value={productForm.shortDescription}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    shortDescription: e.target.value,
                    description: e.target.value || productForm.description,
                  })
                }
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>

            {/* Custom Tab Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Custom Tab Title
              </label>
              <input
                type="text"
                placeholder="Botanical Background & Characteristics"
                value={productForm.customTabTitle}
                onChange={(e) => setProductForm({ ...productForm, customTabTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>

            {/* Full Detailed Description (Rich Text Editor) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Detailed Description (Rendered in Description Tab with Rich Formatting)
              </label>
              <RichTextEditor
                value={productForm.fullDescriptionHtml}
                onChange={(val) => setProductForm((prev) => ({ ...prev, fullDescriptionHtml: val }))}
                placeholder="Write comprehensive botanical details, origin history, fertilizing guides, repotting intervals, and foliage characteristics..."
                minHeight="220px"
              />
            </div>

            {/* Horticulturist Care Quick Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Specific Horticulturist Care Note (Optional)
              </label>
              <input
                type="text"
                placeholder="Water once every 3 days. Medium indirect sunlight."
                value={productForm.care_instructions}
                onChange={(e) =>
                  setProductForm({ ...productForm, care_instructions: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
          </div>

          {/* ════ SECTION B: SHOPIFY DYNAMIC VARIANTS ════ */}
          <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E2EBE1] space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer">
                  <Layers className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Section B: Dynamic Product Variants (Shopify Style)</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Enable if this product has multiple options (e.g. Pot Size, Pack Weight, Soil Volume).
                </p>
              </div>
              <Switch
                checked={productForm.hasVariants}
                onChange={(checked) =>
                  setProductForm((prev) => ({ ...prev, hasVariants: checked }))
                }
              />
            </div>

            {productForm.hasVariants && (
              <div className="space-y-3 pt-2 border-t border-[#E2EBE1]">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Variant Group Title (Label displayed to shoppers above options)
                  </label>
                  <input
                    type="text"
                    placeholder='e.g. "Select Pot & Specimen Size" or "Pack Size"'
                    value={productForm.variantGroupTitle}
                    onChange={(e) =>
                      setProductForm({ ...productForm, variantGroupTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Variant Options &amp; Pricing Repeater
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {productForm.variants?.length || 0} variant(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {productForm.variants?.map((v, idx) => (
                      <div
                        key={`variant-row-${idx}`}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 shadow-2xs"
                      >
                        <div className="flex-2 min-w-[140px]">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                            Option Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder='e.g. 4" Nursery Pot or 1 KG Bag'
                            value={v.name}
                            onChange={(e) => handleUpdateVariant(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>

                        <div className="flex-1 min-w-[90px]">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                            Price (৳) *
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder="220"
                            value={v.price}
                            onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>

                        <div className="flex-1 min-w-[90px]">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                            Original (৳)
                          </label>
                          <input
                            type="number"
                            min={0}
                            placeholder="295"
                            value={v.originalPrice}
                            onChange={(e) =>
                              handleUpdateVariant(idx, "originalPrice", e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>

                        <div className="flex-1 min-w-[70px]">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                            Stock
                          </label>
                          <input
                            type="number"
                            min={0}
                            placeholder="50"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, "stock", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>

                        <div className="flex-1 min-w-[80px]">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                            SKU
                          </label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>

                        <div className="sm:self-end pb-0.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Remove variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#2D6A4F] text-[#2D6A4F] hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Variant Option</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ════ SECTION C: BOTANICAL CARE GUIDE TAB SETTINGS ════ */}
          <div className="p-4 rounded-2xl bg-[#F7FAF6] border border-[#DDE8D9] space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer">
                  <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Botanical Care Guide Tab Settings</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Enable Care Guide Tab for this product (Admins can toggle OFF for fertilizers, soils, and pots).
                </p>
              </div>
              <Switch
                checked={productForm.hasCareGuide !== false}
                onChange={(checked) =>
                  setProductForm((prev) => ({ ...prev, hasCareGuide: checked }))
                }
              />
            </div>

            {productForm.hasCareGuide !== false && (
              <div className="space-y-3.5 pt-3 border-t border-[#E2EBE1]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>1. Light &amp; Location</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Position in bright indirect sunlight. Avoid midday western sun."
                      value={productForm.careGuide?.lightLocation || ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          careGuide: { ...(prev.careGuide || {}), lightLocation: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>2. Hydration &amp; Watering</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Water thoroughly once top 1-2 inches of soil feel dry."
                      value={productForm.careGuide?.hydrationWatering || ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          careGuide: { ...(prev.careGuide || {}), hydrationWatering: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3. Safety, Nutrition &amp; Difficulty</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Non-toxic to pets. Apply vermicompost monthly."
                      value={productForm.careGuide?.safetyDifficulty || ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          careGuide: { ...(prev.careGuide || {}), safetyDifficulty: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>4. Specific Horticulturist Note</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Fill with well-draining mix..."
                      value={productForm.careGuide?.horticulturistNote || ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          careGuide: { ...(prev.careGuide || {}), horticulturistNote: e.target.value },
                          care_instructions: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] resize-none"
                    />
                  </div>
                </div>

                {/* Quick Badges Row */}
                <div className="pt-2 border-t border-[#E2EBE1]">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Care Badges
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Sunlight</label>
                      <input
                        type="text"
                        placeholder="Medium Indirect"
                        value={productForm.careBadges?.sunlight}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            careBadges: { ...productForm.careBadges, sunlight: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Water</label>
                      <input
                        type="text"
                        placeholder="Once a week"
                        value={productForm.careBadges?.water}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            careBadges: { ...productForm.careBadges, water: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Pet Safety</label>
                      <input
                        type="text"
                        placeholder="Non-Toxic"
                        value={productForm.careBadges?.petSafe}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            careBadges: { ...productForm.careBadges, petSafe: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Difficulty</label>
                      <input
                        type="text"
                        placeholder="Beginner"
                        value={productForm.careBadges?.difficulty}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            careBadges: { ...productForm.careBadges, difficulty: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProduct}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingProduct ? "Saving…" : editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD EXPENSE MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-[#1A2E22]">
            💸 Record New Nursery Expense
          </div>
        }
        open={isExpenseModalOpen}
        onCancel={() => setIsExpenseModalOpen(false)}
        footer={null}
        width={520}
      >
        <form onSubmit={handleSaveExpense} className="space-y-3.5 pt-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nursery Worker Weekly Wages, Organic Compost, Delivery Bags"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Amount (৳) *
              </label>
              <input
                type="number"
                required
                min={0}
                step="any"
                placeholder="e.g. 1500"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              >
                <option value="Salary">Salary</option>
                <option value="Packaging">Packaging</option>
                <option value="Utilities">Utilities</option>
                <option value="Nursery Care">Nursery Care</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Receipt voucher no, vendor name or details..."
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingExpense}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingExpense ? "Saving..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT CATEGORY MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-[#1A2E22] flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#2D6A4F]" />
            <span>{editingCategory ? "Edit Category Details" : "Create New Nursery Category"}</span>
          </div>
        }
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        footer={null}
        width={620}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 pt-3">
          {/* Name & Auto-slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bonsai & Rare Palms"
                value={categoryForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = val
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/[\s_-]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: val,
                    slug: editingCategory ? prev.slug : autoSlug,
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Slug (URL Identifier) *
              </label>
              <input
                type="text"
                required
                placeholder="bonsai-rare-palms"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[\s_]+/g, "-"),
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description / Botanical Scope
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of plants or goods in this collection..."
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          {/* Cloudinary Image Upload with Client Compression */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Category Cover Image (Cloudinary Auto-Compressed)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/40 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer shrink-0">
                {uploadingCatImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                )}
                <span>{uploadingCatImage ? "Compressing & Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryUploadImage}
                  disabled={uploadingCatImage}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                placeholder="Or paste Cloudinary / Unsplash image URL..."
                value={categoryForm.image}
                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
              />
            </div>

            {categoryForm.image && (
              <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
                <img
                  src={categoryForm.image}
                  alt="Category Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-700 truncate">Image Preview</p>
                  <p className="text-[10px] text-gray-400 truncate font-mono">{categoryForm.image}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, image: "" })}
                  className="p-1 rounded-md text-red-500 hover:bg-red-50 text-xs cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Display Order */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Display Order Priority
            </label>
            <input
              type="number"
              min={0}
              value={categoryForm.order}
              onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#40916C]/40"
            />
          </div>

          {/* Unlist from Collections Page Switch */}
          <div className="pt-2 p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Unlist from Collections Page (কালেকশনস পেজে লুকানো থাকবে)
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Hidden from /collections page, but available for homepage tabs and campaigns.
              </p>
            </div>
            <Switch
              checked={categoryForm.isUnlisted}
              onChange={(checked) =>
                setCategoryForm((prev) => ({ ...prev, isUnlisted: checked }))
              }
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              ASSIGN PRODUCTS TO THIS COLLECTION (এই কালেকশনের প্রোডাক্টসমূহ)
          ═══════════════════════════════════════════════════════════════════════ */}
          <div className="pt-2 p-3.5 bg-[#F4F7F2] border border-[#E2E8DC] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#1A2E22]">
                  Assign Products to this Collection (এই কালেকশনের প্রোডাক্টসমূহ)
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select products that belong to this nursery collection.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#2D6A4F] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                {(categoryForm.productIds || []).length} assigned
              </span>
            </div>

            {/* Product search bar */}
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={catProductSearch}
                onChange={(e) => setCatProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-[#1A2E22] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            {/* Scrollable list of all store products */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {products
                .filter((p) =>
                  !catProductSearch.trim() ||
                  p.title?.toLowerCase().includes(catProductSearch.toLowerCase().trim())
                )
                .map((p) => {
                  const pId = p._id.toString();
                  const isChecked = (categoryForm.productIds || []).includes(pId);
                  const pImage =
                    (Array.isArray(p.images) && p.images[0]) ||
                    p.image ||
                    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

                  return (
                    <label
                      key={pId}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-white border-[#2D6A4F] shadow-xs"
                          : "bg-white/70 border-gray-100 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = categoryForm.productIds || [];
                          const next = e.target.checked
                            ? [...current, pId]
                            : current.filter((id) => id !== pId);
                          setCategoryForm((prev) => ({ ...prev, productIds: next }));
                        }}
                        className="w-4 h-4 rounded text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer accent-[#2D6A4F]"
                      />
                      <img
                        src={pImage}
                        alt={p.title}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A2E22] truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          ৳{p.price} · Stock: {p.stock_quantity ?? p.stock ?? 0}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {products.length === 0 && (
                <p className="text-center py-4 text-xs text-gray-400">
                  No products available in nursery.
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCategory || uploadingCatImage}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingCategory ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
