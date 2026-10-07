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
  LayoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import NavigationManagerTab from "@/components/NavigationManagerTab";
import HomepageCustomizerTab from "@/components/HomepageCustomizerTab";
import {
  Sliders,
  UploadCloud,
  Image as ImageIcon,
  Plus as PlusIcon,
  Trash2,
  Layers,
  Grid,
  AlignLeft,
  HelpCircle,
  ExternalLink,
  ShoppingBag,
  Loader2,
  Sparkles,
  MoveUp,
  MoveDown,
  Check,
  ChevronDown,
  X as CloseIcon,
} from "lucide-react";

const SECTION_TYPE_META = {
  hero: { label: "Hero Banner", color: "gold" },
  categories: { label: "Botanical Category Grid", color: "cyan" },
  products: { label: "Products Catalog Grid", color: "green" },
  features: { label: "Why Choose Us / Features", color: "blue" },
  promo_banner: { label: "Special Promo Banner", color: "volcano" },
  faq: { label: "FAQ Accordion", color: "purple" },
  testimonials: { label: "Customer Reviews", color: "orange" },
  custom_banner: { label: "Custom Media Banner", color: "magenta" },
  custom_grid: { label: "Custom Visual Grid", color: "geekblue" },
};

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    tagline: "#THE BOTANICAL SERIES",
    title: "Bring Nature Into Your Living Space",
    subtitle:
      "Curated house plants, pure organic soil conditioners, and artisanal ceramic planters designed to purify your atmosphere and inspire calm living across Bangladesh.",
    buttonText: "Shop Now",
    buttonLink: "#products",
    secondaryBtnText: "Today's Deals",
    secondaryBtnLink: "#deals",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1000&q=85",
    badgePrice: "৳320",
    badgeTitle: "Starting From",
  },
  {
    id: "slide-2",
    tagline: "#AIR PURIFIER COLLECTION",
    title: "Breathe Cleaner Air With Living Foliage",
    subtitle:
      "NASA-recommended indoor plants that naturally filter benzene, formaldehyde, and dust from urban homes and modern workspaces.",
    buttonText: "Explore Foliage",
    buttonLink: "/products?category=plant",
    secondaryBtnText: "Care Guides",
    secondaryBtnLink: "#blog",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1000&q=85",
    badgePrice: "৳450",
    badgeTitle: "Fresh Arrival",
  },
  {
    id: "slide-3",
    tagline: "#ORGANIC SOIL & CARE",
    title: "Nourish Every Root with 100% Organic Mediums",
    subtitle:
      "Enriched vermicompost, slow-release bio-fertilizers, and breathable terracotta pots for flourishing balconies and rooftop gardens.",
    buttonText: "Shop Fertilizers",
    buttonLink: "/products?category=fertilizer",
    secondaryBtnText: "Learn More",
    secondaryBtnLink: "/about",
    image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1000&q=85",
    badgePrice: "৳180",
    badgeTitle: "Best Seller",
  },
];

const DEFAULT_PASTEL_CATEGORIES = [
  {
    id: "top-rated",
    title: "Top-Rated Plants",
    category: "plant",
    count: "120+",
    bgColor: "bg-[#E8F5E9]",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80",
  },
  {
    id: "indoor-foliage",
    title: "Indoor Foliage",
    category: "plant",
    count: "85+",
    bgColor: "bg-[#E3F2FD]",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&q=80",
  },
  {
    id: "best-sellers",
    title: "Best-Sellers",
    category: "fertilizer",
    count: "45+",
    bgColor: "bg-[#FFF3E0]",
    image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80",
  },
  {
    id: "gardening-tools",
    title: "Gardening Tools",
    category: "tool",
    count: "60+",
    bgColor: "bg-[#F1F8E9]",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
  },
];

const TEMPLATE_PRESETS = [
  {
    type: "promo_banner",
    title: "Monsoon Plant Sale — Flat 20% Off",
    subtitle: "Use coupon code MONSOON20 on all indoor plants and ceramic pots this week.",
    desc: "Vibrant promotional banner with call-to-action button and discount badge.",
    content: {
      badgeText: "Limited Time Offer",
      buttonText: "Shop Sale Plants",
      buttonLink: "/products?category=plant",
    },
  },
  {
    type: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about ordering live plants and fertilizers online.",
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
    desc: "Customizable callout banner with custom title, subtitle, and CTA link.",
    content: {
      badgeText: "Corporate Plant Service",
      buttonText: "Request Consultation",
      buttonLink: "/contact",
      imageUrl: "",
    },
  },
];

export default function ThemeBuilderTab({ onNavigateTab }) {
  const { message: antdMessage } = App.useApp();

  // Active Sub-Tab: "customizer" | "sections" | "menu"
  const [activeSubTab, setActiveSubTab] = useState("customizer");

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
    layout: "vesoz-slider",
    slides: [],
    categories: [],
    cardImage: "",
    cardPlantName: "",
    cardStartingPrice: "",
    trustMetrics: [],
    items: [], // For FAQ or Testimonials
  });

  const [uploadingHeroSlideIndex, setUploadingHeroSlideIndex] = useState(null);
  const [uploadingCategoryIndex, setUploadingCategoryIndex] = useState(null);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);


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

  // ─── Custom Grid Builder State ───────────────────────────────────────────────
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomSection, setEditingCustomSection] = useState(null);
  const [savingCustomSection, setSavingCustomSection] = useState(false);
  const [uploadingBlockImageIndex, setUploadingBlockImageIndex] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customForm, setCustomForm] = useState({
    title: "",
    subtitle: "",
    layout: "2-column",
    backgroundColor: "#F8FAF8",
    textColor: "#1F2937",
    blocks: [],
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
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const list = data.categories || data.data;
        if (data.success && Array.isArray(list)) {
          setCategories(list);
        }
      })
      .catch(() => { });
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

  // ─── Custom Section Builder Handlers ─────────────────────────────────────
  const handleOpenCustomSection = (section = null) => {
    if (section) {
      setEditingCustomSection(section);
      setCustomForm({
        title: section.title || "",
        subtitle: section.subtitle || "",
        layout: section.layout || "2-column",
        backgroundColor: section.backgroundColor || "#F8FAF8",
        textColor: section.textColor || "#1F2937",
        blocks: Array.isArray(section.blocks) && section.blocks.length > 0
          ? JSON.parse(JSON.stringify(section.blocks))
          : [
            {
              type: "text",
              data: {
                badge: "Botanical Spotlight",
                title: "Nurture Nature Indoors",
                subtitle: "Hand-potted in organic soil",
                body: "Experience the therapeutic beauty of air-purifying foliage nurtured for healthy root growth.",
              },
            },
          ],
      });
    } else {
      setEditingCustomSection(null);
      setCustomForm({
        title: "Botanical Feature Showcase",
        subtitle: "Explore our specially curated seasonal arrangements.",
        layout: "2-column",
        backgroundColor: "#F8FAF8",
        textColor: "#1F2937",
        blocks: [
          {
            type: "text",
            data: {
              badge: "Botanical Spotlight",
              title: "Nurture Nature Indoors",
              subtitle: "Hand-potted in organic soil",
              body: "Experience the therapeutic beauty of air-purifying foliage nurtured for healthy root growth.",
            },
          },
          {
            type: "image",
            data: {
              imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80",
              alt: "Monstera foliage",
              caption: "Freshly acclimatized specimens",
            },
          },
        ],
      });
    }
    setIsCustomModalOpen(true);
  };

  const handleAddBlock = (type) => {
    let newBlockData = {};
    if (type === "text") {
      newBlockData = {
        badge: "Special Feature",
        title: "Heading Title",
        subtitle: "Short explanatory subtitle",
        body: "Enter your rich botanical body description here.",
      };
    } else if (type === "image") {
      newBlockData = {
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80",
        alt: "Botanical showcase",
        caption: "",
      };
    } else if (type === "accordion") {
      newBlockData = {
        accordionItems: [
          { title: "How often should I water indoor plants?", content: "Most indoor plants thrive when the top 1-2 inches of soil feel dry to the touch." },
          { title: "What type of light is best?", content: "Bright, indirect sunlight near an east or north-facing window is ideal for most houseplants." },
        ],
      };
    } else if (type === "button") {
      newBlockData = {
        buttonText: "Explore Botanical Collection ↗",
        buttonLink: "/#products",
      };
    } else if (type === "products") {
      newBlockData = {
        categoryId: categories[0]?.slug || "plant",
        limit: 4,
      };
    }

    setCustomForm((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { type, data: newBlockData }],
    }));
  };

  const handleRemoveBlock = (idx) => {
    setCustomForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== idx),
    }));
  };

  const handleMoveBlock = (idx, dir) => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= customForm.blocks.length) return;
    setCustomForm((prev) => {
      const copy = [...prev.blocks];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return { ...prev, blocks: copy };
    });
  };

  const handleUpdateBlockData = (idx, key, val) => {
    setCustomForm((prev) => {
      const copy = [...prev.blocks];
      copy[idx] = {
        ...copy[idx],
        data: {
          ...(copy[idx].data || {}),
          [key]: val,
        },
      };
      return { ...prev, blocks: copy };
    });
  };

  const handleBlockImageUpload = async (blockIdx, e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      antdMessage.error("Cloudinary credentials are not configured.");
      return;
    }

    try {
      setUploadingBlockImageIndex(blockIdx);
      const options = {
        maxSizeMB: 0.25,
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
        handleUpdateBlockData(blockIdx, "imageUrl", data.secure_url);
        antdMessage.success("Image compressed & uploaded to Cloudinary!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      antdMessage.error(err.message || "Failed to upload image");
    } finally {
      setUploadingBlockImageIndex(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveCustomSection = async (e) => {
    e.preventDefault();
    if (!customForm.title.trim()) {
      antdMessage.error("Please enter a section title.");
      return;
    }

    try {
      setSavingCustomSection(true);
      const isEdit = Boolean(editingCustomSection?._id);
      const url = isEdit
        ? `/api/admin/sections/${editingCustomSection._id}`
        : "/api/admin/sections";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        sectionType: "custom_grid",
        title: customForm.title.trim(),
        subtitle: customForm.subtitle.trim(),
        layout: customForm.layout,
        backgroundColor: customForm.backgroundColor,
        textColor: customForm.textColor,
        blocks: customForm.blocks,
        ...(isEdit && {
          order: editingCustomSection.order,
          isActive: editingCustomSection.isActive,
        }),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save section");
      }

      antdMessage.success(
        isEdit ? "Custom grid section updated!" : "New custom grid section created!"
      );
      setIsCustomModalOpen(false);
      fetchSections();
    } catch (err) {
      antdMessage.error(err.message || "Failed to save custom section");
    } finally {
      setSavingCustomSection(false);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary credentials are not configured.");
    }

    const options = {
      maxSizeMB: 0.35,
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
      return data.secure_url;
    }
    throw new Error(data.error?.message || "Upload failed");
  };

  const handleOpenEditSection = (section) => {
    if (section.sectionType === "custom_grid") {
      handleOpenCustomSection(section);
      return;
    }
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
      layout: section.layout || (section.sectionType === "hero" ? "vesoz-slider" : "pastel-cards"),
      slides: Array.isArray(content.slides) && content.slides.length > 0
        ? JSON.parse(JSON.stringify(content.slides))
        : JSON.parse(JSON.stringify(DEFAULT_SLIDES)),
      categories: Array.isArray(content.categories) && content.categories.length > 0
        ? JSON.parse(JSON.stringify(content.categories))
        : JSON.parse(JSON.stringify(DEFAULT_PASTEL_CATEGORIES)),
      cardImage: content.cardImage || "",
      cardPlantName: content.cardPlantName || "Monstera Deliciosa",
      cardStartingPrice: content.cardStartingPrice || "৳320",
      trustMetrics: Array.isArray(content.trustMetrics) && content.trustMetrics.length === 3
        ? JSON.parse(JSON.stringify(content.trustMetrics))
        : [
          { value: "500+", label: "Rare Varieties" },
          { value: "100%", label: "Acclimatized" },
          { value: "48-Hr", label: "Replacement" },
        ],
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
        ...(editingSection.sectionType === "hero" && {
          slides: sectionForm.slides,
          cardImage: sectionForm.cardImage,
          cardPlantName: sectionForm.cardPlantName,
          cardStartingPrice: sectionForm.cardStartingPrice,
          trustMetrics: sectionForm.trustMetrics,
        }),
        ...(editingSection.sectionType === "categories" && {
          categories: sectionForm.categories,
        }),
      };

      const res = await fetch(`/api/admin/sections/${editingSection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sectionForm.title,
          subtitle: sectionForm.subtitle,
          layout: sectionForm.layout || editingSection.layout,
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
      window.dispatchEvent(new Event("homepageSectionsUpdated"));
      fetchSections();
    } catch (err) {
      antdMessage.error(err.message);
    } finally {
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
        <div className="flex items-center gap-2 bg-[#FAFBF9] p-1.5 rounded-2xl border border-emerald-100/60 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setActiveSubTab("customizer")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSubTab === "customizer"
                ? "bg-[#2D6A4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#2D6A4F]"
              }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Homepage Section Manager (9 Sections)</span>
          </button>
          <button
            onClick={() => setActiveSubTab("sections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSubTab === "sections"
                ? "bg-[#2D6A4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#2D6A4F]"
              }`}
          >
            <AppstoreOutlined />
            <span>Custom Page Blocks ({sections.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeSubTab === "menu"
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
          SUB-TAB 0: HOMEPAGE SECTION MANAGER (9 SECTIONS)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "customizer" && <HomepageCustomizerTab onNavigateTab={onNavigateTab} />}

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
                onClick={() => handleOpenCustomSection()}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusOutlined /> Create Custom Section
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusOutlined /> Section Templates
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
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mx-auto mb-3">
                <LayoutOutlined className="text-2xl" />
              </div>
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
                  color: "default",
                };

                return (
                  <div
                    key={section._id}
                    className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${section.isActive
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
                            {meta.label}
                          </Tag>
                          {/* Visual Layout Indicator Badge */}
                          {section.sectionType === "hero" && (
                            <Tag
                              color={section.layout === "classic-card" ? "blue" : "green"}
                              className="font-semibold text-[10px] rounded-md m-0"
                            >
                              Layout: {section.layout === "classic-card" ? "Card with Badges (Classic)" : "Botanical Slider (VESOZ)"}
                            </Tag>
                          )}
                          {section.sectionType === "categories" && (
                            <Tag color="cyan" className="font-semibold text-[10px] rounded-md m-0">
                              Layout: 4-Pastel Cards (VESOZ)
                            </Tag>
                          )}
                          {section.sectionType === "custom_grid" && (
                            <Tag color="purple" className="font-semibold text-[10px] rounded-md m-0">
                              Layout: {section.layout || "2-column"}
                            </Tag>
                          )}
                          {!["hero", "categories", "custom_grid"].includes(section.sectionType) && section.layout && (
                            <Tag color="default" className="text-[10px] m-0">
                              Layout: {section.layout}
                            </Tag>
                          )}
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
        <NavigationManagerTab categories={categories} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD NEW SECTION FROM TEMPLATE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusOutlined className="text-emerald-600" /> Add New Section Template
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
        width={760}
      >
        {editingSection && (
          <form onSubmit={handleSaveSection} className="space-y-5 pt-3 max-h-[75vh] overflow-y-auto pr-2">

            {/* ══════════════════════════════════════════════════════════════════
                HERO SECTION SPECIAL CONTROLS
            ══════════════════════════════════════════════════════════════════ */}
            {editingSection.sectionType === "hero" && (
              <div className="space-y-5">
                {/* 1. Layout Variant Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Hero Section Layout Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSectionForm({ ...sectionForm, layout: "vesoz-slider" })}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${sectionForm.layout !== "classic-card"
                          ? "border-[#2D6A4F] bg-emerald-50/60 text-[#2D6A4F] shadow-xs ring-2 ring-[#2D6A4F]/20 font-bold"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Variant 1: Botanical Slider (VESOZ)</span>
                        {sectionForm.layout !== "classic-card" && (
                          <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-gray-500 mt-1 leading-relaxed">
                        Interactive 5s auto-play carousel with bold serif headline & full-bleed plant photography.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSectionForm({ ...sectionForm, layout: "classic-card" })}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${sectionForm.layout === "classic-card"
                          ? "border-[#2D6A4F] bg-emerald-50/60 text-[#2D6A4F] shadow-xs ring-2 ring-[#2D6A4F]/20 font-bold"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Variant 2: Card with Badges (Classic)</span>
                        {sectionForm.layout === "classic-card" && (
                          <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-gray-500 mt-1 leading-relaxed">
                        Preserved layout with rounded 4:3 white card, floating price badge, and trust metrics.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Hero Slider Manager (For VESOZ Slider Variant) */}
                {sectionForm.layout !== "classic-card" ? (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Hero Carousel Slides ({sectionForm.slides.length})</h4>
                        <p className="text-[11px] text-gray-500">Each slide transitions automatically every 5 seconds on the live store.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSlide = {
                            id: `slide-${Date.now()}`,
                            tagline: "#NEW COLLECTION",
                            title: "Fresh Botanical Arrivals",
                            subtitle: "Explore our latest handpicked specimens acclimatized for indoor vitality.",
                            buttonText: "Shop Collection",
                            buttonLink: "#products",
                            secondaryBtnText: "Today's Deals",
                            secondaryBtnLink: "#deals",
                            image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1000&q=85",
                            badgePrice: "৳350",
                            badgeTitle: "New Arrival",
                          };
                          setSectionForm({
                            ...sectionForm,
                            slides: [...sectionForm.slides, newSlide],
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Add Slide
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                      {sectionForm.slides.map((slide, sIdx) => (
                        <div key={slide.id || sIdx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-[#2D6A4F] text-white flex items-center justify-center text-[10px]">
                                {sIdx + 1}
                              </span>
                              Slide #{sIdx + 1}
                            </span>
                            {sectionForm.slides.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSectionForm({
                                    ...sectionForm,
                                    slides: sectionForm.slides.filter((_, i) => i !== sIdx),
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Tagline Badge
                              </label>
                              <input
                                type="text"
                                value={slide.tagline}
                                onChange={(e) => {
                                  const copy = [...sectionForm.slides];
                                  copy[sIdx].tagline = e.target.value;
                                  setSectionForm({ ...sectionForm, slides: copy });
                                }}
                                placeholder="#THE BOTANICAL SERIES"
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Price Badge (Optional)
                              </label>
                              <input
                                type="text"
                                value={slide.badgePrice || ""}
                                onChange={(e) => {
                                  const copy = [...sectionForm.slides];
                                  copy[sIdx].badgePrice = e.target.value;
                                  setSectionForm({ ...sectionForm, slides: copy });
                                }}
                                placeholder="৳320"
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Slide Headline
                            </label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                const copy = [...sectionForm.slides];
                                copy[sIdx].title = e.target.value;
                                setSectionForm({ ...sectionForm, slides: copy });
                              }}
                              className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Slide Subtitle / Description
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtitle}
                              onChange={(e) => {
                                const copy = [...sectionForm.slides];
                                copy[sIdx].subtitle = e.target.value;
                                setSectionForm({ ...sectionForm, slides: copy });
                              }}
                              className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">Primary Button</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Text (Shop Now)"
                                  value={slide.buttonText || ""}
                                  onChange={(e) => {
                                    const copy = [...sectionForm.slides];
                                    copy[sIdx].buttonText = e.target.value;
                                    setSectionForm({ ...sectionForm, slides: copy });
                                  }}
                                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5"
                                />
                                <input
                                  type="text"
                                  placeholder="URL (#products)"
                                  value={slide.buttonLink || ""}
                                  onChange={(e) => {
                                    const copy = [...sectionForm.slides];
                                    copy[sIdx].buttonLink = e.target.value;
                                    setSectionForm({ ...sectionForm, slides: copy });
                                  }}
                                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">Secondary Button</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Text (Today's Deals)"
                                  value={slide.secondaryBtnText || ""}
                                  onChange={(e) => {
                                    const copy = [...sectionForm.slides];
                                    copy[sIdx].secondaryBtnText = e.target.value;
                                    setSectionForm({ ...sectionForm, slides: copy });
                                  }}
                                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5"
                                />
                                <input
                                  type="text"
                                  placeholder="URL (#deals)"
                                  value={slide.secondaryBtnLink || ""}
                                  onChange={(e) => {
                                    const copy = [...sectionForm.slides];
                                    copy[sIdx].secondaryBtnLink = e.target.value;
                                    setSectionForm({ ...sectionForm, slides: copy });
                                  }}
                                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Slide Image with Cloudinary Upload */}
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Plant Image (Cloudinary or URL)
                            </label>
                            <div className="flex items-center gap-3">
                              {slide.image && (
                                <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white relative overflow-hidden shrink-0">
                                  <img
                                    src={slide.image}
                                    alt="Slide preview"
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                              )}
                              <input
                                type="text"
                                value={slide.image}
                                onChange={(e) => {
                                  const copy = [...sectionForm.slides];
                                  copy[sIdx].image = e.target.value;
                                  setSectionForm({ ...sectionForm, slides: copy });
                                }}
                                placeholder="https://..."
                                className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                              />
                              <label className="px-3 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all cursor-pointer shrink-0">
                                {uploadingHeroSlideIndex === sIdx ? "Uploading…" : "Upload"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingHeroSlideIndex === sIdx}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setUploadingHeroSlideIndex(sIdx);
                                      const url = await uploadImageToCloudinary(file);
                                      const copy = [...sectionForm.slides];
                                      copy[sIdx].image = url;
                                      setSectionForm({ ...sectionForm, slides: copy });
                                      antdMessage.success("Slide image uploaded to Cloudinary!");
                                    } catch (err) {
                                      antdMessage.error(err.message || "Failed to upload image");
                                    } finally {
                                      setUploadingHeroSlideIndex(null);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* 3. Hero Classic Card Settings */
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-slate-900">Classic Card Layout Parameters</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Headline</label>
                        <input
                          type="text"
                          value={sectionForm.title}
                          onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Top Badge</label>
                        <input
                          type="text"
                          value={sectionForm.badgeText}
                          onChange={(e) => setSectionForm({ ...sectionForm, badgeText: e.target.value })}
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Subtitle</label>
                      <textarea
                        rows={2}
                        value={sectionForm.subtitle}
                        onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Plant Name Badge</label>
                        <input
                          type="text"
                          value={sectionForm.cardPlantName}
                          onChange={(e) => setSectionForm({ ...sectionForm, cardPlantName: e.target.value })}
                          placeholder="Monstera Deliciosa"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Starting Price</label>
                        <input
                          type="text"
                          value={sectionForm.cardStartingPrice}
                          onChange={(e) => setSectionForm({ ...sectionForm, cardStartingPrice: e.target.value })}
                          placeholder="৳320"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Card Image Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        Card Image (Cloudinary or URL)
                      </label>
                      <div className="flex items-center gap-3">
                        {sectionForm.cardImage && (
                          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white relative overflow-hidden shrink-0">
                            <img
                              src={sectionForm.cardImage}
                              alt="Card preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          value={sectionForm.cardImage}
                          onChange={(e) => setSectionForm({ ...sectionForm, cardImage: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                        />
                        <label className="px-3 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all cursor-pointer shrink-0">
                          {uploadingSectionImage ? "Uploading…" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingSectionImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setUploadingSectionImage(true);
                                const url = await uploadImageToCloudinary(file);
                                setSectionForm({ ...sectionForm, cardImage: url });
                                antdMessage.success("Card image uploaded!");
                              } catch (err) {
                                antdMessage.error(err.message || "Failed to upload image");
                              } finally {
                                setUploadingSectionImage(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                CATEGORY GRID SPECIAL CONTROLS
            ══════════════════════════════════════════════════════════════════ */}
            {editingSection.sectionType === "categories" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                      placeholder="Shop by Botanical Category"
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Top Subtitle
                    </label>
                    <input
                      type="text"
                      value={sectionForm.subtitle}
                      onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                      placeholder="Curated Collections"
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">4-Square Pastel Category Cards</h4>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Edit category titles, product counts, and upload transparent PNG plant images.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {sectionForm.categories.map((cat, cIdx) => (
                    <div key={cat.id || cIdx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Card #{cIdx + 1}: {cat.bgColor?.replace("bg-[", "")?.replace("]", "") || "Pastel"}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-gray-200">
                          {cat.category || "all"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => {
                              const copy = [...sectionForm.categories];
                              copy[cIdx].title = e.target.value;
                              setSectionForm({ ...sectionForm, categories: copy });
                            }}
                            className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Count Label</label>
                          <input
                            type="text"
                            value={cat.count}
                            placeholder="120+ Products"
                            onChange={(e) => {
                              const copy = [...sectionForm.categories];
                              copy[cIdx].count = e.target.value;
                              setSectionForm({ ...sectionForm, categories: copy });
                            }}
                            className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                      </div>

                      {/* Category Image with Cloudinary */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Plant Image</label>
                        <div className="flex items-center gap-2">
                          {cat.image && (
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white relative overflow-hidden shrink-0">
                              <img src={cat.image} alt={cat.title} className="w-full h-full object-contain p-0.5" />
                            </div>
                          )}
                          <input
                            type="text"
                            value={cat.image}
                            onChange={(e) => {
                              const copy = [...sectionForm.categories];
                              copy[cIdx].image = e.target.value;
                              setSectionForm({ ...sectionForm, categories: copy });
                            }}
                            placeholder="Image URL"
                            className="flex-1 bg-white border border-gray-200 text-xs rounded-lg px-2 py-1"
                          />
                          <label className="px-2.5 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-[11px] font-bold cursor-pointer shrink-0">
                            {uploadingCategoryIndex === cIdx ? "…" : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingCategoryIndex === cIdx}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingCategoryIndex(cIdx);
                                  const url = await uploadImageToCloudinary(file);
                                  const copy = [...sectionForm.categories];
                                  copy[cIdx].image = url;
                                  setSectionForm({ ...sectionForm, categories: copy });
                                  antdMessage.success("Category image updated!");
                                } catch (err) {
                                  antdMessage.error(err.message || "Upload failed");
                                } finally {
                                  setUploadingCategoryIndex(null);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STANDARD FIELDS FOR OTHER SECTIONS (Promo, FAQ, Testimonials, etc.)
            ══════════════════════════════════════════════════════════════════ */}
            {!["hero", "categories"].includes(editingSection.sectionType) && (
              <div className="space-y-4">
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
                    placeholder="e.g. Special Offer"
                    value={sectionForm.badgeText}
                    onChange={(e) => setSectionForm({ ...sectionForm, badgeText: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-sm text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Buttons (for Promo, Custom Banner) */}
                {["promo_banner", "custom_banner"].includes(editingSection.sectionType) && (
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

                {/* Banner Image Upload for Promo & Custom Banners */}
                {["promo_banner", "custom_banner"].includes(editingSection.sectionType) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Banner Image (Cloudinary or URL)
                    </label>
                    <div className="flex items-center gap-3">
                      {sectionForm.imageUrl && (
                        <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white relative overflow-hidden shrink-0">
                          <img src={sectionForm.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={sectionForm.imageUrl}
                        onChange={(e) => setSectionForm({ ...sectionForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold cursor-pointer shrink-0">
                        {uploadingSectionImage ? "Uploading…" : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingSectionImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setUploadingSectionImage(true);
                              const url = await uploadImageToCloudinary(file);
                              setSectionForm({ ...sectionForm, imageUrl: url });
                              antdMessage.success("Image uploaded!");
                            } catch (err) {
                              antdMessage.error(err.message || "Upload failed");
                            } finally {
                              setUploadingSectionImage(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
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
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer p-1"
                        >
                          <CloseOutlined />
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
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer p-1"
                        >
                          <CloseOutlined />
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

      {/* Section edit modal ends */}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADVANCED VISUAL SECTION BUILDER (NO-CODE GRID BUILDER)
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#2D6A4F]" />
            <span>{editingCustomSection ? "Edit Custom Grid Section" : "Create Custom Grid Section"}</span>
          </div>
        }
        open={isCustomModalOpen}
        onCancel={() => setIsCustomModalOpen(false)}
        footer={null}
        width={780}
      >
        <form onSubmit={handleSaveCustomSection} className="space-y-5 pt-3 max-h-[78vh] overflow-y-auto pr-1">
          {/* Section Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Section Heading *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Exotic Rare Specimen Gallery"
                value={customForm.title}
                onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                className="w-full bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Handcrafted care guidelines & seasonal arrivals"
                value={customForm.subtitle}
                onChange={(e) => setCustomForm({ ...customForm, subtitle: e.target.value })}
                className="w-full bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* 1. Layout Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span>Grid Column Layout</span>
              <span className="text-[11px] text-gray-400 font-normal">Controls frontend desktop columns</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "1-column", label: "1 Column", icon: "▭" },
                { id: "2-column", label: "2 Columns", icon: "▥" },
                { id: "3-column", label: "3 Columns", icon: "▤" },
                { id: "4-column", label: "4 Columns", icon: "▦" },
                { id: "split-banner", label: "Split Banner", icon: "◫" },
              ].map((lyt) => {
                const isSelected = customForm.layout === lyt.id;
                return (
                  <button
                    key={lyt.id}
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, layout: lyt.id })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                        ? "border-[#2D6A4F] bg-emerald-50/50 shadow-xs ring-1 ring-[#2D6A4F]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                  >
                    <div className={`text-base font-bold mb-1 ${isSelected ? "text-[#2D6A4F]" : "text-gray-400"}`}>
                      {lyt.icon}
                    </div>
                    <p className={`text-xs font-bold ${isSelected ? "text-[#2D6A4F]" : "text-gray-700"}`}>
                      {lyt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Colors Pickers & Botanical Swatches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customForm.backgroundColor}
                  onChange={(e) => setCustomForm({ ...customForm, backgroundColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={customForm.backgroundColor}
                  onChange={(e) => setCustomForm({ ...customForm, backgroundColor: e.target.value })}
                  className="w-28 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-white"
                />
                <div className="flex items-center gap-1">
                  {["#F8FAF8", "#FFFFFF", "#E8F5E9", "#F4F6F4"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomForm({ ...customForm, backgroundColor: c })}
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={`Select ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Text & Typography Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customForm.textColor}
                  onChange={(e) => setCustomForm({ ...customForm, textColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={customForm.textColor}
                  onChange={(e) => setCustomForm({ ...customForm, textColor: e.target.value })}
                  className="w-28 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-white"
                />
                <div className="flex items-center gap-1">
                  {["#1F2937", "#1A2E22", "#2D5A27", "#111827"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomForm({ ...customForm, textColor: c })}
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={`Select ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Section Content Blocks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2D6A4F]" />
                <span>Grid Content Blocks ({customForm.blocks.length})</span>
              </label>
              <span className="text-[11px] text-gray-500">
                Arrange blocks inside the chosen grid columns
              </span>
            </div>

            {/* List of Blocks */}
            <div className="space-y-3">
              {customForm.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[#2D6A4F] text-[10px] font-extrabold uppercase tracking-wider">
                        Block #{idx + 1} — {block.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveBlock(idx, "up")}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === customForm.blocks.length - 1}
                        onClick={() => handleMoveBlock(idx, "down")}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(idx)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Editor by Type */}
                  {block.type === "text" && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Badge (e.g. Botanical Guide)"
                          value={block.data.badge || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "badge", e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle (e.g. Natural purification)"
                          value={block.data.subtitle || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "subtitle", e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Block Title"
                        value={block.data.title || ""}
                        onChange={(e) => handleUpdateBlockData(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800"
                      />
                      <textarea
                        rows={3}
                        placeholder="Rich body text..."
                        value={block.data.body || ""}
                        onChange={(e) => handleUpdateBlockData(idx, "body", e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                      />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/40 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer shrink-0">
                          {uploadingBlockImageIndex === idx ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                          ) : (
                            <UploadCloud className="w-4 h-4 text-emerald-700" />
                          )}
                          <span>{uploadingBlockImageIndex === idx ? "Uploading..." : "Upload Cloudinary"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBlockImageUpload(idx, e)}
                            disabled={uploadingBlockImageIndex === idx}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste direct image URL..."
                          value={block.data.imageUrl || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "imageUrl", e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Alt description"
                          value={block.data.alt || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "alt", e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                        <input
                          type="text"
                          placeholder="Caption text (optional)"
                          value={block.data.caption || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "caption", e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                      </div>
                      {block.data.imageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                          <img src={block.data.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {block.type === "accordion" && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-gray-600">Accordion Items:</p>
                      {(block.data.accordionItems || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              placeholder="Accordion Title / Question"
                              value={item.title || ""}
                              onChange={(e) => {
                                const newItems = [...(block.data.accordionItems || [])];
                                newItems[itemIdx] = { ...newItems[itemIdx], title: e.target.value };
                                handleUpdateBlockData(idx, "accordionItems", newItems);
                              }}
                              className="w-full px-2.5 py-1 rounded-lg border border-gray-200 text-xs bg-white font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = (block.data.accordionItems || []).filter((_, i) => i !== itemIdx);
                                handleUpdateBlockData(idx, "accordionItems", newItems);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            >
                              <CloseIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Accordion content / answer..."
                            value={item.content || ""}
                            onChange={(e) => {
                              const newItems = [...(block.data.accordionItems || [])];
                              newItems[itemIdx] = { ...newItems[itemIdx], content: e.target.value };
                              handleUpdateBlockData(idx, "accordionItems", newItems);
                            }}
                            className="w-full p-2 rounded-lg border border-gray-200 text-xs bg-white"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [
                            ...(block.data.accordionItems || []),
                            { title: "New Accordion Question", content: "Detailed botanical explanation here." },
                          ];
                          handleUpdateBlockData(idx, "accordionItems", newItems);
                        }}
                        className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <PlusIcon className="w-3 h-3" /> Add Accordion Item
                      </button>
                    </div>
                  )}

                  {block.type === "button" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Button Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Shop Botanical Collection ↗"
                          value={block.data.buttonText || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "buttonText", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Destination Link</label>
                        <input
                          type="text"
                          placeholder="e.g. /#products or /?category=plant"
                          value={block.data.buttonLink || ""}
                          onChange={(e) => handleUpdateBlockData(idx, "buttonLink", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "products" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Embed Products from Category
                        </label>
                        <select
                          value={block.data.categoryId || "all"}
                          onChange={(e) => handleUpdateBlockData(idx, "categoryId", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                        >
                          <option value="all">All Store Products</option>
                          {categories.map((c) => (
                            <option key={c._id || c.slug} value={c.slug || c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Max Products Displayed
                        </label>
                        <select
                          value={block.data.limit || 4}
                          onChange={(e) => handleUpdateBlockData(idx, "limit", Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                        >
                          <option value={2}>2 Items</option>
                          <option value={4}>4 Items (Recommended)</option>
                          <option value={6}>6 Items</option>
                          <option value={8}>8 Items</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Block Toolbar */}
            <div className="p-3 rounded-2xl bg-emerald-50/40 border border-dashed border-emerald-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-emerald-900">
                + Add Block to Layout:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddBlock("text")}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2D6A4F] text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-[#2D6A4F]" /> Text
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock("image")}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2D6A4F] text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600" /> Image
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock("accordion")}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2D6A4F] text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> Accordion
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock("button")}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2D6A4F] text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Button
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock("products")}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2D6A4F] text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Products
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCustomSection || uploadingBlockImageIndex !== null}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {savingCustomSection ? "Saving…" : editingCustomSection ? "Update Custom Section" : "Publish Section to Homepage"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
