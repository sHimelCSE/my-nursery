"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { App } from "antd";
import {
  ArrowLeftOutlined, ShoppingCartOutlined, CheckCircleOutlined,
  HeartOutlined, ShareAltOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, LoadingOutlined,
} from "@ant-design/icons";
import useCartStore from "@/lib/cartStore";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";

const CATEGORY_STYLES = {
  plant: {
    bg: "bg-[#D8F3DC] text-[#2D6A4F] border-[#B7E4C7]",
    label: "🌿 Living Plant",
  },
  tool: {
    bg: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]",
    label: "🛠️ Gardening Tool",
  },
  fertilizer: {
    bg: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    label: "🌱 Organic Fertilizer",
  },
};

export default function ProductDetailsPage({ params }) {
  // Unwrap async params for Next.js 16
  const { id } = use(params);
  const { message } = App.useApp();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.message || "Product not found");
        }
        setProduct(json.data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock_quantity <= 0 || adding) return;
    setAdding(true);

    // Add item with specified quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    message.success({
      content: `🛒 Added ${quantity} × ${product.title} to your cart!`,
      duration: 2.5,
    });

    openCart();
    setTimeout(() => setAdding(false), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center py-20 px-4">
        <LoadingOutlined style={{ fontSize: 36, color: "#2D6A4F" }} spin />
        <p className="mt-4 text-[#4B5563] text-sm font-medium">Loading nursery product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mb-4">
          🍃
        </div>
        <h1 className="text-2xl font-bold text-[#1A2E22] mb-2">Product Not Found</h1>
        <p className="text-[#6B7280] text-sm max-w-sm mb-6">
          We couldn't locate this plant or tool in our inventory. It may have been relocated or renamed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#40916C] transition-all"
        >
          <ArrowLeftOutlined /> Back to Nursery Shop
        </Link>
      </div>
    );
  }

  const categoryStyle = CATEGORY_STYLES[product.category] || CATEGORY_STYLES.plant;
  const inStock = product.stock_quantity > 0;
  const images = product.images && product.images.length > 0 ? product.images : [FALLBACK_IMG];

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Breadcrumb & Back Link ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#4B5563] hover:text-[#2D6A4F] text-sm font-medium transition-colors"
          >
            <ArrowLeftOutlined /> Back to Shop
          </Link>
          <span className="text-xs text-[#9CA3AF]">
            Home / {product.category} / <span className="text-[#1A2E22] font-semibold">{product.title}</span>
          </span>
        </motion.div>

        {/* ── Product Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">

          {/* ════ LEFT COLUMN: Gallery & Images ════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Main Hero Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F4F7F4] border border-gray-100 shadow-sm group">
              <img
                src={images[activeImage] || FALLBACK_IMG}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 shadow-xs ${categoryStyle.bg}`}>
                  {categoryStyle.label}
                </span>
                {inStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    ✓ In Stock ({product.stock_quantity})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-50 text-red-600 border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector (if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === idx
                        ? "border-[#2D6A4F] shadow-sm scale-102"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white border border-gray-100 text-center">
                <span className="text-xl">🌿</span>
                <p className="text-[11px] font-bold text-[#1A2E22] mt-1">100% Healthy</p>
                <p className="text-[10px] text-[#6B7280]">Inspected by Botanists</p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-gray-100 text-center">
                <span className="text-xl">🚚</span>
                <p className="text-[11px] font-bold text-[#1A2E22] mt-1">Safe Delivery</p>
                <p className="text-[10px] text-[#6B7280]">2-3 Days Nationwide</p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-gray-100 text-center">
                <span className="text-xl">💵</span>
                <p className="text-[11px] font-bold text-[#1A2E22] mt-1">Cash on Delivery</p>
                <p className="text-[10px] text-[#6B7280]">Pay at your Doorstep</p>
              </div>
            </div>
          </motion.div>

          {/* ════ RIGHT COLUMN: Details & Actions ════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A2E22] tracking-tight mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#2D6A4F]">
                  ৳{product.price.toLocaleString()}
                </span>
                <span className="text-xs text-[#6B7280]">Tax included · Delivery calculated at checkout</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h2 className="text-[14px] font-bold text-[#1A2E22] uppercase tracking-wider text-xs">
                About this {product.category}
              </h2>
              <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* ════ PLANT CARE GUIDE (For Plants) ════ */}
            {product.category === "plant" && (
              <div className="bg-gradient-to-br from-[#F4F7F4] to-[#E8F5E9]/60 rounded-3xl p-6 border border-[#C8E6C9] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪴</span>
                  <h2 className="text-[15px] font-bold text-[#1B4332]">
                    Botanical Plant Care Guide
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Sunlight */}
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#D8F3DC] shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">☀️</span>
                      <span className="text-[12px] font-bold text-[#1A2E22]">Sunlight</span>
                    </div>
                    <p className="text-[12px] text-[#4A5568] leading-tight">
                      Bright, indirect sunlight. Keep away from intense direct noon rays.
                    </p>
                  </div>

                  {/* Water */}
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#D8F3DC] shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💧</span>
                      <span className="text-[12px] font-bold text-[#1A2E22]">Water</span>
                    </div>
                    <p className="text-[12px] text-[#4A5568] leading-tight">
                      Once a week or when top 1-2 inches of soil feel dry to touch.
                    </p>
                  </div>

                  {/* Soil */}
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#D8F3DC] shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌱</span>
                      <span className="text-[12px] font-bold text-[#1A2E22]">Soil</span>
                    </div>
                    <p className="text-[12px] text-[#4A5568] leading-tight">
                      Well-draining, nutrient-rich organic potting mix with perlite.
                    </p>
                  </div>
                </div>

                {/* Specific Care Instructions from Database */}
                {product.care_instructions && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-[#D8F3DC]">
                    <p className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider mb-1">
                      Pro Care Instructions
                    </p>
                    <p className="text-[13px] text-[#2D3748] leading-relaxed italic">
                      "{product.care_instructions}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ════ Usage / Tool Tips (For non-plants) ════ */}
            {product.category !== "plant" && product.care_instructions && (
              <div className="bg-[#F8FAFC] rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <h2 className="text-[14px] font-bold text-[#1E293B] flex items-center gap-2">
                  <span>💡</span> Usage & Storage Guidelines
                </h2>
                <p className="text-[13px] text-[#475569] leading-relaxed">
                  {product.care_instructions}
                </p>
              </div>
            )}

            {/* ════ Quantity Selector + Add to Cart ════ */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A2E22]">Select Quantity</span>
                <span className="text-xs text-[#6B7280]">
                  {inStock ? `${product.stock_quantity} units in stock` : "Currently sold out"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Stepper */}
                <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-[#FBFBFA] w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !inStock}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-[#1A2E22] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    –
                  </button>
                  <span className="w-12 text-center font-bold text-[#1A2E22] text-base font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))}
                    disabled={quantity >= product.stock_quantity || !inStock}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-[#1A2E22] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!inStock || adding}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#2D6A4F] text-white font-bold text-[15px] hover:bg-[#40916C] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-green-900/15 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5"
                >
                  {adding ? (
                    <>
                      <LoadingOutlined spin /> Adding to Cart…
                    </>
                  ) : inStock ? (
                    <>
                      <ShoppingCartOutlined className="text-lg" /> Add to Cart · ৳{(product.price * quantity).toLocaleString()}
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </motion.button>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
