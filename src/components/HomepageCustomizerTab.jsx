"use client";

import { useState, useEffect, useRef } from "react";
import { App, Switch } from "antd";
import imageCompression from "browser-image-compression";
import {
  Sliders,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Calendar,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Mail,
  BookOpen,
  Award,
  Clock,
  Headphones,
  Leaf,
  Package,
  Gift,
  Truck,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  Check,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";

const PERK_ICON_OPTIONS = [
  { value: "Headphones", label: "Headphones (24/7 Support)" },
  { value: "Leaf", label: "Leaf (Sustainable & Safe)" },
  { value: "Package", label: "Package (Packed with Care)" },
  { value: "Gift", label: "Gift (Loyalty Rewards)" },
  { value: "ShieldCheck", label: "ShieldCheck (Quality Guarantee)" },
  { value: "Truck", label: "Truck (Doorstep Safe Delivery)" },
];

const PERK_ICON_COMPONENTS = {
  Headphones,
  Leaf,
  Package,
  Gift,
  ShieldCheck,
  Truck,
};

export default function HomepageCustomizerTab({ onNavigateTab }) {
  const { message: antdMessage } = App.useApp();

  const [config, setConfig] = useState(DEFAULT_HOMEPAGE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [openSections, setOpenSections] = useState({
    heroSlider: true,
    categoriesSection: false,
    dealsSection: false,
    promoBanners: false,
    newArrivals: false,
    topRankings: false,
    newsletter: false,
    blogSection: false,
    guaranteeStrip: false,
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/homepage-config");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      } else {
        throw new Error(data.message || "Failed to load configuration");
      }
    } catch (err) {
      console.error("Fetch homepage config error:", err);
      antdMessage.error("Could not load homepage configuration, using fallback.");
    } finally {
      setLoading(false);
    }
  };

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [dealProductSearch, setDealProductSearch] = useState("");

  const fetchAllProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to load store products for deal selector:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchAllProducts();
  }, []);

  const handleToggleDealProduct = (product) => {
    const prodId = product._id?.toString() || product.id?.toString();
    const currentList = Array.isArray(config.dealsSection?.dealProductIds)
      ? config.dealsSection.dealProductIds
      : [];
    const currentIds = currentList.map((item) =>
      typeof item === "object" ? item._id?.toString() : item?.toString()
    );

    if (currentIds.includes(prodId)) {
      updateNestedField(
        "dealsSection.dealProductIds",
        currentIds.filter((id) => id !== prodId)
      );
    } else {
      if (currentIds.length >= 16) {
        antdMessage.warning("You can select up to 16 products for Flash Deals.");
        return;
      }
      updateNestedField("dealsSection.dealProductIds", [...currentIds, prodId]);
    }
  };

  const handleMoveDealProduct = (index, direction) => {
    const currentList = Array.isArray(config.dealsSection?.dealProductIds)
      ? [...config.dealsSection.dealProductIds]
      : [];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);
    updateNestedField("dealsSection.dealProductIds", currentList);
  };

  const handleRemoveDealProduct = (productId) => {
    const currentList = Array.isArray(config.dealsSection?.dealProductIds)
      ? config.dealsSection.dealProductIds
      : [];
    const targetId = typeof productId === "object" ? productId._id?.toString() : productId?.toString();
    const filtered = currentList.filter((item) => {
      const id = typeof item === "object" ? item._id?.toString() : item?.toString();
      return id !== targetId;
    });
    updateNestedField("dealsSection.dealProductIds", filtered);
  };

  const toggleAccordion = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleToggleSectionEnabled = (sectionKey, isEnabled) => {
    setConfig((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        isEnabled,
      },
    }));
  };

  // Helper for deep updates
  const updateNestedField = (path, value) => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  // Cloudinary image upload with client compression
  const handleImageUpload = async (e, targetPath) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      antdMessage.error("Cloudinary credentials are not configured in environment variables.");
      return;
    }

    try {
      setUploadingField(targetPath);
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1400,
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
        updateNestedField(targetPath, data.secure_url);
        antdMessage.success("Image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      antdMessage.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/homepage-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (data.success) {
        antdMessage.success("Homepage settings saved successfully! Live store updated.");
        if (data.config) {
          setConfig(data.config);
        }
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Save config error:", err);
      antdMessage.error(err.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  // Slide management
  const handleAddSlide = () => {
    const newSlide = {
      badge: "# FRESH COLLECTION",
      title: "New Botanical Selection",
      subtitle: "Acclimatized indoor foliage and handcrafted ceramic planters.",
      buttonText: "Shop Collection",
      buttonUrl: "/collections",
      imageUrl: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1400&q=85",
      floatingCard: {
        title: "Monstera Deliciosa",
        price: "৳450",
        link: "/products",
      },
    };
    setConfig((prev) => ({
      ...prev,
      heroSlider: {
        ...prev.heroSlider,
        slides: [...(prev.heroSlider?.slides || []), newSlide],
      },
    }));
  };

  const handleRemoveSlide = (index) => {
    if ((config.heroSlider?.slides || []).length <= 1) {
      antdMessage.warning("At least one slide is required for the hero slider.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      heroSlider: {
        ...prev.heroSlider,
        slides: prev.heroSlider.slides.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-2xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F] mx-auto mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading homepage section manager...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Sticky Header / Action Toolbar ─────────────────────────────── */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center">
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-base font-extrabold text-[#1A2E22]">
              Homepage Section Manager
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dynamically toggle visibility, edit copy, banners, timers, and images for all 9 homepage sections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={fetchConfig}
            disabled={saving}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Reload Config"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Homepage Settings"}</span>
          </button>
        </div>
      </div>

      {/* ─── Sections Accordion List ────────────────────────────────────── */}
      <div className="space-y-4">
        {/* ═════════════════════════════════════════════════════════════════
            SECTION 1: HERO SLIDER
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("heroSlider")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                #1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Hero Slider Collection
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.heroSlider?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.heroSlider?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Interactive multi-slide hero carousel with pill buttons and trust badges
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.heroSlider?.isEnabled}
                onChange={(checked) => handleToggleSectionEnabled("heroSlider", checked)}
              />
              <button
                type="button"
                onClick={() => toggleAccordion("heroSlider")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.heroSlider ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.heroSlider && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Slides List ({(config.heroSlider?.slides || []).length} Slides)
                </h4>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Slide
                </button>
              </div>

              <div className="space-y-4">
                {(config.heroSlider?.slides || []).map((slide, sIdx) => (
                  <div
                    key={slide._id || sIdx}
                    className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="text-xs font-extrabold text-[#1A2E22] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                          {sIdx + 1}
                        </span>
                        Slide {sIdx + 1}: {slide.title || "Untitled Slide"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(sIdx)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 transition-colors cursor-pointer"
                        title="Remove Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Tag / Badge
                        </label>
                        <input
                          type="text"
                          value={slide.badge || ""}
                          onChange={(e) =>
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.badge`,
                              e.target.value
                            )
                          }
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="# AIR PURIFIER COLLECTION"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Main Heading
                        </label>
                        <input
                          type="text"
                          value={slide.heading || slide.title || ""}
                          onChange={(e) => {
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.title`,
                              e.target.value
                            );
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.heading`,
                              e.target.value
                            );
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="Breathe Cleaner Air With Living Foliage"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Subtitle / Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.subtitle || ""}
                          onChange={(e) =>
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.subtitle`,
                              e.target.value
                            )
                          }
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="NASA-recommended indoor plants that naturally purify benzene..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Primary Button Text
                        </label>
                        <input
                          type="text"
                          value={slide.primaryBtnText || slide.buttonText || ""}
                          onChange={(e) => {
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.buttonText`,
                              e.target.value
                            );
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.primaryBtnText`,
                              e.target.value
                            );
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="Shop Air Purifiers"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Primary Button Link
                        </label>
                        <input
                          type="text"
                          value={slide.primaryBtnLink || slide.buttonUrl || ""}
                          onChange={(e) => {
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.buttonUrl`,
                              e.target.value
                            );
                            updateNestedField(
                              `heroSlider.slides.${sIdx}.primaryBtnLink`,
                              e.target.value
                            );
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="/collections"
                        />
                      </div>

                      {/* Image Upload Field */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Slide Image
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            value={slide.imageUrl || slide.image || ""}
                            onChange={(e) => {
                              updateNestedField(
                                `heroSlider.slides.${sIdx}.imageUrl`,
                                e.target.value
                              );
                              updateNestedField(
                                `heroSlider.slides.${sIdx}.image`,
                                e.target.value
                              );
                            }}
                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                            placeholder="https://images.unsplash.com/..."
                          />

                          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#2D6A4F]/30 bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer shrink-0">
                            {uploadingField === `heroSlider.slides.${sIdx}.imageUrl` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5" />
                            )}
                            <span>Upload to Cloudinary</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(
                                  e,
                                  `heroSlider.slides.${sIdx}.imageUrl`
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>

                      {/* Floating Card Settings */}
                      <div className="md:col-span-2 p-3.5 rounded-xl bg-gray-50 border border-gray-200/70 space-y-3">
                        <p className="text-[11px] font-bold text-gray-700">
                          Floating Specimen Card Overlay
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">
                              Card Plant Title
                            </label>
                            <input
                              type="text"
                              value={slide.floatingCard?.title || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.title`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                              placeholder="Peace Lily"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">
                              Card Price
                            </label>
                            <input
                              type="text"
                              value={slide.floatingCard?.price || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.price`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                              placeholder="৳380"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">
                              Card Product Link
                            </label>
                            <input
                              type="text"
                              value={slide.floatingCard?.link || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.link`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                              placeholder="/products"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 2: SHOP BY CATEGORY / COLLECTIONS
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("categoriesSection")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
                #2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Curated Plant Collections &amp; Perks
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.categoriesSection?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.categoriesSection?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dynamic category navigation tiles with real product counts and 4 reassurance perks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.categoriesSection?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("categoriesSection", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("categoriesSection")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.categoriesSection ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.categoriesSection && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              {/* Section Header Inputs */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Section Header &amp; View All Button</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Section Subtitle / Eyebrow
                    </label>
                    <input
                      type="text"
                      value={config.categoriesSection?.subtitle || ""}
                      onChange={(e) =>
                        updateNestedField("categoriesSection.subtitle", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="EXPLORE BOTANICALS TAILORED FOR YOUR LIFESTYLE AND LIGHTING CONDITIONS"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Section Title / Heading
                    </label>
                    <input
                      type="text"
                      value={config.categoriesSection?.title || ""}
                      onChange={(e) =>
                        updateNestedField("categoriesSection.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Curated Plant Collections"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      &quot;View All&quot; Button Label
                    </label>
                    <input
                      type="text"
                      value={config.categoriesSection?.viewAllText || ""}
                      onChange={(e) =>
                        updateNestedField("categoriesSection.viewAllText", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="View All"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      &quot;View All&quot; Destination URL
                    </label>
                    <input
                      type="text"
                      value={config.categoriesSection?.viewAllUrl || ""}
                      onChange={(e) =>
                        updateNestedField("categoriesSection.viewAllUrl", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="/collections"
                    />
                  </div>
                </div>
              </div>

              {/* Category Card Notice & Shortcut Button */}
              <div className="bg-[#EBF0E6]/70 border border-[#2D6A4F]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#2D6A4F] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1C2B1E]">
                      Live Category Database Connection
                    </h5>
                    <p className="text-[11px] text-[#5A6B5C] mt-0.5 leading-relaxed">
                      Category cards are automatically populated from your Category database with live Cloudinary images and real product counts.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onNavigateTab === "function") {
                      onNavigateTab("categories");
                    } else {
                      window.dispatchEvent(
                        new CustomEvent("admin:navigate-tab", { detail: "categories" })
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#1E3F20] text-white hover:bg-[#152D17] transition-colors cursor-pointer shrink-0 shadow-xs self-start sm:self-auto"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Manage Categories &amp; Images</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Perks Customizer (Perks Repeater) */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <h4 className="text-xs font-bold text-gray-700">
                      4 Reassurance Perks Customizer
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    Displayed below the category cards
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(
                    Array.isArray(config.categoriesSection?.perks) &&
                    config.categoriesSection.perks.length > 0
                      ? config.categoriesSection.perks
                      : DEFAULT_HOMEPAGE_CONFIG.categoriesSection.perks
                  )
                    .slice(0, 4)
                    .map((perk, pIdx) => {
                      const IconComp =
                        PERK_ICON_COMPONENTS[perk.icon] || Headphones;

                      return (
                        <div
                          key={`perk-${pIdx}`}
                          className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                              Perk #{pIdx + 1}
                            </span>
                            <span className="w-7 h-7 rounded-full bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center">
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              Icon Selector
                            </label>
                            <select
                              value={perk.icon || "Headphones"}
                              onChange={(e) =>
                                updateNestedField(
                                  `categoriesSection.perks.${pIdx}.icon`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 cursor-pointer"
                            >
                              {PERK_ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              Perk Title
                            </label>
                            <input
                              type="text"
                              value={perk.title || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  `categoriesSection.perks.${pIdx}.title`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                              placeholder="Expert Guidance"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              Perk Description
                            </label>
                            <input
                              type="text"
                              value={perk.description || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  `categoriesSection.perks.${pIdx}.description`,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                              placeholder="Once-care support 24/7"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 3: FLASH BOTANICAL DEALS
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("dealsSection")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                #3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Flash Botanical Deals &amp; Countdown
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.dealsSection?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.dealsSection?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Limited time promotional deal cards with live countdown clock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.dealsSection?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("dealsSection", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("dealsSection")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.dealsSection ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.dealsSection && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              {/* Header Fields */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Section Header &amp; Countdown Settings</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.dealsSection?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("dealsSection.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="LIMITED TIME"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Section Title / Heading
                    </label>
                    <input
                      type="text"
                      value={config.dealsSection?.title || ""}
                      onChange={(e) =>
                        updateNestedField("dealsSection.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Botanical Flash Deals"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Subtitle / Descriptive Copy
                    </label>
                    <input
                      type="text"
                      value={config.dealsSection?.subtitle || ""}
                      onChange={(e) =>
                        updateNestedField("dealsSection.subtitle", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Seasonal markdowns on our healthiest, nursery-grown favourites."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Countdown End Date &amp; Time</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        config.dealsSection?.countdownEndDate
                          ? new Date(config.dealsSection.countdownEndDate)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        updateNestedField(
                          "dealsSection.countdownEndDate",
                          new Date(e.target.value).toISOString()
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Real-time interactive countdown timer relative to this datetime.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Fallback Discount Tag Percentage (%)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={config.dealsSection?.discountPercentage ?? 15}
                      onChange={(e) =>
                        updateNestedField(
                          "dealsSection.discountPercentage",
                          Number(e.target.value) || 15
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="15"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Shown on deal product cards (e.g. -15%).
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Mode Selector */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Display Mode Selector</span>
                </h4>
                <p className="text-[11px] text-gray-500 mb-3">
                  Choose how deal items appear to store visitors on the homepage:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateNestedField("dealsSection.displayType", "slider")
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      (config.dealsSection?.displayType || "slider") === "slider"
                        ? "border-[#1E3F20] bg-[#EBF0E6]/80 text-[#1E3F20] shadow-xs"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        (config.dealsSection?.displayType || "slider") === "slider"
                          ? "bg-[#1E3F20] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">
                          Horizontal Slider with Arrows (ক্যারোজেল স্লাইডার)
                        </span>
                        {(config.dealsSection?.displayType || "slider") === "slider" && (
                          <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Multi-card sliding carousel with circular Prev/Next arrow navigation (4 desktop, 2 tablet, 1 mobile).
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateNestedField("dealsSection.displayType", "grid_load_more")
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      config.dealsSection?.displayType === "grid_load_more"
                        ? "border-[#1E3F20] bg-[#EBF0E6]/80 text-[#1E3F20] shadow-xs"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        config.dealsSection?.displayType === "grid_load_more"
                          ? "bg-[#1E3F20] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">
                          Grid with &quot;Load More&quot; Button
                        </span>
                        {config.dealsSection?.displayType === "grid_load_more" && (
                          <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Shows initial 4 items in a 4-column grid with animated &quot;Load More Deals&quot; pill button.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Deal Products Multi-Selector */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Deal Products Multi-Selector</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Select 4 to 16 products to feature in this deal section. Reorder items using the arrows.
                    </p>
                  </div>

                  {(() => {
                    const selCount = (config.dealsSection?.dealProductIds || []).length;
                    return (
                      <span
                        className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                          selCount >= 4
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        Selected: {selCount} / 16 products {selCount < 4 ? "(Minimum 4 recommended)" : ""}
                      </span>
                    );
                  })()}
                </div>

                {/* Currently Selected Strip & Reordering */}
                {(() => {
                  const rawList = Array.isArray(config.dealsSection?.dealProductIds)
                    ? config.dealsSection.dealProductIds
                    : [];
                  const selectedIds = rawList.map((item) =>
                    typeof item === "object" ? item._id?.toString() : item?.toString()
                  );

                  // Map to full product objects if available
                  const selectedProducts = selectedIds
                    .map((id) => allProducts.find((p) => p._id?.toString() === id))
                    .filter(Boolean);

                  if (selectedProducts.length === 0) {
                    return (
                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-center text-xs text-amber-800 mb-4">
                        No deal products selected yet. Search and check products below, or the store will automatically display the top 8 newest nursery items as fallback.
                      </div>
                    );
                  }

                  return (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                          Current Sequence &amp; Order ({selectedProducts.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => updateNestedField("dealsSection.dealProductIds", [])}
                          className="text-[10px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                        {selectedProducts.map((p, idx) => (
                          <div
                            key={p._id || idx}
                            className="shrink-0 w-44 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-2xs flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Leaf className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-800 truncate" title={p.title}>
                                  {p.title}
                                </p>
                                <p className="text-[11px] text-[#2D6A4F] font-bold">
                                  ৳{p.price}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-gray-400">
                              <span className="text-[10px] font-mono font-bold text-gray-400">
                                #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveDealProduct(idx, "left")}
                                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                  title="Move Left"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === selectedProducts.length - 1}
                                  onClick={() => handleMoveDealProduct(idx, "right")}
                                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                  title="Move Right"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDealProduct(p._id)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                                  title="Remove from deals"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Search Bar for Store Products */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dealProductSearch}
                    onChange={(e) => setDealProductSearch(e.target.value)}
                    placeholder="Search nursery products by title or category to select..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                  />
                  {dealProductSearch && (
                    <button
                      type="button"
                      onClick={() => setDealProductSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Catalog Grid for Selection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-3 max-h-72 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#2D6A4F]" />
                      Loading store products...
                    </div>
                  ) : allProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No store products found. Add products in the Store tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {allProducts
                        .filter((p) => {
                          if (!dealProductSearch.trim()) return true;
                          const q = dealProductSearch.toLowerCase();
                          return (
                            p.title?.toLowerCase().includes(q) ||
                            p.category?.toLowerCase().includes(q)
                          );
                        })
                        .map((product) => {
                          const prodId = product._id?.toString() || product.id?.toString();
                          const currentList = Array.isArray(config.dealsSection?.dealProductIds)
                            ? config.dealsSection.dealProductIds
                            : [];
                          const isSelected = currentList.some((item) => {
                            const id = typeof item === "object" ? item._id?.toString() : item?.toString();
                            return id === prodId;
                          });

                          return (
                            <div
                              key={prodId}
                              onClick={() => handleToggleDealProduct(product)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-[#EBF0E6] border-[#2D6A4F] text-[#1E3F20] shadow-2xs"
                                  : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <Leaf className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">
                                    {product.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span className="capitalize">{product.category}</span>
                                    <span>•</span>
                                    <span className="font-bold text-[#2D6A4F]">৳{product.price}</span>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                  isSelected
                                    ? "bg-[#1E3F20] border-[#1E3F20] text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Dedicated Save Button */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  Settings update the live Botanical Flash Deals section immediately.
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{saving ? "Saving..." : "Save Deals Settings"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 4: MID-PAGE PROMO BANNERS
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("promoBanners")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                #4
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Mid-Page Promotional Banners (Dual Grid)
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.promoBanners?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.promoBanners?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dual visual promo banners highlighting Succulent Kits and Organic Soils
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.promoBanners?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("promoBanners", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("promoBanners")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.promoBanners ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.promoBanners && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Banner 1 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3.5">
                  <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider border-b border-gray-100 pb-2">
                    Banner 1 (Left — Dark Emerald Theme)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.promoBanners?.banner1?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("promoBanners.banner1.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                      placeholder="Special Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={config.promoBanners?.banner1?.title || ""}
                      onChange={(e) =>
                        updateNestedField("promoBanners.banner1.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                      placeholder="Indoor Succulent Kits..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={config.promoBanners?.banner1?.buttonText || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner1.buttonText",
                            e.target.value
                          )
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                        placeholder="Explore Kits"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Button URL
                      </label>
                      <input
                        type="text"
                        value={config.promoBanners?.banner1?.buttonUrl || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner1.buttonUrl",
                            e.target.value
                          )
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                        placeholder="/products?category=plant"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Banner Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={config.promoBanners?.banner1?.imageUrl || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner1.imageUrl",
                            e.target.value
                          )
                        }
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200"
                      />
                      <label className="p-2 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer">
                        {uploadingField === "promoBanners.banner1.imageUrl" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, "promoBanners.banner1.imageUrl")
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Banner 2 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3.5">
                  <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider border-b border-gray-100 pb-2">
                    Banner 2 (Right — Light Sage Theme)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.promoBanners?.banner2?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("promoBanners.banner2.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                      placeholder="Soil Nutrition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={config.promoBanners?.banner2?.title || ""}
                      onChange={(e) =>
                        updateNestedField("promoBanners.banner2.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                      placeholder="100% Organic Soil..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={config.promoBanners?.banner2?.buttonText || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner2.buttonText",
                            e.target.value
                          )
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                        placeholder="Shop Soil & Compost"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Button URL
                      </label>
                      <input
                        type="text"
                        value={config.promoBanners?.banner2?.buttonUrl || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner2.buttonUrl",
                            e.target.value
                          )
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                        placeholder="/products?category=fertilizer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Banner Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={config.promoBanners?.banner2?.imageUrl || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "promoBanners.banner2.imageUrl",
                            e.target.value
                          )
                        }
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200"
                      />
                      <label className="p-2 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer">
                        {uploadingField === "promoBanners.banner2.imageUrl" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, "promoBanners.banner2.imageUrl")
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 5: NEW ARRIVALS & SPOTLIGHT
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("newArrivals")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                #5
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    New Arrivals, Bestsellers &amp; Spotlight Card
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.newArrivals?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.newArrivals?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dynamic catalog grid with left vertical spotlight banner
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.newArrivals?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("newArrivals", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("newArrivals")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.newArrivals ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.newArrivals && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              {/* Section Header Fields */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Section Header &amp; Eyebrow</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Eyebrow / Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("newArrivals.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="FRESHLY POTTED"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Section Main Title
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.title || ""}
                      onChange={(e) =>
                        updateNestedField("newArrivals.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="New Arrivals & Bestsellers"
                    />
                  </div>
                </div>
              </div>

              {/* Spotlight Banner Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Left Vertical Spotlight Banner (Card Editor)</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Highlights a hero bonsai or statement specimen
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Spotlight Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.badge || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.badge",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="FEATURED SPECIMEN"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Headline Title
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.title || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.title",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Buy a great Coconut Bonsai"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Subtitle / Specimen Details
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.subtitle || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.subtitle",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Grown for 5+ years with healthy root arches"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Price Badge (e.g. ৳1,250)
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.price || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.price",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="৳1,250"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.buttonText || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.buttonText",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Buy Now"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Button Destination URL
                    </label>
                    <input
                      type="text"
                      value={config.newArrivals?.spotlightBanner?.buttonUrl || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "newArrivals.spotlightBanner.buttonUrl",
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="/collections"
                    />
                  </div>

                  {/* Spotlight Image & Upload */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Spotlight Card Background Photo
                    </label>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {config.newArrivals?.spotlightBanner?.imageUrl && (
                        <div className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 group">
                          <img
                            src={config.newArrivals.spotlightBanner.imageUrl}
                            alt="Spotlight preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateNestedField(
                                "newArrivals.spotlightBanner.imageUrl",
                                ""
                              )
                            }
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex-1 w-full flex items-center gap-2">
                        <input
                          type="text"
                          value={config.newArrivals?.spotlightBanner?.imageUrl || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "newArrivals.spotlightBanner.imageUrl",
                              e.target.value
                            )
                          }
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                          placeholder="https://images.unsplash.com/... or Cloudinary URL"
                        />

                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#2D6A4F]/30 bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer shrink-0">
                          {uploadingField ===
                          "newArrivals.spotlightBanner.imageUrl" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                e,
                                "newArrivals.spotlightBanner.imageUrl"
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Save Button */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  Updates reflect instantly on the live store.
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{saving ? "Saving..." : "Save Section Settings"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 6: MINI TOP RANKINGS
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("topRankings")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-xs">
                #6
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Mini Top Rankings &amp; Popular Varieties
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.topRankings?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.topRankings?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Curated mini leaderboard of customer favorites with rankings badges
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.topRankings?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("topRankings", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("topRankings")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.topRankings ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.topRankings && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] text-xs text-gray-600">
              <p>
                This section displays top-selling plants categorized into rank positions (#1, #2, #3) with verified ratings and quick-add buttons. Toggle visibility above to show or hide it on the homepage.
              </p>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 7: NEWSLETTER SECTION
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("newsletter")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold text-xs">
                #7
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Newsletter &amp; Botanical Society
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.newsletter?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.newsletter?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Subscribers capture card synced with MongoDB Newsletter Subscriber collection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.newsletter?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("newsletter", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("newsletter")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.newsletter ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.newsletter && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={config.newsletter?.title || ""}
                    onChange={(e) =>
                      updateNestedField("newsletter.title", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                    placeholder="Join The Botanical Society"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={config.newsletter?.buttonText || ""}
                    onChange={(e) =>
                      updateNestedField("newsletter.buttonText", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                    placeholder="Subscribe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Subtext / Description
                  </label>
                  <textarea
                    rows={2}
                    value={config.newsletter?.subtitle || ""}
                    onChange={(e) =>
                      updateNestedField("newsletter.subtitle", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                    placeholder="Weekly seasonal plant-care guides..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Decorative Plant Accent Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.newsletter?.plantImageUrl || ""}
                      onChange={(e) =>
                        updateNestedField("newsletter.plantImageUrl", e.target.value)
                      }
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200"
                    />
                    <label className="p-2 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer">
                      {uploadingField === "newsletter.plantImageUrl" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, "newsletter.plantImageUrl")
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 8: LATEST BLOG GUIDES
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("blogSection")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                #8
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Latest Plant Care Guides &amp; Blog
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.blogSection?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.blogSection?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Knowledge base cards loaded dynamically from published blog posts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.blogSection?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("blogSection", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("blogSection")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.blogSection ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.blogSection && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={config.blogSection?.title || ""}
                    onChange={(e) =>
                      updateNestedField("blogSection.title", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                    placeholder="Latest Plant Care Guides"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.blogSection?.subtitle || ""}
                    onChange={(e) =>
                      updateNestedField("blogSection.subtitle", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                    placeholder="Expert knowledge on watering cycles..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SECTION 9: PRE-FOOTER GUARANTEE STRIP
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden transition-all">
          <div
            onClick={() => toggleAccordion("guaranteeStrip")}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-[#1B4332] flex items-center justify-center font-bold text-xs">
                #9
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A2E22]">
                    Pre-Footer Botanical Guarantee Strip
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.guaranteeStrip?.isEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {config.guaranteeStrip?.isEnabled ? "Live on Store" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Trust strip showing 100% Healthy Plants, Eco Packaging, Doorstep Delivery, and 30-Day Guarantee
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={config.guaranteeStrip?.isEnabled}
                onChange={(checked) =>
                  handleToggleSectionEnabled("guaranteeStrip", checked)
                }
              />
              <button
                type="button"
                onClick={() => toggleAccordion("guaranteeStrip")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {openSections.guaranteeStrip ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.guaranteeStrip && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] text-xs text-gray-600">
              <p>
                Renders a premium 4-pillar trust strip right above the footer: 100% Healthy Plant Guarantee, Sustainable Eco-Packaging, Express Nationwide Delivery, and Botanical Support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
