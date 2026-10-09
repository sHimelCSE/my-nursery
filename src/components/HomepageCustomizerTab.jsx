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
  FolderTree,
  Sprout,
  Flame,
  Trophy,
  Pin,
  RotateCcw,
  CreditCard,
  Star,
} from "lucide-react";
import SafeImage from "@/components/SafeImage";
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

const GUARANTEE_ICON_OPTIONS = [
  { value: "ShieldCheck", label: "ShieldCheck (Quality Guarantee)" },
  { value: "Package", label: "Package (Eco Bio Packaging)" },
  { value: "Truck", label: "Truck (Doorstep Safe Delivery)" },
  { value: "Headphones", label: "Headphones (Botanical Advice)" },
  { value: "RotateCcw", label: "RotateCcw (Replacement Protection)" },
  { value: "CreditCard", label: "CreditCard (Secure Payment)" },
  { value: "Leaf", label: "Leaf (100% Organic & Fresh)" },
];

const GUARANTEE_ICON_COMPONENTS = {
  ShieldCheck,
  Package,
  Truck,
  Headphones,
  RotateCcw,
  CreditCard,
  Leaf,
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

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.categories || data.data)) {
        setCategories(data.categories || data.data);
      }
    } catch (err) {
      console.error("Failed to load categories for collection selector:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const res = await fetch("/api/blogs?limit=50");
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setAllBlogs(data.blogs);
      }
    } catch (err) {
      console.error("Failed to load blogs for customizer:", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchAllProducts();
    fetchCategories();
    fetchBlogs();
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

  const handleAddArrivalTab = () => {
    const currentTabs = Array.isArray(config.newArrivals?.tabs)
      ? config.newArrivals.tabs
      : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs;
    if (currentTabs.length >= 5) {
      antdMessage.warning("Maximum 5 tabs allowed for Section #5.");
      return;
    }
    const newTab = {
      label: `Tab ${currentTabs.length + 1}`,
      sourceType: "preset",
      presetFilter: "all",
      categoryId: null,
    };
    updateNestedField("newArrivals.tabs", [...currentTabs, newTab]);
  };

  const handleRemoveArrivalTab = (idx) => {
    const currentTabs = Array.isArray(config.newArrivals?.tabs)
      ? config.newArrivals.tabs
      : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs;
    if (currentTabs.length <= 1) {
      antdMessage.warning("At least 1 tab is required for Section #5.");
      return;
    }
    const updated = currentTabs.filter((_, i) => i !== idx);
    updateNestedField("newArrivals.tabs", updated);
  };

  const handleUpdateArrivalTab = (idx, field, value) => {
    const currentTabs = Array.isArray(config.newArrivals?.tabs)
      ? config.newArrivals.tabs
      : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs;
    const updated = [...currentTabs];
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    };
    if (field === "sourceType") {
      if (value === "category") {
        const defaultCatId = categories[0]?._id
          ? (categories[0]._id.toString ? categories[0]._id.toString() : categories[0]._id)
          : null;
        updated[idx].categoryId = updated[idx].categoryId || defaultCatId;
      } else {
        updated[idx].presetFilter = updated[idx].presetFilter || "all";
        updated[idx].categoryId = null;
      }
    }
    updateNestedField("newArrivals.tabs", updated);
  };

  const getRankingColumn = (cIdx) => {
    const defaultCol = DEFAULT_HOMEPAGE_CONFIG.topRankings?.columns?.[cIdx];
    const existingCol = config.topRankings?.columns?.[cIdx];
    return {
      title: existingCol?.title ?? defaultCol?.title ?? `Column ${cIdx + 1}`,
      browseUrl: existingCol?.browseUrl ?? defaultCol?.browseUrl ?? "/collections",
      items: [0, 1, 2].map((iIdx) => {
        const defaultItem = defaultCol?.items?.[iIdx];
        const existingItem = existingCol?.items?.[iIdx];
        const rawPid = existingItem?.productId?._id
          ? existingItem.productId._id.toString()
          : existingItem?.productId
          ? existingItem.productId.toString()
          : "";
        return {
          rank: iIdx + 1,
          badge: existingItem?.badge ?? defaultItem?.badge ?? "Featured",
          productId: rawPid,
        };
      }),
    };
  };

  const updateRankingColumnField = (colIdx, field, value) => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      if (!copy.topRankings) copy.topRankings = {};
      if (!Array.isArray(copy.topRankings.columns) || copy.topRankings.columns.length < 3) {
        copy.topRankings.columns = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONFIG.topRankings.columns));
      }
      copy.topRankings.columns[colIdx][field] = value;
      return copy;
    });
  };

  const updateRankingItemField = (colIdx, itemIdx, field, value) => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      if (!copy.topRankings) copy.topRankings = {};
      if (!Array.isArray(copy.topRankings.columns) || copy.topRankings.columns.length < 3) {
        copy.topRankings.columns = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONFIG.topRankings.columns));
      }
      if (!Array.isArray(copy.topRankings.columns[colIdx].items) || copy.topRankings.columns[colIdx].items.length < 3) {
        copy.topRankings.columns[colIdx].items = JSON.parse(
          JSON.stringify(DEFAULT_HOMEPAGE_CONFIG.topRankings.columns[colIdx].items)
        );
      }
      copy.topRankings.columns[colIdx].items[itemIdx][field] = value;
      return copy;
    });
  };

  const updateGuaranteeItem = (index, field, value) => {
    setConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      if (!copy.guaranteeStrip) copy.guaranteeStrip = {};
      if (
        !Array.isArray(copy.guaranteeStrip.items) ||
        copy.guaranteeStrip.items.length < 4
      ) {
        copy.guaranteeStrip.items = JSON.parse(
          JSON.stringify(DEFAULT_HOMEPAGE_CONFIG.guaranteeStrip.items)
        );
      }
      copy.guaranteeStrip.items[index][field] = value;
      return copy;
    });
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

      const existingFeatured = Array.isArray(config.categoriesSection?.featuredCategoryIds)
        ? config.categoriesSection.featuredCategoryIds.map((item) =>
            typeof item === "object" && item?._id ? item._id.toString() : item?.toString() || ""
          )
        : [];

      const currentSlots = [
        existingFeatured[0] || (categories[0]?._id ? categories[0]._id.toString() : ""),
        existingFeatured[1] || (categories[1]?._id ? categories[1]._id.toString() : ""),
        existingFeatured[2] || (categories[2]?._id ? categories[2]._id.toString() : ""),
        existingFeatured[3] || (categories[3]?._id ? categories[3]._id.toString() : ""),
      ].filter(Boolean);

      const payload = {
        ...config,
        categoriesSection: {
          ...(config.categoriesSection || {}),
          featuredCategoryIds: currentSlots,
        },
      };

      const res = await fetch("/api/admin/homepage-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      featuredProductId: null,
      floatingCard: {
        title: "",
        price: "",
        link: "",
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

                      {/* Floating Card Settings - Database Product Selector */}
                      <div className="md:col-span-2 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-[#2D6A4F]" />
                              <p className="text-xs font-bold text-[#1A2E22]">
                                Floating Specimen Product (লাইভ প্রোডাক্ট সিলেক্টর)
                              </p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Select an active database product to automatically bind this slide&apos;s floating glass card (title, live price, real star rating, and direct shop link).
                            </p>
                          </div>
                          {slide.featuredProductId && (
                            <span className="self-start sm:self-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Database Linked
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                            Select Featured Product
                          </label>
                          <select
                            value={
                              slide.featuredProductId?._id
                                ? slide.featuredProductId._id.toString()
                                : slide.featuredProductId
                                ? slide.featuredProductId.toString()
                                : ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              const chosen = allProducts.find(
                                (p) => (p._id?.toString() || p.id?.toString()) === val
                              );
                              if (chosen) {
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.featuredProductId`,
                                  chosen._id.toString()
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.title`,
                                  chosen.title
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.price`,
                                  `৳${chosen.price}`
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.link`,
                                  `/products/${chosen._id}`
                                );
                              } else {
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.featuredProductId`,
                                  null
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.title`,
                                  ""
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.price`,
                                  ""
                                );
                                updateNestedField(
                                  `heroSlider.slides.${sIdx}.floatingCard.link`,
                                  ""
                                );
                              }
                            }}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 cursor-pointer shadow-2xs"
                          >
                            <option value="">-- No Linked Product (Floating Card Disabled) --</option>
                            {allProducts.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.title} - ৳{p.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Live Product Preview */}
                        {(() => {
                          const currentProdId = slide.featuredProductId?._id
                            ? slide.featuredProductId._id.toString()
                            : slide.featuredProductId
                            ? slide.featuredProductId.toString()
                            : "";
                          const boundProd =
                            allProducts.find(
                              (p) => (p._id?.toString() || p.id?.toString()) === currentProdId
                            ) || (typeof slide.featuredProductId === "object" ? slide.featuredProductId : null);

                          if (!boundProd) return null;

                          const img =
                            (Array.isArray(boundProd.images) && boundProd.images[0]) ||
                            boundProd.image ||
                            "";

                          const count = boundProd.reviewCount || 0;
                          const avg = boundProd.avgRating || boundProd.averageRating || 0;

                          return (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                              {img ? (
                                <SafeImage
                                  src={img}
                                  alt={boundProd.title}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-lg object-cover border border-emerald-100 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                                  <Leaf className="w-5 h-5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {boundProd.title}
                                  </p>
                                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                    ৳{boundProd.price}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {count > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                      {avg.toFixed(1)} <span className="text-gray-400 font-normal">({count} reviews)</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-400">
                                      No reviews yet (Unrated)
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">•</span>
                                  <span className="text-[11px] text-[#2D6A4F] font-medium truncate">
                                    /products/{boundProd._id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
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

              {/* Featured 4 Collections Selector */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF0E6] text-[#2D6A4F] flex items-center justify-center shrink-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-800">
                          Featured 4 Collections Selector
                        </h4>
                        <span className="text-[10px] font-bold text-[#1E3F20] bg-[#EBF0E6] px-2 py-0.5 rounded-full">
                          Homepage Grid
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Choose exactly which 4 categories are featured on your homepage.
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
                    <span>Manage Categories &amp; Images &rarr;</span>
                  </button>
                </div>

                {/* 4-Column Responsive Grid */}
                {(() => {
                  const existingFeatured = Array.isArray(config.categoriesSection?.featuredCategoryIds)
                    ? config.categoriesSection.featuredCategoryIds.map((item) =>
                        typeof item === "object" && item?._id ? item._id.toString() : item?.toString() || ""
                      )
                    : [];

                  const slot1 = existingFeatured[0] || (categories[0]?._id?.toString() || "");
                  const slot2 = existingFeatured[1] || (categories[1]?._id?.toString() || "");
                  const slot3 = existingFeatured[2] || (categories[2]?._id?.toString() || "");
                  const slot4 = existingFeatured[3] || (categories[3]?._id?.toString() || "");
                  const currentSlots = [slot1, slot2, slot3, slot4];

                  const handleSlotChange = (slotIndex, newId) => {
                    const updated = [...currentSlots];
                    updated[slotIndex] = newId;
                    updateNestedField("categoriesSection.featuredCategoryIds", updated);
                  };

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const currentVal = currentSlots[slotIdx] || "";
                        const selectedCat = categories.find(
                          (c) => (c._id?.toString() || c.id?.toString()) === currentVal
                        );

                        return (
                          <div
                            key={`featured-collection-slot-${slotIdx}`}
                            className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs hover:border-[#2D6A4F]/40 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <span className="text-[11px] font-extrabold text-[#1E3F20] bg-[#EBF0E6] px-2.5 py-0.5 rounded-full">
                                  Slot #{slotIdx + 1}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-400">
                                  Card {slotIdx + 1} of 4
                                </span>
                              </div>

                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Category
                              </label>
                              <select
                                value={currentVal}
                                onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] cursor-pointer"
                              >
                                <option value="" disabled>
                                  Choose category...
                                </option>
                                {categories.map((cat) => (
                                  <option
                                    key={cat._id?.toString() || cat.slug}
                                    value={cat._id?.toString() || cat.id?.toString()}
                                  >
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Category Preview Card */}
                            <div className="bg-[#F2F5ED] rounded-xl p-2.5 border border-[#1E3F20]/10 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden relative shrink-0 border border-gray-200/80 flex items-center justify-center p-1">
                                {selectedCat?.image ? (
                                  <SafeImage
                                    src={selectedCat.image}
                                    fill
                                    sizes="48px"
                                    className="object-contain p-1"
                                    alt={selectedCat.name}
                                  />
                                ) : (
                                  <Sprout className="w-5 h-5 text-[#2D6A4F]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#1C2B1E] truncate">
                                  {selectedCat?.name || "Select Category"}
                                </p>
                                <p className="text-[11px] text-[#5A6B5C] font-medium mt-0.5 truncate">
                                  {typeof selectedCat?.productCount === "number"
                                    ? `${selectedCat.productCount}+ Plants`
                                    : selectedCat?.slug
                                    ? `/collections/${selectedCat.slug}`
                                    : "Empty slot"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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

                  <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-white border border-gray-200/80 rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">
                        Show Countdown Clock (কাউন্টডাউন টাইমার অন/অফ)
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Toggle to display or hide the dark countdown clock box on the homepage.
                      </p>
                    </div>
                    <Switch
                      checked={config.dealsSection?.showCountdown !== false}
                      onChange={(checked) =>
                        updateNestedField("dealsSection.showCountdown", checked)
                      }
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

              {/* Dynamic Tabs Builder (Max 5 Tabs) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>
                        Dynamic Tabs Builder ({(Array.isArray(config.newArrivals?.tabs) ? config.newArrivals.tabs : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs).length} / 5 Tabs)
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Curate up to 5 dynamic tabs linked to database categories or automated preset filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddArrivalTab}
                    disabled={(Array.isArray(config.newArrivals?.tabs) ? config.newArrivals.tabs : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs).length >= 5}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold hover:bg-[#dfe7d8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Tab</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {(Array.isArray(config.newArrivals?.tabs) ? config.newArrivals.tabs : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs).map((tab, tIdx) => {
                    const isCategory = tab.sourceType === "category";
                    const currentCatId =
                      typeof tab.categoryId === "object" && tab.categoryId?._id
                        ? tab.categoryId._id.toString()
                        : tab.categoryId
                        ? tab.categoryId.toString()
                        : "";

                    return (
                      <div
                        key={tab._id || tIdx}
                        className="bg-[#FAFBF9] rounded-2xl p-4 border border-gray-200/80 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                              {tIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#1A2E22]">
                              Tab {tIdx + 1}: {tab.label || "Untitled Tab"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveArrivalTab(tIdx)}
                            disabled={
                              (Array.isArray(config.newArrivals?.tabs)
                                ? config.newArrivals.tabs
                                : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs
                              ).length <= 1
                            }
                            className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed p-1 transition-colors cursor-pointer"
                            title="Remove Tab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">
                              Tab Display Label
                            </label>
                            <input
                              type="text"
                              value={tab.label || ""}
                              onChange={(e) =>
                                handleUpdateArrivalTab(tIdx, "label", e.target.value)
                              }
                              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                              placeholder="e.g. Indoor Plants or Special Bonsai"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">
                              Tab Source Selector
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateArrivalTab(tIdx, "sourceType", "preset")
                                }
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                  !isCategory
                                    ? "bg-[#1E3F20] text-white border-[#1E3F20] shadow-2xs"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                Preset Filter
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateArrivalTab(tIdx, "sourceType", "category")
                                }
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                  isCategory
                                    ? "bg-[#1E3F20] text-white border-[#1E3F20] shadow-2xs"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                Database Category
                              </button>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            {!isCategory ? (
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Preset Filter Criteria
                                </label>
                                <select
                                  value={tab.presetFilter || "all"}
                                  onChange={(e) =>
                                    handleUpdateArrivalTab(
                                      tIdx,
                                      "presetFilter",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                                >
                                  <option value="all">All Items</option>
                                  <option value="new_arrivals">Newest Arrivals</option>
                                  <option value="best_sellers">Best Sellers</option>
                                </select>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Select Database Category (Includes Unlisted)
                                </label>
                                <select
                                  value={currentCatId}
                                  onChange={(e) =>
                                    handleUpdateArrivalTab(
                                      tIdx,
                                      "categoryId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                                >
                                  <option value="">-- Choose Category --</option>
                                  {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                      {cat.name} {cat.isUnlisted ? "(Unlisted)" : ""}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  List includes all categories from MongoDB (both listed and unlisted collections).
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spotlight Show/Hide Switch */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs">
                <div>
                  <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Show Left Spotlight Banner (বামের স্পটলাইট ব্যানার অন/অফ)</span>
                  </h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Toggle left spotlight banner card. If turned off, products display across a full-width 4-column grid.
                  </p>
                </div>
                <Switch
                  checked={config.newArrivals?.showSpotlightBanner !== false}
                  onChange={(checked) =>
                    updateNestedField("newArrivals.showSpotlightBanner", checked)
                  }
                />
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
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              {/* Section Header Controls */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Section Header &amp; Navigation Controls</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Eyebrow / Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.topRankings?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("topRankings.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="CUSTOMER FAVORITES"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Section Main Title
                    </label>
                    <input
                      type="text"
                      value={config.topRankings?.title || ""}
                      onChange={(e) =>
                        updateNestedField("topRankings.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Mini Top Rankings"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Subtitle / Leaderboard Description
                    </label>
                    <input
                      type="text"
                      value={config.topRankings?.subtitle || ""}
                      onChange={(e) =>
                        updateNestedField("topRankings.subtitle", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="Top-rated botanical varieties ranked by gardener reviews and seasonal demand."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      View All Button Label
                    </label>
                    <input
                      type="text"
                      value={config.topRankings?.viewAllText || ""}
                      onChange={(e) =>
                        updateNestedField("topRankings.viewAllText", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="View All Rankings"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      View All Button Destination Link
                    </label>
                    <input
                      type="text"
                      value={config.topRankings?.viewAllUrl || ""}
                      onChange={(e) =>
                        updateNestedField("topRankings.viewAllUrl", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="/collections"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Ranking Columns Manager */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A2E22] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>3 Ranking Columns (Rank #1, #2, #3 Slots)</span>
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Each column showcases top 3 products with custom tags
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {[0, 1, 2].map((colIdx) => {
                    const col = getRankingColumn(colIdx);
                    return (
                      <div
                        key={colIdx}
                        className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* Column Header */}
                          <div className="border-b border-gray-100 pb-3 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#1A2E22] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                                  {colIdx + 1}
                                </span>
                                Column {colIdx + 1}
                              </span>
                              <span className="text-[10px] font-bold bg-[#EBF0E6] text-[#2D5A27] px-2 py-0.5 rounded-full">
                                Top 3
                              </span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Column Title
                              </label>
                              <input
                                type="text"
                                value={col.title}
                                onChange={(e) =>
                                  updateRankingColumnField(colIdx, "title", e.target.value)
                                }
                                className="w-full text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 font-semibold text-[#1A2E22]"
                                placeholder={`Column ${colIdx + 1} Title`}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Bottom Browse Link
                              </label>
                              <input
                                type="text"
                                value={col.browseUrl}
                                onChange={(e) =>
                                  updateRankingColumnField(colIdx, "browseUrl", e.target.value)
                                }
                                className="w-full text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-600"
                                placeholder="/collections"
                              />
                            </div>
                          </div>

                          {/* 3 Product Slots */}
                          <div className="space-y-3">
                            {col.items.map((item, itemIdx) => {
                              const rankColors = [
                                "bg-amber-100 text-amber-800 border-amber-300",
                                "bg-slate-100 text-slate-700 border-slate-300",
                                "bg-orange-100 text-orange-800 border-orange-200",
                              ];
                              return (
                                <div
                                  key={itemIdx}
                                  className="p-3 bg-[#FAFBF9] rounded-xl border border-gray-200/80 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black ${rankColors[itemIdx]}`}
                                      >
                                        #{itemIdx + 1}
                                      </span>
                                      <span className="text-[11px] font-bold text-gray-700">
                                        Rank #{itemIdx + 1} Specimen
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                                      Select Product
                                    </label>
                                    <select
                                      value={item.productId || ""}
                                      onChange={(e) =>
                                        updateRankingItemField(
                                          colIdx,
                                          itemIdx,
                                          "productId",
                                          e.target.value || null
                                        )
                                      }
                                      className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                                    >
                                      <option value="">
                                        -- Auto-assigned (Top Rated Fallback) --
                                      </option>
                                      {allProducts.map((p) => (
                                        <option key={p._id} value={p._id}>
                                          {p.title} (৳{p.price})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                                      Custom Mini Tag Badge
                                    </label>
                                    <input
                                      type="text"
                                      value={item.badge}
                                      onChange={(e) =>
                                        updateRankingItemField(
                                          colIdx,
                                          itemIdx,
                                          "badge",
                                          e.target.value
                                        )
                                      }
                                      className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                                      placeholder="e.g. NASA Verified"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              {/* Header Controls */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Section Header &amp; Call To Action</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Eyebrow / Tag Badge
                    </label>
                    <input
                      type="text"
                      value={config.blogSection?.badge || ""}
                      onChange={(e) =>
                        updateNestedField("blogSection.badge", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="e.g. KNOWLEDGE BASE"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Section Heading Title
                    </label>
                    <input
                      type="text"
                      value={config.blogSection?.title || ""}
                      onChange={(e) =>
                        updateNestedField("blogSection.title", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="e.g. Latest Plant Care Guides"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Section Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={config.blogSection?.subtitle || ""}
                    onChange={(e) =>
                      updateNestedField("blogSection.subtitle", e.target.value)
                    }
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                    placeholder="Practical advice from our certified botanists and nursery caretakers"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      "View All" Button Label
                    </label>
                    <input
                      type="text"
                      value={config.blogSection?.viewAllText || ""}
                      onChange={(e) =>
                        updateNestedField("blogSection.viewAllText", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="e.g. All Articles"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      "View All" Destination URL
                    </label>
                    <input
                      type="text"
                      value={config.blogSection?.viewAllUrl || ""}
                      onChange={(e) =>
                        updateNestedField("blogSection.viewAllUrl", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                      placeholder="e.g. /blog"
                    />
                  </div>
                </div>
              </div>

              {/* Blog Source Selector */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Blog Articles Source Mode</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Choose whether articles update automatically from your latest publications or are hand-picked.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-[#FAFBF9] p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        updateNestedField("blogSection.sourceMode", "latest")
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.blogSection?.sourceMode !== "selected"
                          ? "bg-white text-[#1E3F20] shadow-2xs border border-gray-200/60"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Auto: Latest Articles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateNestedField("blogSection.sourceMode", "selected")
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.blogSection?.sourceMode === "selected"
                          ? "bg-white text-[#1E3F20] shadow-2xs border border-gray-200/60"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 text-teal-600" />
                      <span>Handpick Specific</span>
                    </button>
                  </div>
                </div>

                {config.blogSection?.sourceMode !== "selected" ? (
                  /* Auto Mode Options */
                  <div className="p-4 bg-[#F4F6F4]/60 rounded-xl border border-[#2D6A4F]/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1A2E22]">
                          Number of Articles to Display
                        </label>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Select grid capacity on the homepage.
                        </p>
                      </div>
                      <select
                        value={config.blogSection?.displayCount || 3}
                        onChange={(e) =>
                          updateNestedField(
                            "blogSection.displayCount",
                            Number(e.target.value)
                          )
                        }
                        className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1E3F20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 cursor-pointer"
                      >
                        <option value={3}>3 Articles (Single 3-Column Row)</option>
                        <option value={6}>6 Articles (Two 3-Column Rows)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-200/40">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>
                        The system automatically displays the newest published guides in descending order.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Handpick Specific Articles */
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600">
                      Assign up to 3 specific featured articles for the homepage grid. If unassigned, slots automatically fall back to latest published blogs.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((slotIdx) => {
                        const rawList = Array.isArray(config.blogSection?.selectedBlogIds)
                          ? config.blogSection.selectedBlogIds
                          : [];
                        const currentId = rawList[slotIdx] || null;
                        const selectedBlog = allBlogs.find(
                          (b) =>
                            (b._id?.toString() || b.id?.toString()) ===
                            (currentId?.toString ? currentId.toString() : currentId)
                        );

                        const handleSlotChange = (newBlogId) => {
                          const current = Array.isArray(config.blogSection?.selectedBlogIds)
                            ? [...config.blogSection.selectedBlogIds]
                            : [];
                          while (current.length <= slotIdx) {
                            current.push(null);
                          }
                          if (newBlogId) {
                            current[slotIdx] = newBlogId;
                          } else {
                            current.splice(slotIdx, 1);
                          }
                          updateNestedField(
                            "blogSection.selectedBlogIds",
                            current.filter(Boolean)
                          );
                        };

                        return (
                          <div
                            key={slotIdx}
                            className="p-4 bg-[#FAFBF9] rounded-2xl border border-gray-200/80 space-y-3 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1A2E22]">
                                  <span className="w-5 h-5 rounded-full bg-[#EBF0E6] text-[#2D6A4F] flex items-center justify-center text-[10px] font-black border border-[#2D6A4F]/20">
                                    #{slotIdx + 1}
                                  </span>
                                  <span>Article Slot #{slotIdx + 1}</span>
                                </span>
                                {currentId && (
                                  <button
                                    type="button"
                                    onClick={() => handleSlotChange(null)}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>

                              <label className="block text-[10px] font-bold text-gray-500 mb-1">
                                Select Article
                              </label>
                              <select
                                value={currentId || ""}
                                onChange={(e) => handleSlotChange(e.target.value || null)}
                                className="w-full text-xs px-2.5 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                              >
                                <option value="">-- Fallback to Latest Guide --</option>
                                {allBlogs.map((b) => (
                                  <option key={b._id} value={b._id}>
                                    {b.title} ({b.category || "General"})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {selectedBlog ? (
                              <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2.5">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                  <SafeImage
                                    src={selectedBlog.coverImage || selectedBlog.image}
                                    fallback="https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80"
                                    alt={selectedBlog.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider truncate">
                                    {selectedBlog.category || "Plant Care"}
                                  </p>
                                  <p className="text-xs font-bold text-[#1A2E22] truncate">
                                    {selectedBlog.title}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {selectedBlog.readTime || "5 min read"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 text-[11px] text-gray-400 italic">
                                Auto-filled with newest article.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Navigation to Blog Management */}
              <div className="bg-[#EBF0E6]/50 rounded-2xl p-4 border border-[#2D6A4F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#2D6A4F] flex items-center justify-center shadow-2xs border border-[#2D6A4F]/10 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1A2E22]">
                      Write or Edit Articles in Blog Manager
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Create new plant care articles, update categories, cover photos, and tags.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof onNavigateTab === "function") {
                      onNavigateTab("blogs");
                    } else {
                      window.location.href = "/Manage_Admin?tab=blogs";
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#2D6A4F] border border-[#2D6A4F]/20 text-xs font-bold hover:bg-[#2D6A4F] hover:text-white transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <span>Open Blog Writer &amp; Manager</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
            <div className="p-6 border-t border-gray-100 bg-[#FAFBF9] space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>4 Botanical Trust Pillars (Cards Customizer)</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Customize the 4 pre-footer confidence cards. Each item displays an icon, title, and descriptive guarantee.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((cardIdx) => {
                  const defaultItem =
                    DEFAULT_HOMEPAGE_CONFIG.guaranteeStrip?.items?.[cardIdx] || {
                      icon: "ShieldCheck",
                      title: `Trust Pillar #${cardIdx + 1}`,
                      description: "",
                    };
                  const currentItem =
                    config.guaranteeStrip?.items?.[cardIdx] || defaultItem;
                  const IconComp =
                    GUARANTEE_ICON_COMPONENTS[currentItem.icon] || ShieldCheck;

                  return (
                    <div
                      key={cardIdx}
                      className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-xs font-extrabold text-[#1A2E22] flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#EBF0E6] text-[#2D6A4F] flex items-center justify-center text-[10px] font-black border border-[#2D6A4F]/20">
                              {cardIdx + 1}
                            </span>
                            <span>Card #{cardIdx + 1} Pillar</span>
                          </span>

                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF0E6] text-[#2D6A4F] text-xs font-bold">
                            <IconComp className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{currentItem.icon || "ShieldCheck"}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Icon Selector
                          </label>
                          <select
                            value={currentItem.icon || "ShieldCheck"}
                            onChange={(e) =>
                              updateGuaranteeItem(cardIdx, "icon", e.target.value)
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 cursor-pointer font-medium"
                          >
                            {GUARANTEE_ICON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Pillar Title
                          </label>
                          <input
                            type="text"
                            value={currentItem.title || ""}
                            onChange={(e) =>
                              updateGuaranteeItem(cardIdx, "title", e.target.value)
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                            placeholder="e.g. 100% Healthy Plant Guarantee"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={currentItem.description || ""}
                            onChange={(e) =>
                              updateGuaranteeItem(
                                cardIdx,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                            placeholder="Acclimatized for resilience. 48-hour replacement warranty..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      </div>
    </div>
  );
}
