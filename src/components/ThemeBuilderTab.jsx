"use client";

import { useState, useEffect } from "react";
import { App, Modal, Switch, Tag } from "antd";
import {
  AppstoreOutlined,
  MenuOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  TagOutlined,
  CompassOutlined,
  LinkOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const SECTION_TYPE_META = {
  hero: { label: "Hero Banner", icon: "🌟", color: "gold" },
  categories: { label: "Stats & Counters", icon: "📊", color: "blue" },
  products: { label: "Products Catalog Grid", icon: "🛍️", color: "green" },
  features: { label: "Why Choose Us / Features", icon: "🌿", color: "cyan" },
  promo_banner: { label: "Special Promo Banner", icon: "🏷️", color: "volcano" },
  faq: { label: "FAQ Accordion", icon: "❓", color: "purple" },
  testimonials: { label: "Customer Reviews", icon: "⭐", color: "orange" },
  custom_banner: { label: "Custom Media Banner", icon: "🖼️", color: "magenta" },
};

const TEMPLATE_PRESETS = [
  {
    type: "promo_banner",
    title: "Monsoon Plant Sale — Flat 20% Off",
    subtitle: "Use coupon code MONSOON20 on all indoor plants and ceramic pots this week.",
    icon: "🏷️",
    desc: "Vibrant promotional banner with call-to-action button and discount badge.",
    content: {
      badgeText: "🌿 Limited Time Offer",
      buttonText: "Shop Sale Plants ↗",
      buttonLink: "/products?category=plant",
    },
  },
  {
    type: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about ordering live plants and fertilizers online.",
    icon: "❓",
    desc: "Expandable questions & answers accordion to address customer doubts.",
    content: {
      badgeText: "Help & Guidance",
      items: [
        {
          q: "How do you pack live plants for courier delivery?",
          a: "Every plant is placed in custom breathable, shock-absorbing plant cradles with root moisture wraps to guarantee safe delivery.",
        },
        {
          q: "What happens if a plant arrives damaged or dead?",
          a: "We offer a 100% Free 48-Hour Live Plant Replacement Guarantee. Simply message our WhatsApp (+880 1712-345678) with photo proof.",
        },
        {
          q: "Can I pay Cash on Delivery (COD)?",
          a: "Yes! Cash on Delivery is available across all 64 districts in Bangladesh.",
        },
      ],
    },
  },
  {
    type: "testimonials",
    title: "Loved by Over 10,000 Plant Parents",
    subtitle: "Real stories from plant enthusiasts across Bangladesh who turned their homes green.",
    icon: "⭐",
    desc: "Customer review cards showcasing satisfaction, ratings, and feedback.",
    content: {
      badgeText: "Customer Reviews",
      items: [
        {
          name: "Dr. Farhana Yasmin",
          role: "Verified Buyer · Dhanmondi, Dhaka",
          review: "My Monstera arrived in pristine condition with fresh dewy leaves. Their shockproof packaging is unmatched in Bangladesh!",
          rating: 5,
        },
        {
          name: "Sabbir Ahmed",
          role: "Rooftop Gardener · Chittagong",
          review: "The organic vermicompost made my rose and jasmine plants bloom profusely within two weeks. Excellent customer support.",
          rating: 5,
        },
        {
          name: "Nusrat Jahan",
          role: "Apartment Plant Lover · Sylhet",
          review: "Fast delivery and the free plant doctor advice on WhatsApp saved my Peace Lily from drooping. Highly recommend GreenLeaf!",
          rating: 5,
        },
      ],
    },
  },
  {
    type: "custom_banner",
    title: "Transform Your Workplace into an Oasis",
    subtitle: "Custom corporate indoor plant installations and weekly nursery maintenance for offices.",
    icon: "🖼️",
    desc: "Customizable callout banner with custom title, subtitle, and CTA link.",
    content: {
      badgeText: "Corporate Plant Service",
      buttonText: "Request Consultation",
      buttonLink: "/contact",
      imageUrl: "",
    },
  },
];

export default function ThemeBuilderTab() {
  const { message: antdMessage } = App.useApp();

  // Active Sub-Tab: "sections" | "menu"
  const [activeSubTab, setActiveSubTab] = useState("sections");

  // ─── Sections State ──────────────────────────────────────────────────────────
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(false);

  // Form state for Section Edit
  const [sectionForm, setSectionForm] = useState({
    title: "",
    subtitle: "",
    badgeText: "",
    buttonText: "",
    buttonLink: "",
    secondaryBtnText: "",
    secondaryBtnLink: "",
    imageUrl: "",
    items: [], // For FAQ or Testimonials
  });

  // ─── Menus State ─────────────────────────────────────────────────────────────
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [menuLocation, setMenuLocation] = useState("navbar"); // "navbar" | "footer"
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({
    label: "",
    url: "",
    location: "navbar",
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetchers
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const res = await fetch("/api/admin/sections");
      const data = await res.json();
      if (data.success && Array.isArray(data.sections)) {
        setSections(data.sections);
      }
    } catch (err) {
      console.error("Failed to load sections:", err);
      antdMessage.error("Failed to load homepage sections");
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      if (data.success && Array.isArray(data.menus)) {
        setMenus(data.menus);
      }
    } catch (err) {
      console.error("Failed to load menus:", err);
      antdMessage.error("Failed to load navigation menus");
    } finally {
      setLoadingMenus(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchMenus();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Section Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleToggleSection = async (section) => {
    try {
      const nextActive = !section.isActive;
      // Optimistic update
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, isActive: nextActive } : s))
      );

      const res = await fetch("/api/admin/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section._id, isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to toggle section status");
      }
      antdMessage.success(
        `Section "${section.title || section.sectionType}" is now ${nextActive ? "LIVE" : "HIDDEN"}`
      );
    } catch (err) {
      antdMessage.error(err.message);
      fetchSections();
    }
  };

  const handleMoveSection = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    // Update order property
    const reordered = newSections.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);

    try {
      const res = await fetch("/api/admin/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: reordered.map((s) => ({ _id: s._id, order: s.order })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save order");
      }
      antdMessage.success("Section reordered successfully");
    } catch (err) {
      antdMessage.error(err.message);
      fetchSections();
    }
  };

  const handleOpenEditSection = (section) => {
    setEditingSection(section);
    const content = section.content || {};
    setSectionForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      badgeText: content.badgeText || "",
      buttonText: content.buttonText || content.primaryBtnText || "",
      buttonLink: content.buttonLink || content.primaryBtnLink || "",
      secondaryBtnText: content.secondaryBtnText || "",
      secondaryBtnLink: content.secondaryBtnLink || "",
      imageUrl: content.imageUrl || "",
      items: Array.isArray(content.items) ? JSON.parse(JSON.stringify(content.items)) : [],
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!editingSection) return;

    setSavingSection(true);
    try {
      const updatedContent = {
        ...(editingSection.content || {}),
        badgeText: sectionForm.badgeText,
        buttonText: sectionForm.buttonText,
        buttonLink: sectionForm.buttonLink,
        primaryBtnText: sectionForm.buttonText,
        primaryBtnLink: sectionForm.buttonLink,
        secondaryBtnText: sectionForm.secondaryBtnText,
        secondaryBtnLink: sectionForm.secondaryBtnLink,
        imageUrl: sectionForm.imageUrl,
        items: sectionForm.items,
      };

      const res = await fetch(`/api/admin/sections/${editingSection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sectionForm.title,
          subtitle: sectionForm.subtitle,
          content: updatedContent,
          order: editingSection.order,
          isActive: editingSection.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update section");
      }

      antdMessage.success("Section content updated successfully!");
      setIsSectionModalOpen(false);
      fetchSections();
    } catch (err) {
      antdMessage.error(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  const handleCreateFromTemplate = async (template) => {
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: template.type,
          title: template.title,
          subtitle: template.subtitle,
          content: template.content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add section template");
      }

      antdMessage.success(`Added new "${template.title}" section to homepage!`);
      setIsTemplateModalOpen(false);
      fetchSections();
    } catch (err) {
      antdMessage.error(err.message);
    }
  };

  const handleDeleteSection = (section) => {
    Modal.confirm({
      title: "Delete Section?",
      content: `Are you sure you want to remove "${section.title || section.sectionType}" from the homepage?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/sections/${section._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete section");
          }
          antdMessage.success("Section removed");
          fetchSections();
        } catch (err) {
          antdMessage.error(err.message);
        }
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Menu Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const currentMenus = menus.filter((m) => m.location === menuLocation);

  const handleToggleMenu = async (item) => {
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
        throw new Error(data.message || "Failed to toggle menu status");
      }
      antdMessage.success(`Link "${item.label}" ${nextActive ? "enabled" : "disabled"}`);
    } catch (err) {
      antdMessage.error(err.message);
      fetchMenus();
    }
  };

  const handleMoveMenu = async (index, direction) => {
    const list = [...currentMenus];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reorderedList = list.map((m, idx) => ({ ...m, order: idx }));

    // Update local state
    setMenus((prev) =>
      prev.map((m) => {
        const found = reorderedList.find((x) => x._id === m._id);
        return found || m;
      })
    );

    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menus: reorderedList.map((m) => ({ _id: m._id, order: m.order })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save link order");
      }
      antdMessage.success("Menu order updated");
    } catch (err) {
      antdMessage.error(err.message);
      fetchMenus();
    }
  };

  const handleOpenAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      label: "",
      url: "",
      location: menuLocation,
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item) => {
    setEditingMenu(item);
    setMenuForm({
      label: item.label,
      url: item.url,
      location: item.location,
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.label.trim() || !menuForm.url.trim()) {
      antdMessage.error("Label and URL are required");
      return;
    }

    setSavingMenu(true);
    try {
      if (editingMenu) {
        const res = await fetch(`/api/admin/menu/${editingMenu._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: menuForm.label.trim(),
            url: menuForm.url.trim(),
            location: menuForm.location,
            order: editingMenu.order,
            isActive: editingMenu.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Menu link updated");
      } else {
        const res = await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: menuForm.label.trim(),
            url: menuForm.url.trim(),
            location: menuForm.location,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Menu link added");
      }
      setIsMenuModalOpen(false);
      fetchMenus();
    } catch (err) {
      antdMessage.error(err.message);
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = (item) => {
    Modal.confirm({
      title: "Delete Menu Link?",
      content: `Are you sure you want to remove "${item.label}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/menu/${item._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message);
          antdMessage.success("Menu link removed");
          fetchMenus();
        } catch (err) {
          antdMessage.error(err.message);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ─── Header & Sub-Tab Switcher ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <AppstoreOutlined className="text-[#2D6A4F]" />
            Homepage Section Builder & Menu Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize homepage sections in real-time, reorder blocks, and manage store navigation links.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-2 bg-[#FAFBF9] p-1.5 rounded-2xl border border-emerald-100/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab("sections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "sections"
                ? "bg-[#2D6A4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#2D6A4F]"
            }`}
          >
            <AppstoreOutlined />
            <span>Homepage Sections ({sections.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "menu"
                ? "bg-[#2D6A4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#2D6A4F]"
            }`}
          >
            <MenuOutlined />
            <span>Navigation Menus ({menus.length})</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: HOMEPAGE SECTIONS BUILDER
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "sections" && (
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-emerald-100/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sequence: Drag/Move to reorder how sections appear on the homepage.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchSections}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ReloadOutlined /> Refresh
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <PlusOutlined /> Add Section Template
              </button>
            </div>
          </div>

          {/* Sections List */}
          {loadingSections ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-emerald-100/60">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold">Loading homepage sections…</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-emerald-100/60">
              <p className="text-4xl mb-3">🌿</p>
              <h3 className="font-bold text-slate-800">No sections found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click below to load default layout sections.</p>
              <button
                onClick={fetchSections}
                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold"
              >
                Load Default Layout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => {
                const meta = SECTION_TYPE_META[section.sectionType] || {
                  label: section.sectionType,
                  icon: "📦",
                  color: "default",
                };

                return (
                  <div
                    key={section._id}
                    className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      section.isActive
                        ? "border-emerald-100/80 shadow-2xs hover:border-emerald-300"
                        : "border-gray-200 bg-gray-50/50 opacity-70"
                    }`}
                  >
                    {/* Left: Position, Badge, Title */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Position Reordering Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, "up")}
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2D6A4F] disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUpOutlined />
                        </button>
                        <button
                          disabled={index === sections.length - 1}
                          onClick={() => handleMoveSection(index, "down")}
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2D6A4F] disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDownOutlined />
                        </button>
                      </div>

                      {/* Order indicator */}
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{index + 1}
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Tag color={meta.color} className="font-semibold text-[11px] rounded-md m-0">
                            {meta.icon} {meta.label}
                          </Tag>
                          {!section.isActive && (
                            <Tag color="default" className="text-[10px] m-0">
                              Hidden
                            </Tag>
                          )}
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                          {section.title || "Untitled Section"}
                        </h4>
                        {section.subtitle && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {/* Active toggle */}
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                          {section.isActive ? "Visible" : "Hidden"}
                        </span>
                        <Switch
                          checked={section.isActive}
                          onChange={() => handleToggleSection(section)}
                          checkedChildren={<EyeOutlined />}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </div>

                      {/* Edit Content */}
                      <button
                        onClick={() => handleOpenEditSection(section)}
                        className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <EditOutlined /> Edit
                      </button>

                      {/* Delete (allowed for custom added sections) */}
                      {["promo_banner", "faq", "testimonials", "custom_banner"].includes(
                        section.sectionType
                      ) && (
                        <button
                          onClick={() => handleDeleteSection(section)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                          title="Delete section"
                        >
                          <DeleteOutlined />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: NAVIGATION MENU MANAGER
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "menu" && (
        <div className="space-y-4">
          
          {/* Location Switcher & Add Action */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuLocation("navbar")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  menuLocation === "navbar"
                    ? "bg-[#2D6A4F] text-white shadow-sm"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                Top Navigation Bar Links ({menus.filter((m) => m.location === "navbar").length})
              </button>
              <button
                onClick={() => setMenuLocation("footer")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  menuLocation === "footer"
                    ? "bg-[#2D6A4F] text-white shadow-sm"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                Store Footer Links ({menus.filter((m) => m.location === "footer").length})
              </button>
            </div>

            <button
              onClick={handleOpenAddMenu}
              className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusOutlined /> Add Menu Link
            </button>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm overflow-hidden">
            {loadingMenus ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold">Loading menu links…</p>
              </div>
            ) : currentMenus.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="text-3xl mb-2">🔗</p>
                <h4 className="font-bold text-slate-800">No links in {menuLocation}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add Menu Link" to create one.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {currentMenus.map((item, index) => (
                  <div
                    key={item._id}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                      item.isActive ? "hover:bg-[#FAFBF9]" : "bg-gray-50/60 opacity-70"
                    }`}
                  >
                    {/* Left: Reorder & Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveMenu(index, "up")}
                          className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2D6A4F] disabled:opacity-20 flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          <ArrowUpOutlined />
                        </button>
                        <button
                          disabled={index === currentMenus.length - 1}
                          onClick={() => handleMoveMenu(index, "down")}
                          className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2D6A4F] disabled:opacity-20 flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          <ArrowDownOutlined />
                        </button>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-mono font-bold text-xs">
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.label}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                          <LinkOutlined className="text-emerald-600" />
                          <span>{item.url}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={item.isActive}
                        onChange={() => handleToggleMenu(item)}
                        size="small"
                      />

                      <button
                        onClick={() => handleOpenEditMenu(item)}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#2D6A4F] hover:bg-emerald-50 text-xs transition-colors cursor-pointer"
                        title="Edit link"
                      >
                        <EditOutlined />
                      </button>

                      <button
                        onClick={() => handleDeleteMenu(item)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD NEW SECTION FROM TEMPLATE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>✨</span> Add New Section Template
          </div>
        }
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={680}
      >
        <div className="py-2 space-y-3">
          <p className="text-xs text-slate-500">
            Select a pre-built section template to inject into your live homepage. You can freely customize its texts, photos, and order anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {TEMPLATE_PRESETS.map((tpl) => (
              <div
                key={tpl.type}
                onClick={() => handleCreateFromTemplate(tpl)}
                className="p-4 rounded-2xl border border-emerald-100 hover:border-[#2D6A4F] hover:bg-emerald-50/40 bg-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="text-2xl mb-2">{tpl.icon}</div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2D6A4F] transition-colors">
                  {tpl.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.desc}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#2D6A4F]">
                  <span>+ Add to Homepage</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: EDIT SECTION CONTENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <EditOutlined className="text-[#2D6A4F]" />
            Edit Section: {editingSection?.title || editingSection?.sectionType}
          </div>
        }
        open={isSectionModalOpen}
        onCancel={() => setIsSectionModalOpen(false)}
        footer={null}
        width={650}
      >
        {editingSection && (
          <form onSubmit={handleSaveSection} className="space-y-4 pt-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Section Headline / Title
              </label>
              <input
                type="text"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Sub-headline / Supporting Text
              </label>
              <textarea
                rows={2}
                value={sectionForm.subtitle}
                onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Top Pill Badge Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 🌿 Special Offer"
                value={sectionForm.badgeText}
                onChange={(e) => setSectionForm({ ...sectionForm, badgeText: e.target.value })}
                className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Buttons (for Hero, Promo, Custom Banner) */}
            {["hero", "promo_banner", "custom_banner"].includes(editingSection.sectionType) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={sectionForm.buttonText}
                    onChange={(e) => setSectionForm({ ...sectionForm, buttonText: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Primary Button URL Link
                  </label>
                  <input
                    type="text"
                    value={sectionForm.buttonLink}
                    onChange={(e) => setSectionForm({ ...sectionForm, buttonLink: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* FAQ Item Editor */}
            {editingSection.sectionType === "faq" && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">Questions & Answers</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setSectionForm({
                        ...sectionForm,
                        items: [...sectionForm.items, { q: "New Question", a: "Answer details" }],
                      })
                    }
                    className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    + Add Q&A
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {sectionForm.items.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Q#{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = sectionForm.items.filter((_, idx) => idx !== i);
                            setSectionForm({ ...sectionForm, items: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question"
                        value={item.q}
                        onChange={(e) => {
                          const updated = [...sectionForm.items];
                          updated[i].q = e.target.value;
                          setSectionForm({ ...sectionForm, items: updated });
                        }}
                        className="w-full bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Answer"
                        value={item.a}
                        onChange={(e) => {
                          const updated = [...sectionForm.items];
                          updated[i].a = e.target.value;
                          setSectionForm({ ...sectionForm, items: updated });
                        }}
                        className="w-full bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials Editor */}
            {editingSection.sectionType === "testimonials" && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">Review Cards</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setSectionForm({
                        ...sectionForm,
                        items: [
                          ...sectionForm.items,
                          { name: "Customer Name", role: "Verified Buyer", review: "Great plants!", rating: 5 },
                        ],
                      })
                    }
                    className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    + Add Review
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {sectionForm.items.map((rev, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Review #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = sectionForm.items.filter((_, idx) => idx !== i);
                            setSectionForm({ ...sectionForm, items: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Reviewer Name"
                          value={rev.name}
                          onChange={(e) => {
                            const updated = [...sectionForm.items];
                            updated[i].name = e.target.value;
                            setSectionForm({ ...sectionForm, items: updated });
                          }}
                          className="bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Location / Role"
                          value={rev.role}
                          onChange={(e) => {
                            const updated = [...sectionForm.items];
                            updated[i].role = e.target.value;
                            setSectionForm({ ...sectionForm, items: updated });
                          }}
                          className="bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Review Text"
                        value={rev.review}
                        onChange={(e) => {
                          const updated = [...sectionForm.items];
                          updated[i].review = e.target.value;
                          setSectionForm({ ...sectionForm, items: updated });
                        }}
                        className="w-full bg-white border border-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSection}
                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSection ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT NAVIGATION MENU LINK
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LinkOutlined className="text-[#2D6A4F]" />
            {editingMenu ? "Edit Navigation Link" : "Add New Navigation Link"}
          </div>
        }
        open={isMenuModalOpen}
        onCancel={() => setIsMenuModalOpen(false)}
        footer={null}
        width={450}
      >
        <form onSubmit={handleSaveMenu} className="space-y-4 pt-3">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Link Label (ডিসপ্লে টেক্সট) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Special Offers"
              value={menuForm.label}
              onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
              className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Destination URL Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. /products?category=plant or /contact"
              value={menuForm.url}
              onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })}
              className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Target Location
            </label>
            <select
              value={menuForm.location}
              onChange={(e) => setMenuForm({ ...menuForm, location: e.target.value })}
              className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="navbar">Top Navigation Bar (উপরের মেনু)</option>
              <option value="footer">Store Footer (নিচের ফুটার)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMenuModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMenu}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {savingMenu ? "Saving…" : editingMenu ? "Update Link" : "Create Link"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
