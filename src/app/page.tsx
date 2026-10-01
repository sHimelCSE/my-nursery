"use client";

// Fallback image for products whose images fail to load
const PRODUCT_FALLBACK = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import { ShoppingCartOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
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

const BADGE = {
  plant:       { bg: "bg-emerald-50  text-emerald-700 border-emerald-200",  dot: "bg-emerald-400"  },
  fertilizer:  { bg: "bg-lime-50    text-lime-700   border-lime-200",      dot: "bg-lime-400"      },
  tool:        { bg: "bg-amber-50   text-amber-700  border-amber-200",     dot: "bg-amber-400"     },
};

const STATS = [
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

const FEATURES = [
  { icon: "🌿", title: "Fresh & Healthy",   desc: "Every plant nursery-grown and quality-checked before dispatch." },
  { icon: "🚚", title: "Fast Delivery",      desc: "Same-day in Dhaka · Next-day across Bangladesh." },
  { icon: "♻️", title: "Eco-Friendly",       desc: "Sustainable packing and organically grown products only." },
  { icon: "💬", title: "Expert Support",     desc: "Free care advice from our certified horticulture team." },
];

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:   { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

const floatY = (duration = 4, amp = 10) => ({
  animate: { y: [0, -amp, 0] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" },
});

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
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

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const { message }  = App.useApp();
  const addItem      = useCartStore((s) => s.addItem);
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

  const handleAdd = () => {
    if (outOfStock || adding) return;
    setAdding(true);
    addItem(product);
    message.success({ content: `🛒 ${product.title} added to cart!`, duration: 2 });
    setTimeout(() => setAdding(false), 700);
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

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search,         setSearch]         = useState("");
  const [query,          setQuery]          = useState("");

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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, query]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => { e.preventDefault(); setQuery(search); };
  const resetFilters = () => { setSearch(""); setQuery(""); setActiveCategory("all"); };

  return (
    <div className="bg-[#FBFBFA]">

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F4F7F4] via-white to-[#EEF7EE]">

        {/* Decorative blobs (light) */}
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
                  Fresh Plants Delivered Daily
                </motion.span>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#1A2E22] mb-6">
                  Bring Nature{" "}
                  <span
                    className="relative inline-block"
                    style={{ color: SAGE }}
                  >
                    to Your Home
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9C60 3 140 3 298 9" stroke="#B7E4C7" strokeWidth="3.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-[#4A5568] text-lg leading-relaxed mb-8 max-w-md">
                  Discover premium indoor plants, organic fertilizers, and professional gardening tools — hand-picked and delivered fresh across Bangladesh.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="flex flex-wrap gap-3 mb-10">
                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/25 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    🛒 Shop Plants
                  </a>
                  <Link
                    href="/products?category=tool"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-semibold text-[#2D6A4F] bg-white border-2 border-[#B7E4C7] hover:border-[#40916C] hover:bg-[#D8F3DC]/30 hover:-translate-y-0.5 shadow-sm transition-all duration-200"
                  >
                    Gardening Tools →
                  </Link>
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

              {/* Decorative floating rings */}
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

      {/* ════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
            {STATS.map(({ icon, value, label }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
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

      {/* ════════════════════════════════════════════
          PRODUCTS SECTION
      ════════════════════════════════════════════ */}
      <section id="products" className="py-20 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <FadeUp>
            <div className="text-center mb-12">
              <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                Our Collection
              </span>
              <h2 className="text-4xl font-extrabold text-[#1A2E22] mb-3 tracking-tight">
                Browse Our Products
              </h2>
              <p className="text-[#6B7280] text-base max-w-md mx-auto leading-relaxed">
                Curated plants and gardening essentials for every green thumb — beginner or expert.
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
              {CATEGORIES.map(({ key, label, emoji }) => (
                <motion.button
                  key={key}
                  id={`category-filter-${key}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    activeCategory === key
                      ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md shadow-green-900/15"
                      : "bg-white text-[#4A5568] border-gray-200 hover:border-[#40916C] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/30"
                  }`}
                >
                  <span>{emoji}</span>
                  {label}
                  {activeCategory === key && !loading && (
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

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <span className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#40916C] bg-[#D8F3DC] px-4 py-1.5 rounded-full mb-4">
                Why GreenLeaf
              </span>
              <h2 className="text-3xl font-extrabold text-[#1A2E22]">Your Trusted Green Partner</h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(45,106,79,0.10)" }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#FBFBFA] rounded-2xl p-6 border border-gray-100 text-center cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#D8F3DC] flex items-center justify-center text-3xl mx-auto mb-4">
                    {icon}
                  </div>
                  <h3 className="font-bold text-[#1A2E22] text-[15px] mb-2">{title}</h3>
                  <p className="text-[#6B7280] text-[13px] leading-relaxed">{desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOTTOM CTA BANNER
      ════════════════════════════════════════════ */}
      <FadeUp>
        <section className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] py-16 mx-4 md:mx-8 mb-8 rounded-3xl overflow-hidden relative">
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
          <div className="relative text-center px-6">
            <motion.p
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl mb-3"
            >
              🌿
            </motion.p>
            <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Go Green?</h2>
            <p className="text-[#B7E4C7] text-base mb-7 max-w-md mx-auto">
              Start your plant journey today. Over 500 varieties waiting for a new home.
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[15px] font-bold text-[#1A2E22] bg-white hover:bg-[#D8F3DC] shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              🛒 Shop Now
            </a>
          </div>
        </section>
      </FadeUp>

    </div>
  );
}
