"use client";

import { useState, useEffect } from "react";
import { App, Modal, Switch } from "antd";
import imageCompression from "browser-image-compression";
import {
  Compass,
  Layers,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Check,
  X,
  ExternalLink,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  LayoutGrid,
  Columns,
  FolderTree,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Sliders,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const SYSTEM_PAGES = [
  { label: "Home", url: "/" },
  { label: "All Products", url: "/products" },
  { label: "Collections", url: "/collections" },
  { label: "Track Order", url: "/track-order" },
  { label: "Wishlist", url: "/wishlist" },
  { label: "About Us", url: "/about" },
  { label: "Contact Us", url: "/contact" },
  { label: "Today's Deals", url: "/#deals" },
  { label: "Plant Care Guides", url: "/#plant-care-guides" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms & Conditions", url: "/terms" },
  { label: "Return & Refund Policy", url: "/refund" },
];

const DEFAULT_FOOTER_COLUMN_OPTIONS = [
  "Shop",
  "Company",
  "Customer Service",
  "Legal",
];

const QUICK_GROUP_SUGGESTIONS = [
  "By Space",
  "By Type",
  "Popular",
  "Care Essentials",
  "Soil Nutrition",
  "Vessels & Pots",
];

export default function NavigationManagerTab({ categories: propCategories = [] }) {
  const { message: antdMessage } = App.useApp();

  // Navigation sub-tab: "navbar" | "footer"
  const [navSubTab, setNavSubTab] = useState("navbar");

  // Menus data
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(propCategories);

  // Navbar Modal State
  const [isNavbarModalOpen, setIsNavbarModalOpen] = useState(false);
  const [editingNavbarItem, setEditingNavbarItem] = useState(null);
  const [savingNavbar, setSavingNavbar] = useState(false);
  const [uploadingPromoImage, setUploadingPromoImage] = useState(false);

  // Navbar Form
  const [navbarForm, setNavbarForm] = useState({
    label: "",
    urlType: "pages", // "pages" | "collections" | "custom"
    url: "/",
    menuType: "standard", // "standard" | "dropdown" | "mega_menu"
    isActive: true,
    items: [],
    megaMenuPromo: {
      isEnabled: true,
      badge: "Featured Specimen",
      title: "Trending Indoor Plants",
      subtitle: "Up to 25% Off Nursery Picks",
      imageUrl: "",
      link: "/collections",
    },
  });

  // Footer Modal State
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [editingFooterItem, setEditingFooterItem] = useState(null);
  const [savingFooter, setSavingFooter] = useState(false);

  // Footer Form
  const [footerForm, setFooterForm] = useState({
    label: "",
    urlType: "pages",
    url: "/",
    footerColumn: "Shop",
    customColumn: "",
    isActive: true,
  });

  // Fetch menus
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      if (data.success && Array.isArray(data.menus)) {
        setMenus(data.menus);
      }
    } catch (err) {
      console.error("Failed to load navigation menus:", err);
      antdMessage.error("Failed to load navigation menus");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories if not passed
  useEffect(() => {
    if (propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      fetch("/api/admin/categories")
        .then((res) => res.json())
        .then((data) => {
          const list = data.categories || data.data;
          if (data.success && Array.isArray(list)) {
            setCategories(list);
          }
        })
        .catch(() => {});
    }
    fetchMenus();
  }, [propCategories]);

  // Cloudinary image uploader
  const handleUploadPromoImage = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      antdMessage.error("Cloudinary credentials are not configured in environment variables.");
      return;
    }

    try {
      setUploadingPromoImage(true);
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
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
        setNavbarForm((prev) => ({
          ...prev,
          megaMenuPromo: {
            ...prev.megaMenuPromo,
            imageUrl: data.secure_url,
          },
        }));
        antdMessage.success("Promotional image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      antdMessage.error(err.message || "Failed to upload promotional image");
    } finally {
      setUploadingPromoImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Toggle active status
  const handleToggleActive = async (item) => {
    try {
      const nextActive = !item.isActive;
      setMenus((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, isActive: nextActive } : m))
      );

      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to toggle status");
      }
      antdMessage.success(`Link "${item.label}" ${nextActive ? "activated" : "hidden"}`);
    } catch (err) {
      antdMessage.error(err.message);
      fetchMenus();
    }
  };

  // Move item in order
  const handleMoveOrder = async (list, index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const copy = [...list];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    const reordered = copy.map((m, idx) => ({ ...m, order: idx }));

    // Update local state
    setMenus((prev) =>
      prev.map((m) => {
        const found = reordered.find((x) => x._id === m._id);
        return found || m;
      })
    );

    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menus: reordered.map((s) => ({ _id: s._id, order: s.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order");
      }
      antdMessage.success("Menu order updated");
    } catch (err) {
      antdMessage.error(err.message);
      fetchMenus();
    }
  };

  // Delete item
  const handleDeleteItem = (item) => {
    Modal.confirm({
      title: "Remove Navigation Link?",
      content: `Are you sure you want to delete "${item.label}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/menu/${item._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete item");
          }
          antdMessage.success(`Deleted "${item.label}"`);
          fetchMenus();
        } catch (err) {
          antdMessage.error(err.message);
        }
      },
    });
  };

  // Reset to verified botanical defaults
  const handleResetDefaults = (targetLoc = "all") => {
    Modal.confirm({
      title: "Restore Verified Botanical Defaults?",
      content:
        targetLoc === "all"
          ? "This will reset all Navbar and Footer navigation links to default botanical collections and pages."
          : `This will reset all ${targetLoc === "navbar" ? "Navbar" : "Footer"} links to verified defaults.`,
      okText: "Restore Defaults",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch("/api/admin/menu", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "seed_default", location: targetLoc }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to reset menu");
          }
          antdMessage.success("Navigation reset to defaults");
          fetchMenus();
        } catch (err) {
          antdMessage.error(err.message);
        }
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Navbar Modal Open / Save
  // ─────────────────────────────────────────────────────────────────────────────
  const detectUrlType = (url) => {
    if (!url) return "pages";
    if (SYSTEM_PAGES.some((p) => p.url === url)) return "pages";
    if (url.startsWith("/collections/")) return "collections";
    return "custom";
  };

  const handleOpenAddNavbar = () => {
    setEditingNavbarItem(null);
    setNavbarForm({
      label: "",
      urlType: "pages",
      url: "/",
      menuType: "standard",
      isActive: true,
      items: [],
      megaMenuPromo: {
        isEnabled: false,
        badge: "Featured Specimen",
        title: "Trending Indoor Plants",
        subtitle: "Up to 25% Off Nursery Picks",
        imageUrl: "",
        link: "/collections",
      },
    });
    setIsNavbarModalOpen(true);
  };

  const handleOpenEditNavbar = (item) => {
    setEditingNavbarItem(item);
    setNavbarForm({
      label: item.label || "",
      urlType: detectUrlType(item.url),
      url: item.url || "/",
      menuType: item.menuType || "standard",
      isActive: item.isActive !== false,
      items: Array.isArray(item.items)
        ? item.items.map((it) => ({
            _id: it._id,
            label: it.label || "",
            url: it.url || "/",
            group: it.group || "General",
            urlType: detectUrlType(it.url),
          }))
        : [],
      megaMenuPromo: {
        isEnabled: Boolean(item.megaMenuPromo?.isEnabled),
        badge: item.megaMenuPromo?.badge || "Featured Specimen",
        title: item.megaMenuPromo?.title || "Trending Indoor Plants",
        subtitle: item.megaMenuPromo?.subtitle || "Up to 25% Off",
        imageUrl: item.megaMenuPromo?.imageUrl || "",
        link: item.megaMenuPromo?.link || "/collections",
      },
    });
    setIsNavbarModalOpen(true);
  };

  const handleSaveNavbar = async (e) => {
    e.preventDefault();
    if (!navbarForm.label.trim()) {
      antdMessage.error("Please provide a navigation label");
      return;
    }

    setSavingNavbar(true);
    try {
      const payload = {
        label: navbarForm.label.trim(),
        url: navbarForm.url.trim() || "#",
        location: "navbar",
        menuType: navbarForm.menuType,
        isActive: navbarForm.isActive,
        items:
          navbarForm.menuType === "standard"
            ? []
            : navbarForm.items.map((it) => ({
                label: it.label.trim(),
                url: it.url.trim() || "#",
                group: it.group?.trim() || "General",
              })),
        megaMenuPromo:
          navbarForm.menuType === "mega_menu"
            ? navbarForm.megaMenuPromo
            : { isEnabled: false },
      };

      if (editingNavbarItem) {
        const res = await fetch(`/api/admin/menu/${editingNavbarItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Navbar link updated successfully");
      } else {
        const res = await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Navbar link created successfully");
      }

      setIsNavbarModalOpen(false);
      fetchMenus();
    } catch (err) {
      antdMessage.error(err.message || "Failed to save navbar item");
    } finally {
      setSavingNavbar(false);
    }
  };

  // Sub-items management in Navbar modal
  const handleAddSubItem = () => {
    setNavbarForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          label: "",
          url: "/",
          group: prev.items.length > 0 ? prev.items[prev.items.length - 1].group : "By Space",
          urlType: "pages",
        },
      ],
    }));
  };

  const handleRemoveSubItem = (idx) => {
    setNavbarForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateSubItem = (idx, field, val) => {
    setNavbarForm((prev) => {
      const copy = [...prev.items];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, items: copy };
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Footer Modal Open / Save
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenAddFooter = (preselectedColumn = "Shop") => {
    setEditingFooterItem(null);
    setFooterForm({
      label: "",
      urlType: "pages",
      url: "/",
      footerColumn: preselectedColumn,
      customColumn: "",
      isActive: true,
    });
    setIsFooterModalOpen(true);
  };

  const handleOpenEditFooter = (item) => {
    setEditingFooterItem(item);
    const isCustom = !DEFAULT_FOOTER_COLUMN_OPTIONS.includes(item.footerColumn || "Shop");
    setFooterForm({
      label: item.label || "",
      urlType: detectUrlType(item.url),
      url: item.url || "/",
      footerColumn: isCustom ? "custom" : item.footerColumn || "Shop",
      customColumn: isCustom ? item.footerColumn : "",
      isActive: item.isActive !== false,
    });
    setIsFooterModalOpen(true);
  };

  const handleSaveFooter = async (e) => {
    e.preventDefault();
    if (!footerForm.label.trim()) {
      antdMessage.error("Please provide a link label");
      return;
    }

    const finalColumn =
      footerForm.footerColumn === "custom"
        ? footerForm.customColumn.trim() || "Shop"
        : footerForm.footerColumn;

    setSavingFooter(true);
    try {
      const payload = {
        label: footerForm.label.trim(),
        url: footerForm.url.trim() || "#",
        location: "footer",
        footerColumn: finalColumn,
        menuType: "standard",
        isActive: footerForm.isActive,
      };

      if (editingFooterItem) {
        const res = await fetch(`/api/admin/menu/${editingFooterItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Footer link updated successfully");
      } else {
        const res = await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Footer link created successfully");
      }

      setIsFooterModalOpen(false);
      fetchMenus();
    } catch (err) {
      antdMessage.error(err.message || "Failed to save footer item");
    } finally {
      setSavingFooter(false);
    }
  };

  // Filtered lists
  const navbarMenus = menus.filter((m) => m.location === "navbar").sort((a, b) => (a.order || 0) - (b.order || 0));
  const footerMenus = menus.filter((m) => m.location === "footer").sort((a, b) => (a.order || 0) - (b.order || 0));

  // Footer grouped by column
  const footerColumnsMap = footerMenus.reduce((acc, item) => {
    const col = item.footerColumn || "Shop";
    if (!acc[col]) acc[col] = [];
    acc[col].push(item);
    return acc;
  }, {});

  // Ensure default columns are always visible even if empty
  DEFAULT_FOOTER_COLUMN_OPTIONS.forEach((col) => {
    if (!footerColumnsMap[col]) footerColumnsMap[col] = [];
  });

  return (
    <div className="space-y-6">
      {/* ── Header Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-emerald-100/70 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center">
                <Compass className="w-5 h-5 stroke-[2]" />
              </span>
              <div>
                <h2 className="text-xl font-black text-[#1A2E22] tracking-tight">
                  Store Navigation & Mega Menu Architect
                </h2>
                <p className="text-xs text-[#5A6B5C] mt-0.5">
                  Design multi-level dropdowns, promotional banners, and structured footer links.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-2 bg-[#F7F8F4] p-1.5 rounded-2xl border border-emerald-100/60 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setNavSubTab("navbar")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                navSubTab === "navbar"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5A6B5C] hover:text-[#2D5A27] hover:bg-white/80"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Navbar & Mega Menus</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                navSubTab === "navbar" ? "bg-white/20 text-white" : "bg-[#EBF0E6] text-[#2D5A27]"
              }`}>
                {navbarMenus.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setNavSubTab("footer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                navSubTab === "footer"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5A6B5C] hover:text-[#2D5A27] hover:bg-white/80"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Footer Columns</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                navSubTab === "footer" ? "bg-white/20 text-white" : "bg-[#EBF0E6] text-[#2D5A27]"
              }`}>
                {footerMenus.length}
              </span>
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMenus}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#F7F8F4] text-xs font-bold text-gray-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => handleResetDefaults(navSubTab)}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 text-[#2D5A27] bg-[#EBF0E6]/50 hover:bg-[#EBF0E6] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset current location to default botanical links"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Verified Defaults</span>
            </button>
          </div>

          <div>
            {navSubTab === "navbar" ? (
              <button
                type="button"
                onClick={handleOpenAddNavbar}
                className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Navbar Item</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAddFooter("Shop")}
                className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Footer Link</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB A: TOP NAVBAR & MEGA MENU MANAGER
      ═══════════════════════════════════════════════════════════════════════ */}
      {navSubTab === "navbar" && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-14 text-center text-gray-400 border border-emerald-100/70">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-[#2D5A27] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-600">Loading Store Navigation...</p>
            </div>
          ) : navbarMenus.length === 0 ? (
            <div className="bg-white rounded-3xl p-14 text-center border border-emerald-100/70 space-y-3">
              <span className="w-12 h-12 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6 stroke-[1.8]" />
              </span>
              <h3 className="font-bold text-base text-[#1A2E22]">No Navbar Links Configured</h3>
              <p className="text-xs text-[#5A6B5C] max-w-md mx-auto">
                Click &quot;Add Navbar Item&quot; to build your primary menu or restore verified defaults with one click.
              </p>
              <button
                type="button"
                onClick={() => handleResetDefaults("navbar")}
                className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Load Default Botanical Navbar
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-emerald-100/70 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {navbarMenus.map((item, index) => {
                const isMega = item.menuType === "mega_menu";
                const isDropdown = item.menuType === "dropdown";
                const subCount = item.items?.length || 0;

                return (
                  <div
                    key={item._id}
                    className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      item.isActive ? "hover:bg-[#FAFBF9]" : "bg-gray-50/70 opacity-70"
                    }`}
                  >
                    {/* Left: Reorder, Number & Info */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Move buttons */}
                      <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(navbarMenus, index, "up")}
                          className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-[#EBF0E6] text-gray-600 hover:text-[#2D5A27] disabled:opacity-20 flex items-center justify-center transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="w-3 h-3 stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          disabled={index === navbarMenus.length - 1}
                          onClick={() => handleMoveOrder(navbarMenus, index, "down")}
                          className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-[#EBF0E6] text-gray-600 hover:text-[#2D5A27] disabled:opacity-20 flex items-center justify-center transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="w-3 h-3 stroke-[2.2]" />
                        </button>
                      </div>

                      {/* Sequence Badge */}
                      <div className="w-8 h-8 rounded-xl bg-[#EBF0E6] text-[#2D5A27] font-bold text-xs flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#1A2E22]">
                            {item.label}
                          </h4>

                          {/* Menu Type Badge */}
                          {isMega ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-600 stroke-[2.2]" />
                              <span>Mega Menu ({subCount} links)</span>
                            </span>
                          ) : isDropdown ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              <Layers className="w-3 h-3 text-sky-600 stroke-[2.2]" />
                              <span>Dropdown ({subCount} links)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF0E6] text-[#2D5A27]">
                              <span>Standard Link</span>
                            </span>
                          )}

                          {isMega && item.megaMenuPromo?.isEnabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>Promo Card Active</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6B5C]">
                          <span className="font-mono text-gray-500 truncate max-w-xs sm:max-w-md">
                            {item.url}
                          </span>
                          {(isMega || isDropdown) && subCount > 0 && (
                            <span className="text-[11px] text-gray-400">
                              Groups: {[...new Set(item.items.map((i) => i.group || "General"))].join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">
                          {item.isActive ? "Live" : "Hidden"}
                        </span>
                        <Switch
                          checked={item.isActive}
                          onChange={() => handleToggleActive(item)}
                          size="small"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditNavbar(item)}
                        className="p-2 rounded-xl text-gray-600 hover:text-[#2D5A27] hover:bg-[#EBF0E6] text-xs transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB B: DYNAMIC FOOTER COLUMNS MANAGER
      ═══════════════════════════════════════════════════════════════════════ */}
      {navSubTab === "footer" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.keys(footerColumnsMap).map((columnName) => {
              const columnLinks = footerColumnsMap[columnName] || [];

              return (
                <div
                  key={columnName}
                  className="bg-white rounded-3xl border border-emerald-100/70 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27]" />
                        <h3 className="font-extrabold text-sm text-[#1A2E22]">
                          {columnName}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF0E6] text-[#2D5A27]">
                        {columnLinks.length} links
                      </span>
                    </div>

                    {/* Links List */}
                    <div className="space-y-2">
                      {columnLinks.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-400">
                          <p>No links in this column.</p>
                        </div>
                      ) : (
                        columnLinks.map((link, idx) => (
                          <div
                            key={link._id}
                            className={`p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all flex items-center justify-between gap-2 text-xs ${
                              link.isActive ? "bg-[#FAFBF9]" : "bg-gray-50 opacity-60"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 truncate">
                                {link.label}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">
                                {link.url}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(columnLinks, idx, "up")}
                                className="p-1 rounded text-gray-400 hover:text-[#2D5A27] disabled:opacity-20 cursor-pointer"
                                title="Move up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === columnLinks.length - 1}
                                onClick={() => handleMoveOrder(columnLinks, idx, "down")}
                                className="p-1 rounded text-gray-400 hover:text-[#2D5A27] disabled:opacity-20 cursor-pointer"
                                title="Move down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditFooter(link)}
                                className="p-1 rounded text-gray-500 hover:text-[#2D5A27] cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(link)}
                                className="p-1 rounded text-red-400 hover:text-red-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add link to this column */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenAddFooter(columnName)}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 hover:border-[#2D5A27] hover:bg-[#EBF0E6]/50 text-xs font-bold text-[#2D5A27] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to {columnName}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT NAVBAR ITEM & MEGA MENU BUILDER
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-extrabold text-[#1A2E22] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#2D5A27]" />
            <span>{editingNavbarItem ? "Edit Navbar Item" : "Create Navbar Item"}</span>
          </div>
        }
        open={isNavbarModalOpen}
        onCancel={() => setIsNavbarModalOpen(false)}
        footer={null}
        width={780}
      >
        <form onSubmit={handleSaveNavbar} className="space-y-6 pt-3 max-h-[78vh] overflow-y-auto pr-1">
          {/* Label & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                Navbar Item Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Collections or Organic Fertilizers"
                value={navbarForm.label}
                onChange={(e) => setNavbarForm({ ...navbarForm, label: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                Menu Status
              </label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={navbarForm.isActive}
                  onChange={(checked) => setNavbarForm({ ...navbarForm, isActive: checked })}
                />
                <span className="text-xs font-semibold text-gray-700">
                  {navbarForm.isActive ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Link Selector */}
          <div className="space-y-2 bg-[#F7F8F4] p-4 rounded-2xl border border-emerald-100/60">
            <label className="block text-xs font-extrabold text-[#1A2E22]">
              Destination Link (Smart Link Selector)
            </label>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setNavbarForm({ ...navbarForm, urlType: "pages", url: "/" })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  navbarForm.urlType === "pages"
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                System Pages
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstCat = categories[0]?.slug || "plant";
                  setNavbarForm({
                    ...navbarForm,
                    urlType: "collections",
                    url: `/collections/${firstCat}`,
                  });
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  navbarForm.urlType === "collections"
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Collections
              </button>
              <button
                type="button"
                onClick={() => setNavbarForm({ ...navbarForm, urlType: "custom" })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  navbarForm.urlType === "custom"
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Custom URL
              </button>
            </div>

            {navbarForm.urlType === "pages" && (
              <select
                value={navbarForm.url}
                onChange={(e) => setNavbarForm({ ...navbarForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
              >
                {SYSTEM_PAGES.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label} ({p.url})
                  </option>
                ))}
              </select>
            )}

            {navbarForm.urlType === "collections" && (
              <select
                value={navbarForm.url}
                onChange={(e) => setNavbarForm({ ...navbarForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
              >
                {categories.map((c) => {
                  const targetSlug = c.slug || c.name;
                  return (
                    <option key={c._id || targetSlug} value={`/collections/${targetSlug}`}>
                      {c.name} (/collections/{targetSlug})
                    </option>
                  );
                })}
              </select>
            )}

            {navbarForm.urlType === "custom" && (
              <input
                type="text"
                placeholder="e.g. /custom-route or https://example.com"
                value={navbarForm.url}
                onChange={(e) => setNavbarForm({ ...navbarForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 font-mono rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
              />
            )}
          </div>

          {/* Menu Type Radio Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800">
              Menu Type Display
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "standard",
                  title: "Standard Link",
                  desc: "Single clean clickable link with hover indicator",
                },
                {
                  id: "dropdown",
                  title: "Simple Dropdown",
                  desc: "Floating card dropdown with organized sub-links",
                },
                {
                  id: "mega_menu",
                  title: "Mega Menu",
                  desc: "Full multi-column categorized grid + Promo Card",
                },
              ].map((pill) => {
                const isSelected = navbarForm.menuType === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setNavbarForm({ ...navbarForm, menuType: pill.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#2D5A27] bg-[#EBF0E6]/60 text-[#2D5A27] ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{pill.title}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {pill.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-items builder if dropdown or mega_menu */}
          {navbarForm.menuType !== "standard" && (
            <div className="space-y-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-[#1A2E22]">
                    Sub-Links Catalog ({navbarForm.items.length})
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Group links into columns (e.g. &quot;By Space&quot;, &quot;By Type&quot;, &quot;Popular&quot;).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSubItem}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Sub-Link</span>
                </button>
              </div>

              {/* Sub items rows */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {navbarForm.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p>No sub-links yet. Click &quot;Add Sub-Link&quot; above.</p>
                  </div>
                ) : (
                  navbarForm.items.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-emerald-100/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700">
                          Sub-Link #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubItem(idx)}
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Sub link label */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Link Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Indoor Air Purifiers"
                            value={sub.label}
                            onChange={(e) => handleUpdateSubItem(idx, "label", e.target.value)}
                            className="w-full bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2D5A27]"
                          />
                        </div>

                        {/* Sub link group */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Group / Column Name
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="e.g. By Space, Popular"
                              value={sub.group}
                              onChange={(e) => handleUpdateSubItem(idx, "group", e.target.value)}
                              className="w-full bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2D5A27]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub link smart target URL */}
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Destination Path
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={sub.url}
                            onChange={(e) => handleUpdateSubItem(idx, "url", e.target.value)}
                            className="flex-1 bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2D5A27]"
                          >
                            <optgroup label="System Pages">
                              {SYSTEM_PAGES.map((p) => (
                                <option key={p.url} value={p.url}>
                                  {p.label} ({p.url})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Botanical Collections">
                              {categories.map((c) => (
                                <option
                                  key={c._id || c.slug}
                                  value={`/collections/${c.slug || c.name}`}
                                >
                                  {c.name} (/collections/{c.slug || c.name})
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          <input
                            type="text"
                            placeholder="Or type custom URL"
                            value={sub.url}
                            onChange={(e) => handleUpdateSubItem(idx, "url", e.target.value)}
                            className="w-48 bg-white border border-gray-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2D5A27]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Right-Side Promotional Banner Section if Mega Menu */}
          {navbarForm.menuType === "mega_menu" && (
            <div className="space-y-4 pt-4 border-t border-gray-100 bg-[#FAFBF9] p-4 rounded-2xl border border-emerald-100/70">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-[#1A2E22] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Right-Side Promotional Banner Section</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Displays a featured plant image, offer badge, and direct call-to-action in the mega dropdown.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-medium">Enable Banner:</span>
                  <Switch
                    checked={navbarForm.megaMenuPromo?.isEnabled}
                    onChange={(checked) =>
                      setNavbarForm({
                        ...navbarForm,
                        megaMenuPromo: {
                          ...navbarForm.megaMenuPromo,
                          isEnabled: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {navbarForm.megaMenuPromo?.isEnabled && (
                <div className="space-y-3 pt-2">
                  {/* Image uploader */}
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-3">
                    <label className="block text-xs font-bold text-gray-800">
                      Promotional Image (Cloudinary CDN)
                    </label>

                    {navbarForm.megaMenuPromo.imageUrl ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={navbarForm.megaMenuPromo.imageUrl}
                            alt="Promo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <p className="text-xs font-mono text-gray-500 truncate">
                            {navbarForm.megaMenuPromo.imageUrl}
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5 text-gray-600" />
                              <span>Replace</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadPromoImage}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setNavbarForm({
                                  ...navbarForm,
                                  megaMenuPromo: {
                                    ...navbarForm.megaMenuPromo,
                                    imageUrl: "",
                                  },
                                })
                              }
                              className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 hover:border-[#2D5A27] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F7F8F4]">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs font-bold text-gray-700">
                          {uploadingPromoImage ? "Compressing & Uploading to Cloudinary..." : "Click to Upload Banner Image"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          WebP, JPG, or PNG (Auto-compressed)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPromoImage}
                          onChange={handleUploadPromoImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Promo Badge, Title & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700">
                        Promo Badge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Featured Specimen"
                        value={navbarForm.megaMenuPromo.badge}
                        onChange={(e) =>
                          setNavbarForm({
                            ...navbarForm,
                            megaMenuPromo: {
                              ...navbarForm.megaMenuPromo,
                              badge: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Headline Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Trending Indoor Plants"
                        value={navbarForm.megaMenuPromo.title}
                        onChange={(e) =>
                          setNavbarForm({
                            ...navbarForm,
                            megaMenuPromo: {
                              ...navbarForm.megaMenuPromo,
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700">
                        Subtitle / Discount Pitch
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Up to 25% Off Nursery Fresh"
                        value={navbarForm.megaMenuPromo.subtitle}
                        onChange={(e) =>
                          setNavbarForm({
                            ...navbarForm,
                            megaMenuPromo: {
                              ...navbarForm.megaMenuPromo,
                              subtitle: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700">
                        Banner CTA Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /collections"
                        value={navbarForm.megaMenuPromo.link}
                        onChange={(e) =>
                          setNavbarForm({
                            ...navbarForm,
                            megaMenuPromo: {
                              ...navbarForm.megaMenuPromo,
                              link: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNavbarModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingNavbar}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingNavbar && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{savingNavbar ? "Saving Navbar Item..." : "Save Navbar Item"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT FOOTER LINK
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-extrabold text-[#1A2E22] flex items-center gap-2">
            <Columns className="w-5 h-5 text-[#2D5A27]" />
            <span>{editingFooterItem ? "Edit Footer Link" : "Add Footer Link"}</span>
          </div>
        }
        open={isFooterModalOpen}
        onCancel={() => setIsFooterModalOpen(false)}
        footer={null}
        width={500}
      >
        <form onSubmit={handleSaveFooter} className="space-y-4 pt-3">
          {/* Target Column */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Footer Column Group
            </label>
            <select
              value={footerForm.footerColumn}
              onChange={(e) => setFooterForm({ ...footerForm, footerColumn: e.target.value })}
              className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
            >
              {DEFAULT_FOOTER_COLUMN_OPTIONS.map((col) => (
                <option key={col} value={col}>
                  {col} Column
                </option>
              ))}
              <option value="custom">+ Create New Column Name</option>
            </select>

            {footerForm.footerColumn === "custom" && (
              <input
                type="text"
                placeholder="Enter new column name (e.g. Care Guides)"
                value={footerForm.customColumn}
                onChange={(e) => setFooterForm({ ...footerForm, customColumn: e.target.value })}
                className="w-full mt-2 bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2 focus:outline-none focus:border-[#2D5A27]"
              />
            )}
          </div>

          {/* Link Label */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Link Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Air Purifier Plants"
              value={footerForm.label}
              onChange={(e) => setFooterForm({ ...footerForm, label: e.target.value })}
              className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
            />
          </div>

          {/* Smart Link Selector */}
          <div className="space-y-2 bg-[#F7F8F4] p-3.5 rounded-2xl border border-emerald-100/60">
            <label className="block text-xs font-bold text-[#1A2E22]">
              Destination Link Selector
            </label>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFooterForm({ ...footerForm, urlType: "pages", url: "/" })}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  footerForm.urlType === "pages"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Pages
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstCat = categories[0]?.slug || "plant";
                  setFooterForm({
                    ...footerForm,
                    urlType: "collections",
                    url: `/collections/${firstCat}`,
                  });
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  footerForm.urlType === "collections"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Collections
              </button>
              <button
                type="button"
                onClick={() => setFooterForm({ ...footerForm, urlType: "custom" })}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  footerForm.urlType === "custom"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Custom URL
              </button>
            </div>

            {footerForm.urlType === "pages" && (
              <select
                value={footerForm.url}
                onChange={(e) => setFooterForm({ ...footerForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              >
                {SYSTEM_PAGES.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label} ({p.url})
                  </option>
                ))}
              </select>
            )}

            {footerForm.urlType === "collections" && (
              <select
                value={footerForm.url}
                onChange={(e) => setFooterForm({ ...footerForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              >
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={`/collections/${c.slug || c.name}`}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {footerForm.urlType === "custom" && (
              <input
                type="text"
                placeholder="e.g. /refund or https://..."
                value={footerForm.url}
                onChange={(e) => setFooterForm({ ...footerForm, url: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              />
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={footerForm.isActive}
              onChange={(checked) => setFooterForm({ ...footerForm, isActive: checked })}
            />
            <span className="text-xs font-semibold text-gray-700">
              {footerForm.isActive ? "Active in Footer" : "Hidden"}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFooterModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingFooter}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {savingFooter ? "Saving..." : "Save Footer Link"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
