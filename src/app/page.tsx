"use client";

// Fallback image for products whose images fail to load
const PRODUCT_FALLBACK = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
  StarFilled,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { App, Spin } from "antd";
import useCartStore from "@/lib/cartStore";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const SAGE       = "#2D6A4F";
const SAGE_MID   = "#40916C";
const SAGE_LIGHT = "#D8F3DC";
const CHARCOAL   = "#1A2E22";

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all",        label: "All Products",  emoji: "✨" },
  { key: "plant",      label: "Plants",         emoji: "🌿" },
  { key: "fertilizer", label: "Fertilizers",    emoji: "🌱" },
  { key: "tool",       label: "Tools & Pots",   emoji: "🪴" },
];

const BADGE: Record<string, { bg: string; dot: string }> = {
  plant:       { bg: "bg-emerald-50  text-emerald-700 border-emerald-200",  dot: "bg-emerald-400"  },
  fertilizer:  { bg: "bg-lime-50    text-lime-700   border-lime-200",      dot: "bg-lime-400"      },
  tool:        { bg: "bg-amber-50   text-amber-700  border-amber-200",     dot: "bg-amber-400"     },
};

const DEFAULT_STATS = [
  { icon: "🌿", value: "500+",  label: "Plant Varieties"   },
  { icon: "🚚", value: "1–2d",  label: "Fast Delivery"     },
  { icon: "😊", value: "10K+",  label: "Happy Customers"   },
  { icon: "♻️", value: "100%",  label: "Organic Products"  },
];

const PREVIEW_CARDS = [
  { emoji: "🌿", name: "Monstera Deliciosa", price: "৳850",  tag: "Bestseller", rotate: "-rotate-2",  delay: 0.1  },
  { emoji: "🌸", name: "Rose Plant",          price: "৳450",  tag: "Popular",    rotate: "rotate-1",   delay: 0.25 },
  { emoji: "🪴", name: "Ceramic Planter",     price: "৳290",  tag: "New Arrival",rotate: "rotate-3",   delay: 0.4  },
];

const DEFAULT_FEATURES = [
  { icon: "🌿", title: "Fresh & Healthy",   desc: "Every plant nursery-grown and quality-checked before dispatch." },
  { icon: "🚚", title: "Fast Delivery",      desc: "Same-day in Dhaka · Next-day across Bangladesh." },
  { icon: "♻️", title: "Eco-Friendly",       desc: "Sustainable packing and organically grown products only." },
  { icon: "💬", title: "Expert Support",     desc: "Free care advice from our certified horticulture team." },
];

const DEFAULT_FAQS = [
  {
    q: "How do you pack live plants for courier delivery?",
    a: "Every plant is placed in custom breathable, shock-absorbing plant cradles with root moisture wraps to guarantee they arrive fresh and undamaged.",
  },
  {
    q: "Can I pay Cash on Delivery (COD)?",
    a: "Yes! We accept Cash on Delivery all across Bangladesh. You can inspect the package upon arrival and pay the delivery agent directly.",
  },
  {
    q: "What is your 48-Hour Plant Replacement Policy?",
    a: "If any plant arrives wilted or damaged during courier transit, simply send us an unboxing photo within 48 hours on WhatsApp, and we will dispatch a free replacement immediately.",
  },
  {
    q: "Do you offer doorstep gardening consultation?",
    a: "Yes, our certified horticulturists provide free plant care guidance over WhatsApp and phone for all orders placed through GreenLeaf.",
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    name: "Dr. Farhana Yasmin",
    role: "Uttara, Dhaka",
    review: "Received my Monstera and Snake plants in pristine condition. The eco-packaging was extraordinary. Truly the best nursery in Bangladesh!",
    rating: 5,
    avatar: "👩‍⚕️",
  },
  {
    name: "Tanvir Ahmed",
    role: "Chittagong",
    review: "100% organic vermicompost made a noticeable difference to my rooftop garden within 2 weeks. Fast delivery and reliable customer care.",
    rating: 5,
    avatar: "👨‍💻",
  },
  {
    name: "Sadia Chowdhury",
    role: "Sylhet",
    review: "The ceramic planters and blooming rose plants exceeded my expectations. GreenLeaf is now my go-to store for all botanical needs.",
    rating: 5,
    avatar: "🌿",
  },
];

const DEFAULT_SECTIONS = [
  {
    _id: "default-hero",
    sectionType: "hero",
    title: "Bring Nature to Your Home",
    subtitle: "Discover premium indoor plants, organic fertilizers, and professional gardening tools — hand-picked and delivered fresh across Bangladesh.",
    content: {
      badgeText: "Fresh Plants Delivered Daily",
      buttonText: "🛒 Shop Plants",
      buttonLink: "#products",
      secondaryButtonText: "Gardening Tools →",
      secondaryButtonLink: "/products?category=tool",
    },
    order: 0,
    isActive: true,
  },
  {
    _id: "default-categories",
    sectionType: "categories",
    title: "GreenLeaf at a Glance",
    subtitle: "Trusted by plant parents in all 64 districts",
    content: {
      items: DEFAULT_STATS,
    },
    order: 1,
    isActive: true,
  },
  {
    _id: "default-products",
    sectionType: "products",
    title: "Browse Our Products",
    subtitle: "Curated plants and gardening essentials for every green thumb — beginner or expert.",
    content: {
      badgeText: "Our Collection",
    },
    order: 2,
    isActive: true,
  },
  {
    _id: "default-features",
    sectionType: "features",
    title: "Your Trusted Green Partner",
    subtitle: "Why plant lovers across Bangladesh choose GreenLeaf Nursery",
    content: {
      badgeText: "Why GreenLeaf",
      items: DEFAULT_FEATURES,
    },
    order: 3,
    isActive: true,
  },
  {
    _id: "default-promo",
    sectionType: "promo_banner",
    title: "Ready to Go Green?",
    subtitle: "Start your plant journey today. Over 500 varieties waiting for a new home.",
    content: {
      badgeText: "🌿 Special Promotion",
      buttonText: "🛒 Shop Now",
      buttonLink: "#products",
    },
    order: 4,
    isActive: true,
  },
  {
    _id: "default-faq",
    sectionType: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about ordering live plants and fertilizers online.",
    content: {
      badgeText: "Help & Guidance",
      items: DEFAULT_FAQS,
    },
    order: 5,
    isActive: true,
  },
];

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:   { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any, delay },
});

const floatY = (duration = 4, amp = 10) => ({
  animate: { y: [0, -amp, 0] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" as any },
});

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} {...fadeUp(delay)}>
      {children}
    </motion.div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-br from-[#F4F7F4] to-[#D8F3DC]/30" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="flex justify-between items-center pt-3">
          <div className="h-7 bg-green-100 rounded-lg w-20" />
          <div className="h-9 bg-green-100 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: any; index: number }) {
  const { message }  = App.useApp();
  const addItem      = useCartStore((s) => s.addItem);
  const openCart     = useCartStore((s) => s.openCart);
  const [adding, setAdding] = useState(false);

  const outOfStock = product.stock_quantity === 0;
  const lowStock   = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const badge      = BADGE[product.category] || { bg: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };

  const stockLabel = outOfStock ? "Out of Stock" : lowStock ? `Only ${product.stock_quantity} left` : "In Stock";
  const stockStyle = outOfStock
    ? "bg-red-50 text-red-500 border-red-200"
    : lowStock
    ? "bg-orange-50 text-orange-500 border-orange-200"
    : "bg-emerald-50 text-emerald-600 border-emerald-200";

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (outOfStock || adding) return;
    setAdding(true);

    addItem({
      _id: product._id || product.id,
      title: product.title,
      price: product.price,
      images: product.images || (product.image ? [product.image] : []),
      image: product.images?.[0] || product.image || "",
      quantity: 1,
    });

    message.success({ content: `🛒 ${product.title} added to cart!`, duration: 2 });
    openCart();
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
      className="group bg-white rounded-3xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-green-900/10 hover:-translate-y-2 transition-all duration-400 ease-out flex flex-col"
    >
      {/* Image */}
      <Link
        href={`/products/${product._id}`}
        className="block relative overflow-hidden bg-gradient-to-br from-[#F4F7F4] to-[#D8F3DC]/40 aspect-[4/3] cursor-pointer"
      >
        <img
          src={product.images?.[0] || PRODUCT_FALLBACK}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PRODUCT_FALLBACK; }}
        />

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E22]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category pill */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm bg-white/80 ${badge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          <span className="capitalize">{product.category}</span>
        </div>

        {/* Stock pill */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm bg-white/80 ${stockStyle}`}>
          {stockLabel}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/products/${product._id}`} className="block">
          <h3 className="font-bold text-[#1A2E22] text-[15px] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#2D6A4F] transition-colors duration-200">
            {product.title}
          </h3>
        </Link>
        <p className="text-[#6B7280] text-[13px] leading-relaxed line-clamp-2 flex-1 mb-3">
          {product.description}
        </p>

        {/* Care tip */}
        {product.care_instructions && (
          <div className="flex items-start gap-1.5 bg-[#F4F7F4] rounded-xl px-3 py-2 mb-4">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-[12px] text-[#40916C] font-medium line-clamp-1 leading-relaxed">
              {product.care_instructions.slice(0, 55)}…
            </p>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-50">
          <div>
            <span className="text-[22px] font-extrabold text-[#2D6A4F] leading-none">৳{product.price.toLocaleString()}</span>
          </div>
          <motion.button
            id={`add-to-cart-${product._id}`}
            whileTap={{ scale: 0.94 }}
            onClick={handleAdd}
            disabled={outOfStock || adding}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 shadow-sm ${
              outOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : adding
                ? "bg-[#40916C]/80 cursor-wait"
                : "bg-[#2D6A4F] hover:bg-[#40916C] hover:shadow-md hover:shadow-green-300/40"
            }`}
          >
            {adding ? <Spin size="small" /> : <ShoppingCartOutlined />}
            <span>{adding ? "Adding…" : "Add to Cart"}</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── FAQ Accordion Subcomponent ────────────────────────────────────────────────
function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-emerald-300 shadow-md shadow-emerald-950/5"
                : "bg-white/80 border-emerald-100/80 hover:border-emerald-200 hover:bg-white"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-[#1A2E22] text-sm sm:text-base cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                  isOpen ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800"
                }`}>
                  Q{index + 1}
                </span>
                <span>{item.q}</span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-400"
              >
                <DownOutlined />
              </motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-emerald-50">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Testimonials Grid Subcomponent ────────────────────────────────────────────
function TestimonialsGrid({ items }: { items: Array<any> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((t, idx) => (
        <FadeUp key={idx} delay={idx * 0.1}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100/70 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                  <StarFilled key={s} />
                ))}
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic mb-6">
                &ldquo;{t.review}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-emerald-50">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-lg shrink-0">
                {t.avatar || "🌱"}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t.name}</h4>
                <p className="text-[11px] text-emerald-700 font-medium">{t.role || "Verified Plant Parent"}</p>
              </div>
            </div>
          </div>
        </FadeUp>
      ))}
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [sections,       setSections]       = useState<any[]>(DEFAULT_SECTIONS);
  const [products,       setProducts]       = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search,         setSearch]         = useState("");
  const [query,          setQuery]          = useState("");

  // Fetch dynamic sections from /api/admin/sections
  useEffect(() => {
    fetch("/api/admin/sections")
      .then((res) => res.json())
      .then((data) => {
        const sec = data.sections || data.data;
        if (data.success && Array.isArray(sec) && sec.length > 0) {
          // Sort by order ascending
          const sorted = [...sec].sort((a, b) => (a.order || 0) - (b.order || 0));
          setSections(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (query.trim())             params.set("search",   query.trim());
      const res  = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load products");
      setProducts(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, query]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setQuery(search); };
  const resetFilters = () => { setSearch(""); setQuery(""); setActiveCategory("all"); };

  // ─── Dynamic Section Renderer ───────────────────────────────────────────────
  const renderSection = (section: any) => {
    const key = section._id || section.sectionType;
    const { sectionType, title, subtitle, content = {} } = section;

    switch (sectionType) {
      // 1. HERO SECTION
      case "hero": {
        const badgeText = content.badgeText || "Fresh Plants Delivered Daily";
        const btnText = content.buttonText || "🛒 Shop Plants";
        const btnLink = content.buttonLink || "#products";
        const secBtnText = content.secondaryButtonText || "Gardening Tools →";
        const secBtnLink = content.secondaryButtonLink || "/products?category=tool";

        return (
          <section key={key} className="relative overflow-hidden bg-gradient-to-br from-[#F4F7F4] via-white to-[#EEF7EE]">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#D8F3DC]/50 rounded-full blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#B7E4C7]/30 rounded-full blur-[80px]" />

            {/* Floating leaf accents */}
            <motion.div {...floatY(5, 14)} className="pointer-events-none absolute top-16 left-[8%] text-4xl opacity-30 select-none hidden lg:block">🍃</motion.div>
            <motion.div {...floatY(6, 10)} style={{ animationDelay: "1s" }} className="pointer-events-none absolute bottom-24 right-[6%] text-5xl opacity-20 select-none hidden lg:block">🌿</motion.div>
            <motion.div {...floatY(4, 8)}  style={{ animationDelay: "2s" }} className="pointer-events-none absolute top-1/3 left-[3%] text-3xl opacity-25 select-none hidden xl:block">🌱</motion.div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Copy */}
                <div>
                  <FadeUp delay={0}>
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex items-center gap-2 bg-[#D8F3DC] text-[#2D6A4F] text-[12px] font-bold tracking-wide uppercase px-4 py-1.5 rounded-full mb-6 border border-[#B7E4C7]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#40916C] animate-pulse" />
                      {badgeText}
                    </motion.span>
                  </FadeUp>

                  <FadeUp delay={0.1}>
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#1A2E22] mb-6">
                      {title || "Bring Nature Into Your Living Space"}
                    </h1>
                  </FadeUp>

                  <FadeUp delay={0.2}>
                    <p className="text-[#4A5568] text-lg leading-relaxed mb-8 max-w-md">
                      {subtitle || "Discover premium indoor plants, organic fertilizers, and professional gardening tools — hand-picked and delivered fresh across Bangladesh."}
                    </p>
                  </FadeUp>

                  <FadeUp delay={0.3}>
                    <div className="flex flex-wrap gap-3 mb-10">
                      <a
                        href={btnLink}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/25 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {btnText}
                      </a>
                      {secBtnText && (
                        <Link
                          href={secBtnLink}
                          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-semibold text-[#2D6A4F] bg-white border-2 border-[#B7E4C7] hover:border-[#40916C] hover:bg-[#D8F3DC]/30 hover:-translate-y-0.5 shadow-sm transition-all duration-200"
                        >
                          {secBtnText}
                        </Link>
                      )}
                    </div>
                  </FadeUp>

                  {/* Trust badges */}
                  <FadeUp delay={0.4}>
                    <div className="flex flex-wrap gap-4">
                      {["🔒 Secure Checkout", "🚚 Free Delivery ৳1000+", "🌿 100% Organic"].map((badge) => (
                        <span key={badge} className="flex items-center gap-1.5 text-[12px] font-medium text-[#4A5568]">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </FadeUp>
                </div>

                {/* Right: Floating preview cards */}
                <div className="relative h-[440px] hidden lg:block">
                  {PREVIEW_CARDS.map(({ emoji, name, price, tag, rotate, delay }, i) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 40, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
                      style={{ top: `${i * 28}%`, left: i === 1 ? "30%" : i === 2 ? "55%" : "5%" }}
                      className={`absolute ${rotate}`}
                    >
                      <motion.div
                        animate={{ y: [0, i % 2 === 0 ? -10 : -7, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                        className="bg-white rounded-2xl shadow-xl shadow-green-900/10 border border-gray-100 p-4 w-48 hover:scale-105 transition-transform duration-300 cursor-default"
                      >
                        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#D8F3DC] to-[#F4F7F4] flex items-center justify-center text-4xl mb-3">
                          {emoji}
                        </div>
                        <span className="inline-block text-[10px] font-bold text-[#40916C] bg-[#D8F3DC] px-2 py-0.5 rounded-full mb-1.5">
                          {tag}
                        </span>
                        <p className="text-[#1A2E22] font-bold text-[13px] leading-tight">{name}</p>
                        <p className="text-[#2D6A4F] font-extrabold text-base mt-1">{price}</p>
                      </motion.div>
                    </motion.div>
                  ))}

                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-dashed border-[#B7E4C7] rounded-full pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 border border-[#D8F3DC] rounded-full pointer-events-none" />
                </div>
              </div>
            </div>
          </section>
        );
      }

      // 2. STATS & CATEGORIES BAR
      case "categories": {
        const items = content.items && content.items.length > 0 ? content.items : DEFAULT_STATS;
        return (
          <section key={key} className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
                {items.map(({ icon, value, label }: any, i: number) => (
                  <FadeUp key={`${label}-${i}`} delay={i * 0.08}>
                    <div className="flex flex-col items-center text-center px-4">
                      <span className="text-2xl mb-1">{icon}</span>
                      <span className="text-2xl font-extrabold text-[#1A2E22]">{value}</span>
                      <span className="text-[12px] text-[#6B7280] font-medium">{label}</span>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // 3. PRODUCTS CATALOG
      case "products": {
        const badgeText = content.badgeText || "Our Collection";
        return (
          <section key={key} id="products" className="py-20 bg-[#FBFBFA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <FadeUp>
                <div className="text-center mb-12">
                  <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                    {badgeText}
                  </span>
                  <h2 className="text-4xl font-extrabold text-[#1A2E22] mb-3 tracking-tight">
                    {title || "Browse Our Products"}
                  </h2>
                  <p className="text-[#6B7280] text-base max-w-md mx-auto leading-relaxed">
                    {subtitle || "Curated plants and gardening essentials for every green thumb — beginner or expert."}
                  </p>
                </div>
              </FadeUp>

              {/* Search */}
              <FadeUp delay={0.1}>
                <form onSubmit={handleSearch} className="flex gap-2.5 max-w-lg mx-auto mb-8">
                  <div className="relative flex-1">
                    <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base" />
                    <input
                      id="product-search-input"
                      type="text"
                      placeholder="Search plants, tools, fertilizers…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]/40 focus:border-[#40916C] shadow-sm transition-all"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#2D6A4F] text-white font-semibold text-sm hover:bg-[#40916C] shadow-sm transition-all duration-200"
                  >
                    Search
                  </motion.button>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={() => { setSearch(""); setQuery(""); }}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 text-sm transition-all"
                    >
                      ✕
                    </motion.button>
                  )}
                </form>
              </FadeUp>

              {/* Category tabs */}
              <FadeUp delay={0.15}>
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {CATEGORIES.map(({ key: catKey, label, emoji }) => (
                    <motion.button
                      key={catKey}
                      id={`category-filter-${catKey}`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCategory(catKey)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                        activeCategory === catKey
                          ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md shadow-green-900/15"
                          : "bg-white text-[#4A5568] border-gray-200 hover:border-[#40916C] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/30"
                      }`}
                    >
                      <span>{emoji}</span>
                      {label}
                      {activeCategory === catKey && !loading && (
                        <span className="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                          {products.length}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </FadeUp>

              {/* Active filter info */}
              <AnimatePresence>
                {(query || activeCategory !== "all") && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mb-6 text-sm text-[#6B7280]"
                  >
                    <span>{products.length} result{products.length !== 1 ? "s" : ""}</span>
                    {query && <span className="bg-[#D8F3DC] text-[#2D6A4F] font-semibold px-2.5 py-0.5 rounded-full text-xs">"{query}"</span>}
                    {activeCategory !== "all" && <span className="bg-[#D8F3DC] text-[#2D6A4F] font-semibold px-2.5 py-0.5 rounded-full text-xs capitalize">{activeCategory}</span>}
                    <button onClick={resetFilters} className="ml-1 text-[#40916C] font-semibold hover:underline text-xs">Clear all</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid */}
              {error ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                  <p className="text-5xl mb-4">⚠️</p>
                  <h3 className="text-lg font-bold text-[#1A2E22] mb-2">Couldn't load products</h3>
                  <p className="text-[#6B7280] text-sm mb-2 max-w-sm mx-auto">{error}</p>
                  <p className="text-[#6B7280] text-xs mb-6 max-w-sm mx-auto">
                    Make sure MongoDB is connected and the database is seeded via{" "}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#2D6A4F]">/api/seed</code>
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchProducts}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#40916C] transition-all"
                  >
                    <ReloadOutlined /> Try Again
                  </motion.button>
                </motion.div>
              ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                  <p className="text-6xl mb-4">🌵</p>
                  <h3 className="text-xl font-bold text-[#1A2E22] mb-2">No products found</h3>
                  <p className="text-[#6B7280] text-sm mb-6">
                    {query ? `No results for "${query}".` : "Nothing in this category yet."}
                  </p>
                  <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#40916C] transition-all">
                    View All Products
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      }

      // 4. WHY CHOOSE US (FEATURES)
      case "features": {
        const badgeText = content.badgeText || "Why GreenLeaf";
        const items = content.items && content.items.length > 0 ? content.items : DEFAULT_FEATURES;
        return (
          <section key={key} className="bg-white border-t border-gray-100 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeUp>
                <div className="text-center mb-12">
                  <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                    {badgeText}
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#1A2E22]">
                    {title || "Your Trusted Green Partner"}
                  </h2>
                  {subtitle && (
                    <p className="text-[#6B7280] text-sm mt-2 max-w-md mx-auto">{subtitle}</p>
                  )}
                </div>
              </FadeUp>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map(({ icon, title: fTitle, desc }: any, i: number) => (
                  <FadeUp key={`${fTitle}-${i}`} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(45,106,79,0.10)" }}
                      transition={{ duration: 0.25 }}
                      className="bg-[#FBFBFA] rounded-2xl p-6 border border-gray-100 text-center cursor-default"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#D8F3DC] flex items-center justify-center text-3xl mx-auto mb-4">
                        {icon}
                      </div>
                      <h3 className="font-bold text-[#1A2E22] text-[15px] mb-2">{fTitle}</h3>
                      <p className="text-[#6B7280] text-[13px] leading-relaxed">{desc}</p>
                    </motion.div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // 5. PROMO OFFER BANNER
      case "promo_banner": {
        const badgeText = content.badgeText || "🌿 Special Offer";
        const btnText = content.buttonText || "Shop Now ↗";
        const btnLink = content.buttonLink || "#products";

        return (
          <FadeUp key={key}>
            <section className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] py-16 mx-4 md:mx-8 my-8 rounded-3xl overflow-hidden relative shadow-lg shadow-emerald-950/15">
              <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
              <div className="relative text-center px-6 max-w-2xl mx-auto">
                <motion.p
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-3xl mb-3"
                >
                  🌿
                </motion.p>
                {badgeText && (
                  <span className="inline-block bg-white/15 text-emerald-200 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    {badgeText}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                  {title || "Ready to Go Green?"}
                </h2>
                <p className="text-[#B7E4C7] text-base mb-7 leading-relaxed">
                  {subtitle || "Start your plant journey today. Over 500 varieties waiting for a new home."}
                </p>
                <a
                  href={btnLink}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[15px] font-bold text-[#1A2E22] bg-white hover:bg-[#D8F3DC] shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {btnText}
                </a>
              </div>
            </section>
          </FadeUp>
        );
      }

      // 6. FAQ ACCORDION
      case "faq": {
        const badgeText = content.badgeText || "Help & Guidance";
        const items = content.items && content.items.length > 0 ? content.items : DEFAULT_FAQS;

        return (
          <section key={key} className="py-20 bg-[#FAFBF9] border-t border-emerald-100/60">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeUp>
                <div className="text-center mb-12">
                  <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                    {badgeText}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2E22]">
                    {title || "Frequently Asked Questions"}
                  </h2>
                  {subtitle && (
                    <p className="text-slate-600 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <FaqAccordion items={items} />
              </FadeUp>
            </div>
          </section>
        );
      }

      // 7. TESTIMONIALS / REVIEWS
      case "testimonials": {
        const badgeText = content.badgeText || "Customer Stories";
        const items = content.items && content.items.length > 0 ? content.items : DEFAULT_TESTIMONIALS;

        return (
          <section key={key} className="py-20 bg-white border-t border-emerald-100/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeUp>
                <div className="text-center mb-12">
                  <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                    {badgeText}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2E22]">
                    {title || "Loved by Plant Lovers Across Bangladesh"}
                  </h2>
                  {subtitle && (
                    <p className="text-slate-600 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
              </FadeUp>

              <TestimonialsGrid items={items} />
            </div>
          </section>
        );
      }

      // 8. CUSTOM BANNER
      case "custom_banner": {
        const badgeText = content.badgeText;
        const btnText = content.buttonText || "Learn More";
        const btnLink = content.buttonLink || "/";
        const imageUrl = content.imageUrl;

        return (
          <FadeUp key={key}>
            <section className="mx-4 md:mx-8 my-8 rounded-3xl overflow-hidden bg-white border border-emerald-100/80 shadow-md p-8 md:p-12 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                <div>
                  {badgeText && (
                    <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                      {badgeText}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                    {title}
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-6">
                    {subtitle}
                  </p>
                  {btnText && (
                    <Link
                      href={btnLink}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D6A4F] text-white font-bold text-sm hover:bg-[#1B4332] shadow-md transition-all"
                    >
                      {btnText} <ArrowRightOutlined />
                    </Link>
                  )}
                </div>
                {imageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-inner aspect-[16/10] bg-emerald-50">
                    <img
                      src={imageUrl}
                      alt={title || "Banner"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = PRODUCT_FALLBACK; }}
                    />
                  </div>
                )}
              </div>
            </section>
          </FadeUp>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FBFBFA]">
      {sections.map((section) => renderSection(section))}
    </div>
  );
}
