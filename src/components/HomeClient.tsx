"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DynamicGridSection from "@/components/DynamicGridSection";
import HeroSection from "@/components/HeroSection";
import HeroSlider from "@/components/HeroSlider";
import BotanicalCategorySection from "@/components/BotanicalCategorySection";
import BotanicalDealsSection from "@/components/BotanicalDealsSection";
import TopRankingsSection from "@/components/TopRankingsSection";
import GuaranteeStripSection from "@/components/GuaranteeStripSection";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";
import ProductCard from "@/components/ProductCard";
import SafeImage from "@/components/SafeImage";
import {
  ShoppingBag,
  ArrowRight,
  Sprout,
  Clock,
  Send,
  X,
  Calendar,
  Timer,
  Star,
  Heart,
  Loader2,
} from "lucide-react";
import { App } from "antd";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";

const PRODUCT_FALLBACK = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";
const SNAKE_PLANT_FALLBACK = "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=600&q=80";

const getSafeProductImage = (product: any) => {
  const title = (product?.title || "").toLowerCase();
  const raw = product?.images?.[0] || product?.image;
  if (title.includes("snake") || title.includes("sansevieria")) {
    if (!raw || raw.includes("photo-1598880940371-c756e015fdef")) {
      return SNAKE_PLANT_FALLBACK;
    }
  }
  return raw || PRODUCT_FALLBACK;
};

const getFallbackFor = (product: any) => {
  const t = (product?.title || "").toLowerCase();
  return t.includes("snake") || t.includes("sansevieria") ? SNAKE_PLANT_FALLBACK : PRODUCT_FALLBACK;
};

// Deterministic discount values (no randomness => no hydration mismatch)
const DISCOUNTS = [15, 10, 15, 10, 15, 10];

const DEAL_PLACEHOLDERS = [
  { _id: "deal-1", title: "Monstera Deliciosa", price: 850, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80" },
  { _id: "deal-2", title: "Rose Queen", price: 450, image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80" },
  { _id: "deal-3", title: "Peace Lily", price: 380, image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&q=80" },
  { _id: "deal-4", title: "Snake Plant", price: 320, image: SNAKE_PLANT_FALLBACK },
];

const TABS = [
  { id: "all", label: "All Plants" },
  { id: "new", label: "New Arrivals" },
  { id: "best", label: "Best Sellers" },
] as const;

// ─── Plant Care Guides / Blog ────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Keep Indoor Plants Thriving: Light, Water & Humidity Secrets",
    excerpt: "Mastering seasonal indoor humidity, proper soil drainage, and preventing overwatering in apartment living.",
    author: "Dr. Farhana Yasmin",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80",
    category: "Indoor Care",
  },
  {
    id: 2,
    title: "Common Soil Pests and Organic Solutions for Rooftop Gardeners",
    excerpt: "Combat aphids, mealybugs, and fungus gnats naturally using organic neem spray and vermicompost tea.",
    author: "Tanvir Ahmed",
    date: "Oct 04, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    category: "Organic Pest Control",
  },
  {
    id: 3,
    title: "A Beginner’s Guide to Water Propagation in Handcrafted Ceramic Vessels",
    excerpt: "Step-by-step methods to root pothos, monstera, and snake plants in clean water before planting in rich soil.",
    author: "Sadia Chowdhury",
    date: "Sep 28, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
    category: "Propagation",
  },
];

export default function HomeClient() {
  const { message } = App.useApp();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);

  const searchParams = useSearchParams();
  const urlCategory = searchParams ? searchParams.get("category") : null;
  const urlSearch = searchParams ? searchParams.get("search") : null;

  const [mounted, setMounted] = useState(false);
  const [homepageConfig, setHomepageConfig] = useState<any>(DEFAULT_HOMEPAGE_CONFIG);
  const [products, setProducts] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic homepage config
  const fetchHomepageConfig = useCallback(() => {
    fetch("/api/homepage-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setHomepageConfig(data.config);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchHomepageConfig();
    const handleUpdate = () => fetchHomepageConfig();
    window.addEventListener("homepageSectionsUpdated", handleUpdate);
    return () => window.removeEventListener("homepageSectionsUpdated", handleUpdate);
  }, [fetchHomepageConfig]);

  // Sync category & search from URL query parameters
  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory.toLowerCase());
      const el = document.getElementById("new-arrivals") || document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    if (urlSearch) {
      setQuery(urlSearch);
      const el = document.getElementById("new-arrivals") || document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [urlCategory, urlSearch]);

  const fetchSections = useCallback(() => {
    fetch("/api/admin/sections")
      .then((res) => res.json())
      .then((data) => {
        const list = data.sections || data.data;
        if (data.success && Array.isArray(list)) {
          setSections(list);
          setCustomSections(
            list.filter(
              (s: any) =>
                s.sectionType === "custom_grid" &&
                s.enabled !== false &&
                s.isActive !== false
            )
          );
        }
      })
      .catch(() => { });
  }, []);

  // Fetch custom page sections (Page Builder)
  useEffect(() => {
    fetchSections();
    const handleUpdate = () => fetchSections();
    window.addEventListener("homepageSectionsUpdated", handleUpdate);
    return () => window.removeEventListener("homepageSectionsUpdated", handleUpdate);
  }, [fetchSections]);

  // ─── Real-Time Countdown Timer ──────────────────────────────────────────────
  // Initial state is static so server and client markup always match.
  const [timeLeft, setTimeLeft] = useState({
    days: "02",
    hours: "13",
    minutes: "54",
    seconds: "13",
  });

  useEffect(() => {
    const rawTarget = homepageConfig?.dealsSection?.countdownEndDate;
    const targetDate = rawTarget
      ? new Date(rawTarget)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [homepageConfig?.dealsSection?.countdownEndDate]);

  // ─── Product Data Fetching ──────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (query.trim()) params.set("search", query.trim());
      const res = await fetch(`/api/products?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch {
      // fallback safe
    } finally {
      setLoading(false);
    }
  }, [activeCategory, query]);

  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error fetching homepage categories:", err));
  }, []);

  useEffect(() => {
    fetch("/api/blogs?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
          setLatestBlogs(data.blogs);
        }
      })
      .catch((err) => console.error("Error fetching homepage blogs:", err));
  }, []);

  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    addItem({
      _id: product._id || product.id,
      title: product.title,
      price: product.price,
      images: product.images || (product.image ? [product.image] : []),
      image: product.images?.[0] || product.image || PRODUCT_FALLBACK,
      quantity: 1,
    });
    message.success({ content: `${product.title} added to cart!`, duration: 2 });
    openCart();
  };

  const toggleWishlist = (product: any) => {
    if (!product) return;
    toggleWishlistStore(product);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail) return;

    try {
      setSubscribing(true);
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, source: "homepage" }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.isExisting) {
          message.info({
            content: data.message || "You are already a subscriber to our newsletter!",
            duration: 3,
          });
        } else {
          message.success({
            content: data.message || "Welcome! Thank you for subscribing.",
            duration: 3,
          });
        }
        setNewsletterEmail("");
      } else {
        message.error({
          content: data.message || "Failed to subscribe. Please try again.",
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      message.error({
        content: "Network error. Please try again later.",
        duration: 3,
      });
    } finally {
      setSubscribing(false);
    }
  };

  // ─── Derived datasets ───────────────────────────────────────────────────────
  const dealsProducts = products.length > 0 ? products.slice(0, 4) : DEAL_PLACEHOLDERS;

  const gridProducts = (() => {
    const list = [...products];
    if (activeTab === "new") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } else if (activeTab === "best") {
      list.sort((a, b) => {
        const salesA = a.sold ?? a.salesCount ?? 0;
        const salesB = b.sold ?? b.salesCount ?? 0;
        if (salesB !== salesA) return salesB - salesA;
        const ratingA = a.averageRating ?? a.rating ?? 0;
        const ratingB = b.averageRating ?? b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        const reviewsA = a.reviewCount ?? a.numReviews ?? 0;
        const reviewsB = b.reviewCount ?? b.numReviews ?? 0;
        return reviewsB - reviewsA;
      });
    }
    return list.slice(0, 6);
  })();

  const scrollToProducts = (slug: string) => {
    setActiveCategory(slug);
    const el = document.getElementById("new-arrivals") || document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const sectionHidden = (type: string) => {
    const sec = sections.find((s) => s.sectionType === type);
    return !!sec && (sec.isActive === false || sec.enabled === false);
  };
  const heroSec = sections.find((s) => s.sectionType === "hero");
  const catSec = sections.find((s) => s.sectionType === "categories");

  return (
    <div className="bg-[#F7F8F4] min-h-screen text-[#1C2B1E]">
      {/* ─── 1. Hero Slider ───────────────────────────────────────────────── */}
      {homepageConfig?.heroSlider?.isEnabled !== false && !sectionHidden("hero") && (
        <HeroSlider data={homepageConfig?.heroSlider} section={heroSec} />
      )}

      {/* ─── 2. Shop by Category + Perks ───────────────────────────────────── */}
      {homepageConfig?.categoriesSection?.isEnabled !== false && !sectionHidden("categories") && (
        <BotanicalCategorySection
          data={homepageConfig?.categoriesSection}
          categories={categories}
          section={catSec}
          onSelectCategory={scrollToProducts}
        />
      )}

      {/* ─── 3. Botanical Deals ────────────────────────────────────────────── */}
      {homepageConfig?.dealsSection?.isEnabled !== false && (
        <BotanicalDealsSection
          data={homepageConfig?.dealsSection}
          fallbackProducts={products.slice(0, 8)}
          onOpenQuickView={(product: any) =>
            setQuickViewProduct({
              ...product,
              description: product.description || "Botanical specimen",
              stock_quantity: product.stock_quantity ?? product.stock ?? 10,
            })
          }
        />
      )}

      {/* ─── 4. Dual Promotional Banners ───────────────────────────────────── */}
      {homepageConfig?.promoBanners?.isEnabled !== false && (
        <section id="promo-banners" className="section-promo-banners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {/* Banner 1 — dark */}
            <div className="relative overflow-hidden bg-[#1E3F20] text-white rounded-3xl p-8 min-h-[280px] flex">
              <div className="relative z-10 flex flex-col justify-between max-w-[54%] gap-6">
                <div className="space-y-3">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    {homepageConfig?.promoBanners?.banner1?.badge || "Special Collection"}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                    {homepageConfig?.promoBanners?.banner1?.title || "Indoor Succulent Kits & Modern Planters"}
                  </h3>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Hand-poured ceramic vessels with drought-hardy succulents, ready to display.
                  </p>
                </div>
                <Link
                  href={homepageConfig?.promoBanners?.banner1?.buttonUrl || "/products?category=plant"}
                  className="self-start inline-flex items-center gap-2 bg-white text-[#1E3F20] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#EBF0E6] transition-colors cursor-pointer"
                >
                  <span>{homepageConfig?.promoBanners?.banner1?.buttonText || "Explore Kits"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute right-0 top-0 bottom-0 z-5 opacity-[0.5] w-[46%]">
                <SafeImage
                  src={homepageConfig?.promoBanners?.banner1?.imageUrl || "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=700&q=80"}
                  fallback={PRODUCT_FALLBACK}
                  alt="Succulent kit in a modern planter"
                  fill
                  sizes="(max-width: 768px) 46vw, 24vw"
                  className="object-cover rounded-l-[2rem]"
                />
              </div>
            </div>

            {/* Banner 2 — light */}
            <div className="relative overflow-hidden bg-[#F4F6EE] text-gray-900 rounded-3xl p-8 min-h-[280px] flex border border-[#E3E8DD]">
              <div className="relative z-10 flex flex-col justify-between max-w-[54%] gap-6">
                <div className="space-y-3">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5C7F57]">
                    {homepageConfig?.promoBanners?.banner2?.badge || "Soil Nutrition"}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight text-[#1C2B1E]">
                    {homepageConfig?.promoBanners?.banner2?.title || "100% Organic Soil & Earthworm Compost"}
                  </h3>
                  <p className="text-sm text-[#5A6B5C] leading-relaxed">
                    Micro-nutrient rich mixes made for strong roots and generous blooms.
                  </p>
                </div>
                <Link
                  href={homepageConfig?.promoBanners?.banner2?.buttonUrl || "/products?category=fertilizer"}
                  className="self-start inline-flex items-center gap-2 bg-[#1E3F20] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#152D17] transition-colors cursor-pointer"
                >
                  <span>{homepageConfig?.promoBanners?.banner2?.buttonText || "Shop Soil & Compost"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute right-0 top-0 bottom-0 z-5 opacity-[0.5] w-[46%]">
                <SafeImage
                  src={homepageConfig?.promoBanners?.banner2?.imageUrl || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&q=80"}
                  fallback={PRODUCT_FALLBACK}
                  alt="Scoop of organic potting soil and compost"
                  fill
                  sizes="(max-width: 768px) 46vw, 24vw"
                  className="object-cover rounded-l-[2rem]"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. New Arrivals & Bestsellers ───────────────────────────────────── */}
      {homepageConfig?.newArrivals?.isEnabled !== false && (
        <section id="new-arrivals" className="section-new-arrivals max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 scroll-mt-28">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57]">
                {homepageConfig?.newArrivals?.badge || "FRESHLY POTTED"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
                {homepageConfig?.newArrivals?.title || "New Arrivals & Bestsellers"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Product filters">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                    ? "bg-[#1E3F20] text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {(activeCategory !== "all" || query) && (
            <div className="flex items-center gap-2 mb-6 text-sm text-[#5A6B5C]">
              <span>
                Showing {activeCategory !== "all" ? <strong className="text-[#1C2B1E] capitalize">{activeCategory}</strong> : "results"}
                {query ? <> for “<strong className="text-[#1C2B1E]">{query}</strong>”</> : null}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setQuery("");
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#1E3F20] text-xs font-medium hover:bg-[#dfe7d8] cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Spotlight Banner */}
            <div className="lg:col-span-4 relative overflow-hidden rounded-3xl min-h-[480px] lg:min-h-full bg-[#1E3F20] flex flex-col justify-between p-7 group shadow-sm">
              <SafeImage
                src={homepageConfig?.newArrivals?.spotlightBanner?.imageUrl || "https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000&q=85"}
                fallback={PRODUCT_FALLBACK}
                alt={homepageConfig?.newArrivals?.spotlightBanner?.title || "Spotlight Specimen"}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* High-contrast gradient overlay ensuring 100% text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                    {homepageConfig?.newArrivals?.spotlightBanner?.badge || "FEATURED SPECIMEN"}
                  </span>
                  {homepageConfig?.newArrivals?.spotlightBanner?.price && (
                    <span className="inline-block text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/25">
                      {homepageConfig.newArrivals.spotlightBanner.price}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
                  {homepageConfig?.newArrivals?.spotlightBanner?.title || "Buy a great Coconut Bonsai"}
                </h3>
                {homepageConfig?.newArrivals?.spotlightBanner?.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed drop-shadow-sm line-clamp-3">
                    {homepageConfig.newArrivals.spotlightBanner.subtitle}
                  </p>
                )}
              </div>

              <div className="relative z-10 pt-6">
                <Link
                  href={homepageConfig?.newArrivals?.spotlightBanner?.buttonUrl || "/collections"}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-emerald-50 px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all group-hover:gap-3"
                >
                  <span>{homepageConfig?.newArrivals?.spotlightBanner?.buttonText || "Buy Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product grid with reactive tabs and smooth transition */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200/70 p-3 animate-pulse">
                      <div className="aspect-square bg-[#EBF0E6] rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 mt-4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2 mt-3" />
                    </div>
                  ))}
                </div>
              ) : gridProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/70 p-8">
                  <Sprout className="w-12 h-12 text-[#1E3F20] mx-auto mb-3" strokeWidth={1.5} />
                  <h4 className="text-base font-semibold text-[#1C2B1E]">No items found</h4>
                  <p className="text-sm text-[#5A6B5C] mt-1">Try selecting another category or tab.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5"
                  >
                    {gridProducts.map((product, idx) => {
                      const inStock = (product.stock_quantity ?? 1) > 0;
                      const hasDiscount = Boolean(product.discount && Number(product.discount) > 0);
                      const isNewArrival =
                        activeTab === "new" ||
                        Boolean(
                          product.createdAt &&
                            Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
                        );
                      const badge = hasDiscount ? "SALE" : isNewArrival ? "NEW" : idx % 2 === 0 ? "NEW" : "SALE";
                      const discountVal = hasDiscount
                        ? Number(product.discount)
                        : badge === "SALE"
                        ? DISCOUNTS[idx % DISCOUNTS.length]
                        : null;

                      return (
                        <ProductCard
                          key={product._id || product.id || idx}
                          title={product.title}
                          image={getSafeProductImage(product)}
                          fallback={getFallbackFor(product)}
                          price={product.price}
                          badge={badge}
                          discount={discountVal}
                          inStock={inStock}
                          wished={mounted ? isInWishlist(product._id || product.id) : false}
                          onToggleWishlist={() => toggleWishlist(product)}
                          onOpen={() => setQuickViewProduct(product)}
                          onAdd={(e: React.MouseEvent) => handleAddToCart(product, e)}
                        />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Dynamic Custom Grid Sections (Page Builder) ──────────────────── */}
      {customSections.map((sec) => (
        <DynamicGridSection key={sec._id || sec.id} section={sec} />
      ))}

      {/* ─── 6. Mini Top Rankings ─────────────────────────────────────────── */}
      {homepageConfig?.topRankings?.isEnabled !== false && (
        <TopRankingsSection data={homepageConfig?.topRankings} onSelectCategory={scrollToProducts} />
      )}

      {/* ─── 7. Latest Blog Guides ────────────────────────────────────────── */}
      {homepageConfig?.blogSection?.isEnabled !== false && (
        <section id="blog-guides" className="section-blog-guides max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57]">
                Knowledge Base
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
                {homepageConfig?.blogSection?.title || "Latest Plant Care Guides"}
              </h2>
              {homepageConfig?.blogSection?.subtitle && (
                <p className="text-sm text-[#5A6B5C] mt-1">
                  {homepageConfig.blogSection.subtitle}
                </p>
              )}
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3F20] border border-gray-300 bg-white px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {(latestBlogs.length > 0 ? latestBlogs : BLOG_POSTS).map((post: any) => {
              const postSlug = post.slug || `guide-${post.id}`;
              const postDate = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : (post.date || "Botanical Guide");
              const authorName = post.author?.name || post.author || "BloomCraft Botanist";
              const postImage = post.coverImage || post.image || PRODUCT_FALLBACK;

              return (
                <Link
                  key={post._id || post.id || postSlug}
                  href={`/blog/${postSlug}`}
                  className="blog-card group bg-white rounded-2xl border border-gray-200/70 p-3 hover:shadow-[0_12px_32px_-12px_rgba(28,43,30,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#EBF0E6]">
                    <SafeImage
                      src={postImage}
                      fallback={PRODUCT_FALLBACK}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-[#1E3F20] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                      {post.category || "Plant Care"}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-2.5">
                    <div className="flex items-center gap-4 text-xs text-[#5A6B5C]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {postDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {post.readTime || "5 min read"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[15px] text-[#1C2B1E] leading-snug group-hover:text-[#2D6A4F] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#5A6B5C] leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-sm">
                      <span className="text-xs font-medium text-[#5A6B5C]">{authorName}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-[#1E3F20] group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 8. Newsletter Section ─────────────────────────────────────────── */}
      {homepageConfig?.newsletter?.isEnabled !== false && (
        <section id="newsletter-section" className="section-newsletter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="relative overflow-hidden bg-[#F2F5ED] rounded-3xl p-8 md:p-12">
            <div className="relative z-10 max-w-xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57]">
                Botanical Community
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E]">
                {homepageConfig?.newsletter?.title || "Join The Botanical Society"}
              </h2>
              <p className="text-sm md:text-base text-[#5A6B5C] leading-relaxed">
                {homepageConfig?.newsletter?.subtitle || "Weekly seasonal plant-care guides, organic gardening tips and subscriber-only flash discounts, straight to your inbox."}
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 pt-1 sm:max-w-md"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 min-w-0 px-5 py-3 text-sm bg-white rounded-full border border-gray-200 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/15 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="inline-flex items-center justify-center gap-2 bg-[#1E3F20] text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[#152D17] transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <span>{subscribing ? "Subscribing..." : (homepageConfig?.newsletter?.buttonText || "Subscribe")}</span>
                  {subscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-xs text-[#5A6B5C]/80">No spam, ever. Unsubscribe at any time.</p>
            </div>

            {/* Plant accent blending into the card */}
            <div
              className="hidden md:block absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none"
              style={{
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
                maskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
              }}
              aria-hidden="true"
            >
              <SafeImage
                src={homepageConfig?.newsletter?.plantImageUrl || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=85"}
                fallback={PRODUCT_FALLBACK}
                alt=""
                fill
                sizes="(max-width: 1024px) 42vw, 520px"
                className="object-cover mix-blend-multiply"
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── 9. Pre-Footer Guarantee Strip ───────────────────────────────── */}
      {homepageConfig?.guaranteeStrip?.isEnabled !== false && (
        <GuaranteeStripSection data={homepageConfig?.guaranteeStrip} />
      )}

      {/* ─── Quick View Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-label={quickViewProduct.title}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden border border-gray-100"
            >
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close quick view"
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F2F5ED] relative">
                  <SafeImage
                    src={quickViewProduct.images?.[0] || quickViewProduct.image || PRODUCT_FALLBACK}
                    fallback={PRODUCT_FALLBACK}
                    alt={quickViewProduct.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 350px"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1E3F20] bg-[#EBF0E6] px-3 py-1 rounded-full">
                      {quickViewProduct.category || "Botanical"}
                    </span>
                    {(quickViewProduct.stock_quantity ?? 1) <= 0 && (
                      <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#1C2B1E]">{quickViewProduct.title}</h3>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-[#1E3F20]">
                    ৳{Number(quickViewProduct.price || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-[#5A6B5C] leading-relaxed">
                    {quickViewProduct.description ||
                      "Nursery cultivated specimen acclimated for healthy root development."}
                  </p>

                  {quickViewProduct.care_instructions && (
                    <div className="bg-[#F2F5ED] p-3.5 rounded-2xl text-xs text-[#1E3F20] space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5" /> Care Instructions
                      </p>
                      <p className="text-[#5A6B5C]">{quickViewProduct.care_instructions}</p>
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    {(() => {
                      const inStock = (quickViewProduct.stock_quantity ?? 1) > 0;
                      return (
                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() => {
                            if (!inStock) return;
                            handleAddToCart(quickViewProduct);
                            setQuickViewProduct(null);
                          }}
                          className={`flex-1 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors ${inStock
                            ? "bg-[#1E3F20] hover:bg-[#152D17] text-white cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{inStock ? "Add to Cart" : "Sold Out"}</span>
                        </button>
                      );
                    })()}
                    {quickViewProduct._id && !String(quickViewProduct._id).startsWith("deal-") && (
                      <Link
                        href={`/products/${quickViewProduct._id}`}
                        className="px-6 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        Details
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(quickViewProduct)}
                      aria-label="Save to Wishlist"
                      className={`w-11 h-11 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        mounted && isInWishlist(quickViewProduct._id || quickViewProduct.id)
                          ? "border-rose-200 bg-rose-50 text-rose-500 shadow-xs"
                          : "border-gray-200 bg-white text-gray-700 hover:text-rose-500 hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          mounted && isInWishlist(quickViewProduct._id || quickViewProduct.id)
                            ? "fill-rose-500 text-rose-500"
                            : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
