"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  Sprout,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";
import { App } from "antd";

const FALLBACK_DEAL_PRODUCTS = [
  {
    _id: "deal-1",
    title: "Monstera Deliciosa (Swiss Cheese)",
    price: 380,
    originalPrice: 450,
    images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80"],
    stock: 12,
    category: "plant",
  },
  {
    _id: "deal-2",
    title: "Peace Lily (Spathiphyllum)",
    price: 320,
    originalPrice: 380,
    images: ["https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&q=80"],
    stock: 8,
    category: "plant",
  },
  {
    _id: "deal-3",
    title: "Sansevieria Golden Hahnii (Snake Plant)",
    price: 260,
    originalPrice: 320,
    images: ["https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=600&q=80"],
    stock: 15,
    category: "plant",
  },
  {
    _id: "deal-4",
    title: "Ficus Retusa Bonsai Specimen",
    price: 950,
    originalPrice: 1150,
    images: ["https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=600&q=80"],
    stock: 5,
    category: "plant",
  },
  {
    _id: "deal-5",
    title: "Calathea Orbifolia Statement Foliage",
    price: 520,
    originalPrice: 620,
    images: ["https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80"],
    stock: 6,
    category: "plant",
  },
  {
    _id: "deal-6",
    title: "ZZ Plant (Zamioculcas Zamiifolia)",
    price: 410,
    originalPrice: 490,
    images: ["https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=600&q=80"],
    stock: 9,
    category: "plant",
  },
  {
    _id: "deal-7",
    title: "Premium Potted Fiddle Leaf Fig",
    price: 780,
    originalPrice: 920,
    images: ["https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80"],
    stock: 4,
    category: "plant",
  },
  {
    _id: "deal-8",
    title: "Handcrafted Glazed Ceramic Planter",
    price: 290,
    originalPrice: 350,
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80"],
    stock: 20,
    category: "tool",
  },
];

/**
 * @param {{
 *   data?: any;
 *   fallbackProducts?: any[];
 *   onOpenQuickView?: (product: any) => void;
 * }} props
 */
export default function BotanicalDealsSection({
  data,
  fallbackProducts = [],
  onOpenQuickView,
}) {
  const { message } = App.useApp();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);

  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [visibleGridCount, setVisibleGridCount] = useState(4);

  // ─── Determine active display mode ─────────────────────────────────────────
  const displayType = data?.displayType || "slider"; // 'slider' | 'grid_load_more'
  const badge = data?.badge || "LIMITED TIME";
  const title = data?.title || "Botanical Flash Deals";
  const subtitle =
    data?.subtitle ||
    "Seasonal markdowns on our healthiest, nursery-grown favourites.";
  const fallbackDiscount = Number(data?.discountPercentage) || 15;

  // ─── Extract and normalize deal products ───────────────────────────────────
  const productsList = useMemo(() => {
    const raw =
      data?.dealProducts && data.dealProducts.length > 0
        ? data.dealProducts
        : Array.isArray(data?.dealProductIds) &&
          data.dealProductIds.length > 0 &&
          typeof data.dealProductIds[0] === "object"
        ? data.dealProductIds
        : fallbackProducts.length > 0
        ? fallbackProducts
        : FALLBACK_DEAL_PRODUCTS;

    return raw.map((p, idx) => {
      const price = Number(p.price) || 0;
      const originalPrice =
        p.originalPrice || Math.round(price / (1 - fallbackDiscount / 100));
      const image =
        (Array.isArray(p.images) && p.images[0]) ||
        p.image ||
        FALLBACK_DEAL_PRODUCTS[idx % FALLBACK_DEAL_PRODUCTS.length].images[0];

      return {
        ...p,
        _id: p._id || p.id || `deal-${idx}`,
        title: p.title || "Nursery Botanical Specimen",
        price,
        originalPrice,
        image,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [image],
        stock: p.stock_quantity ?? p.stock ?? 10,
        discount: fallbackDiscount,
      };
    });
  }, [data?.dealProducts, data?.dealProductIds, fallbackProducts, fallbackDiscount]);

  // ─── Real-Time Countdown Timer ─────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState({
    days: "02",
    hours: "13",
    minutes: "45",
    seconds: "00",
  });

  useEffect(() => {
    setMounted(true);

    const rawTarget = data?.countdownEndDate;
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
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data?.countdownEndDate]);

  // ─── Responsive Slider Breakpoint Detection ────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, productsList.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // ─── Cart & Wishlist Actions ───────────────────────────────────────────────
  const handleAddToCart = (product, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    addItem({
      _id: product._id,
      title: product.title,
      price: product.price,
      images: product.images || [product.image],
      image: product.image,
      quantity: 1,
    });
    message.success({
      content: `${product.title} added to cart!`,
      duration: 2,
    });
    openCart();
  };

  const handleToggleWishlist = (product, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    toggleWishlistStore(product);
  };

  return (
    <section
      id="deals-section"
      className="section-deals max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 scroll-mt-28"
    >
      {/* ─── Header: Eyebrow, Title, Subtitle & Timer ──────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#2D6A4F] text-[11px] font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1C2B1E]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#5A6B5C] mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start lg:self-auto">
          {/* Countdown Clock */}
          {data?.showCountdown !== false && (
            <div
              className="inline-flex items-center gap-3 bg-[#1E3F20] text-white rounded-2xl px-5 py-3 shadow-sm border border-emerald-900/30"
              role="timer"
              aria-label="Deal countdown timer"
            >
              <Timer className="w-4 h-4 text-emerald-300 hidden sm:block shrink-0" />
              {[
                { v: timeLeft.days, l: "Days" },
                { v: timeLeft.hours, l: "Hrs" },
                { v: timeLeft.minutes, l: "Mins" },
                { v: timeLeft.seconds, l: "Secs" },
              ].map((unit, i) => (
                <div key={unit.l} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && (
                    <span className="text-base font-bold text-emerald-300/60 -mt-2.5">
                      :
                    </span>
                  )}
                  <div className="text-center min-w-[28px]">
                    <span
                      suppressHydrationWarning
                      className="block text-lg sm:text-xl font-bold font-mono tabular-nums leading-none"
                    >
                      {unit.v}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-emerald-200/80 mt-1">
                      {unit.l}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slider Prev / Next Controls (Only in slider mode) */}
          {displayType === "slider" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-[#1C2B1E] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-[#1C2B1E] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mode 1: Horizontal Slider ─────────────────────────────────────── */}
      {displayType === "slider" && (
        <div className="overflow-hidden -mx-2 lg:-mx-3 px-2 lg:px-3">
          <motion.div
            className="flex -mx-2 lg:-mx-3"
            animate={{
              x: `-${(currentIndex * 100) / itemsPerPage}%`,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            {productsList.map((product, idx) => (
              <div
                key={product._id || idx}
                className="shrink-0 w-full sm:w-1/2 lg:w-1/4 px-2 lg:px-3"
              >
                <ProductCard
                  product={product}
                  onOpen={() =>
                    onOpenQuickView
                      ? onOpenQuickView(product)
                      : null
                  }
                />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ─── Mode 2: Grid with Load More Button ────────────────────────────── */}
      {displayType === "grid_load_more" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence>
              {productsList.slice(0, visibleGridCount).map((product, idx) => (
                <motion.div
                  key={product._id || idx}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (idx % 4) * 0.08 }}
                >
                  <ProductCard
                    product={product}
                    onOpen={() =>
                      onOpenQuickView
                        ? onOpenQuickView(product)
                        : null
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {productsList.length > visibleGridCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleGridCount((c) => c + 4)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <span>Load More Deals</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
