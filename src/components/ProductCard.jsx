"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { App } from "antd";
import SafeImage from "@/components/SafeImage";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";

const FALLBACK_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80";
const SNAKE_PLANT_FALLBACK =
  "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=600&q=80";

/**
 * Single Master ProductCard Component
 * Used across the entire site for uniform botanical aesthetics and real review ratings.
 *
 * @param {{
 *   product?: any;
 *   priority?: boolean;
 *   showQuickAdd?: boolean;
 *   onOpen?: () => void;
 *   onAdd?: (e: React.MouseEvent) => void;
 *   onToggleWishlist?: (e: React.MouseEvent) => void;
 *   className?: string;
 *   // Legacy/fallback props support
 *   title?: string;
 *   image?: string;
 *   images?: string[];
 *   fallback?: string;
 *   price?: number;
 *   originalPrice?: number;
 *   discount?: number;
 *   badge?: string;
 *   category?: string;
 *   inStock?: boolean;
 *   wished?: boolean;
 * }} props
 */
export default function ProductCard({
  product: productProp,
  priority = false,
  showQuickAdd = true,
  onOpen,
  onAdd,
  onToggleWishlist,
  className = "",
  ...rest
}) {
  const [mounted, setMounted] = useState(false);

  // Cart & Wishlist stores
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  let message = null;
  try {
    const antdApp = App.useApp();
    message = antdApp.message;
  } catch {
    // Graceful fallback outside App wrapper
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize product data whether passed as `product` object or flat props
  const product = productProp || {
    _id: rest._id || rest.id || "prod-item",
    title: rest.title || "Botanical Specimen",
    image: rest.image,
    images: rest.images || (rest.image ? [rest.image] : []),
    price: rest.price || 0,
    originalPrice: rest.originalPrice,
    discount: rest.discount,
    badge: rest.badge,
    category: rest.category,
    stock_quantity: rest.stock_quantity,
    stock: rest.stock,
    inStock: rest.inStock,
    avgRating: rest.avgRating || rest.averageRating || rest.rating,
    averageRating: rest.averageRating,
    reviewCount: rest.reviewCount,
  };

  const prodId = product._id || product.id || "";
  const title = product.title || "Botanical Specimen";
  const titleLower = title.toLowerCase();

  // Price calculations
  const price = Number(product.price || 0);
  let originalPrice =
    product.originalPrice !== undefined && product.originalPrice !== null
      ? Number(product.originalPrice)
      : null;

  // If discount percentage exists without originalPrice, calculate it
  if (!originalPrice && product.discount && Number(product.discount) > 0) {
    const dVal = Number(product.discount);
    if (dVal < 100) {
      originalPrice = Math.round(price / (1 - dVal / 100));
    }
  }

  // Calculate dynamic discount percentage
  let discountPercentage = 0;
  if (originalPrice && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  } else if (product.discount && Number(product.discount) > 0) {
    discountPercentage = Math.round(Number(product.discount));
  }

  // Stock status
  const inStock =
    product.stock_quantity !== undefined
      ? product.stock_quantity > 0
      : product.stock !== undefined
      ? product.stock > 0
      : product.inStock !== false;

  // Dynamic real star rating
  const rating = Number(
    product.avgRating ?? product.averageRating ?? product.rating ?? 0
  );
  const count = Number(product.reviewCount ?? 0);

  // Image source and fallback
  const primaryImage =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    FALLBACK_DEFAULT_IMAGE;

  const fallbackImage =
    rest.fallback ||
    (titleLower.includes("snake") || titleLower.includes("sansevieria")
      ? SNAKE_PLANT_FALLBACK
      : FALLBACK_DEFAULT_IMAGE);

  // Wishlist state
  const isWished = mounted
    ? rest.wished !== undefined
      ? rest.wished
      : isInWishlist(prodId)
    : false;

  // Category or badge text
  const categoryText = product.category || "";
  const badgeText =
    product.badge || (discountPercentage > 0 ? `-${discountPercentage}%` : null);

  const productHref = prodId ? `/products/${prodId}` : "#";

  // Handlers
  const handleCardClick = () => {
    if (onOpen) {
      onOpen();
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleWishlist) {
      onToggleWishlist(e);
      return;
    }
    toggleWishlist(product);
    if (message) {
      message.success(isWished ? "Removed from wishlist" : "Saved to wishlist");
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!inStock) return;
    if (onAdd) {
      onAdd(e);
      return;
    }
    addItem({
      _id: prodId,
      title: title,
      price: price,
      image: primaryImage,
      images: [primaryImage],
      quantity: 1,
    });
    if (message) {
      message.success(`Added ${title} to cart!`);
    }
    openCart();
  };

  return (
    <div
      className={`product-card group relative bg-white rounded-2xl border border-gray-200/70 p-3 shadow-[0_1px_2px_rgba(28,43,30,0.04)] hover:shadow-[0_12px_32px_-12px_rgba(28,43,30,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full ${className}`}
    >
      <div>
        {/* ── Image Container (1:1 square crisp image) ── */}
        <div
          onClick={handleCardClick}
          className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F5ED] cursor-pointer"
        >
          <SafeImage
            src={primaryImage}
            fallback={fallbackImage}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Dynamic Discount Badge (Top-Left) */}
          {badgeText && (
            <span className="absolute top-2.5 left-2.5 z-10 bg-[#1E3F20] text-white text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full shadow-xs">
              {badgeText}
            </span>
          )}

          {/* Out of Stock Indicator */}
          {!inStock && (
            <span className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 text-red-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
              Out of Stock
            </span>
          )}

          {/* Wishlist Heart Button (Top-Right) */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWished ? "Remove from wishlist" : "Save to wishlist"}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
              isWished
                ? "opacity-100 text-rose-500 scale-105"
                : "opacity-0 group-hover:opacity-100 text-[#5A6B5C] hover:text-rose-500 hover:scale-105"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWished ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>
        </div>

        {/* ── Content Area ── */}
        <div className="pt-3 pb-1 px-1">
          {/* Category / Tag */}
          {categoryText && (
            <span className="text-[11px] font-medium text-[#5A6B5C] capitalize line-clamp-1 block mb-0.5">
              {categoryText}
            </span>
          )}

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#1C2B1E] line-clamp-1 group-hover:text-[#1E3F20] transition-colors">
            <Link
              href={productHref}
              onClick={(e) => {
                if (onOpen) {
                  e.preventDefault();
                  onOpen();
                }
              }}
              className="cursor-pointer hover:underline"
            >
              {title}
            </Link>
          </h3>

          {/* Dynamic Real Star Rating (NO HARDCODED 5 STARS) */}
          <div
            className="flex items-center gap-0.5 mt-1.5"
            aria-label={`Rated ${rating.toFixed(1)} out of 5 stars (${count} reviews)`}
          >
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = starIndex <= Math.round(rating);
              return (
                <Star
                  key={starIndex}
                  className={`w-3.5 h-3.5 ${
                    isFilled
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              );
            })}
            {count > 0 ? (
              <>
                <span className="text-xs font-semibold text-gray-700 ml-1.5">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({count})</span>
              </>
            ) : (
              <span className="text-xs text-gray-400 ml-1.5">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Price Row & Quick Add ── */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100/80 px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[#1E3F20]">
            ৳{price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <del className="text-xs text-[#5A6B5C]/70 font-medium">
              ৳{originalPrice.toLocaleString()}
            </del>
          )}
        </div>

        {showQuickAdd && (
          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            aria-label={inStock ? `Add ${title} to cart` : "Sold out"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              inStock
                ? "bg-[#EBF0E6] text-[#1E3F20] hover:bg-[#1E3F20] hover:text-white cursor-pointer active:scale-95 shadow-2xs"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
