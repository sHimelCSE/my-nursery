"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sprout,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { App } from "antd";
import useWishlistStore from "@/lib/wishlistStore";
import useCartStore from "@/lib/cartStore";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { message } = App.useApp();

  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = (item) => {
    const id = item._id || item.id;
    addItem({
      _id: id,
      title: item.title,
      price: Number(item.price || 0),
      images: item.images || (item.image ? [item.image] : []),
      image: item.images?.[0] || item.image || FALLBACK_IMG,
      quantity: 1,
    });
    removeFromWishlist(id);
    message.success({
      content: `${item.title} moved to cart!`,
      duration: 2,
    });
    openCart();
  };

  const handleRemove = (item) => {
    const id = item._id || item.id;
    removeFromWishlist(id);
    message.info({
      content: `${item.title} removed from wishlist`,
      duration: 2,
    });
  };

  const handleMoveAllToCart = () => {
    if (!items.length) return;
    items.forEach((item) => {
      const id = item._id || item.id;
      addItem({
        _id: id,
        title: item.title,
        price: Number(item.price || 0),
        images: item.images || (item.image ? [item.image] : []),
        image: item.images?.[0] || item.image || FALLBACK_IMG,
        quantity: 1,
      });
    });
    clearWishlist();
    message.success({
      content: "All saved plants moved to cart!",
      duration: 2.5,
    });
    openCart();
  };

  // Prevent Next.js hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-[70vh] bg-[#F7F8F4] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center animate-spin mb-3">
          <Sprout className="w-6 h-6 stroke-[1.8]" />
        </div>
        <p className="text-gray-500 text-xs font-medium tracking-wide">
          Loading your saved botanical collection...
        </p>
      </div>
    );
  }

  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1C2B1E] pb-24">
      {/* ─── Breadcrumb Navigation ───────────────────────────────────────── */}
      <div className="border-b border-gray-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav
            className="flex items-center gap-2 text-xs text-[#5A6B5C]"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-[#1E3F20] transition-colors flex items-center gap-1"
            >
              <Sprout className="w-3.5 h-3.5 text-[#4E7D3E]" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-[#1C2B1E]">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* ─── Page Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-200/70">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#1E3F20] text-xs font-bold uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Saved Botanicals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-[#1C2B1E]">
              My Saved Plants &amp; Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6B5C] mt-1">
              {totalCount === 0
                ? "You haven't saved any botanical items yet."
                : `You have ${totalCount} ${
                    totalCount === 1 ? "specimen" : "specimens"
                  } saved in your nursery wishlist.`}
            </p>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── Main Content: Grid or Empty State ─────────────────────────── */}
        {totalCount === 0 ? (
          <div className="mt-12 p-10 sm:p-16 rounded-3xl bg-white border border-gray-200/70 shadow-sm text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 stroke-[1.5] text-[#4E7D3E]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1C2B1E] mb-2">
              Your wishlist is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B5C] leading-relaxed max-w-sm mb-7">
              Discover air-purifying foliage, flowering species, and handcrafted
              ceramic planters to curate your personal indoor garden.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Browse Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {items.map((item) => {
              const id = item._id || item.id;
              const productHref = item.slug ? `/products/${item.slug}` : "#";
              const img =
                item.images?.[0] || item.image || FALLBACK_IMG;
              const inStock = (item.stock_quantity ?? 1) > 0;
              const price = Number(item.price || 0);

              return (
                <div
                  key={id}
                  className="group relative bg-white rounded-2xl border border-gray-200/70 p-3.5 shadow-[0_1px_3px_rgba(28,43,30,0.04)] hover:shadow-[0_12px_32px_-12px_rgba(28,43,30,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Badges & Remove Button */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F5ED] mb-3">
                      <Link href={productHref} className="block w-full h-full">
                        <SafeImage
                          src={img}
                          fallback={FALLBACK_IMG}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Category Badge */}
                      <span className="absolute top-2.5 left-2.5 z-10 bg-[#1E3F20]/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
                        {item.category || "Houseplant"}
                      </span>

                      {/* In Stock / Out of Stock Badge */}
                      <span
                        className={`absolute bottom-2.5 left-2.5 z-10 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          inStock
                            ? "bg-white/95 text-[#1E3F20] border border-[#EBF0E6]"
                            : "bg-white/95 text-red-600 border border-red-100"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>

                      {/* Remove Action (Trash Icon Button) */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.8]" />
                      </button>
                    </div>

                    {/* Title & Price Details */}
                    <div className="px-1 pb-2">
                      <Link
                        href={productHref}
                        className="text-sm font-semibold text-[#1C2B1E] group-hover:text-[#1E3F20] line-clamp-1 transition-colors block mb-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-[#1E3F20]">
                          ৳{price.toLocaleString()}
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-[#5A6B5C] truncate max-w-[140px]">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Move to Cart Primary Action */}
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => handleMoveToCart(item)}
                      className={`w-full py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        inStock
                          ? "bg-[#1E3F20] hover:bg-[#152D17] text-white shadow-xs hover:shadow"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{inStock ? "Move to Cart" : "Out of Stock"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
