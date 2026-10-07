"use client";

import { Star, ShoppingBag, Heart } from "lucide-react";
import SafeImage from "@/components/SafeImage";

/**
 * Standardized product card used across the whole homepage.
 *  - 1:1 square image with rounded-xl corners
 *  - green pill tag (top-left): explicit `badge` text, or "-{discount}%"
 *  - title, 5-star rating, current price + strikethrough original price
 *  - floating shopping-bag button (bottom-right) wired to the cart via `onAdd` kudsfsd
 *
 * @param {{
 *   title: string,
 *   image: string,
 *   fallback?: string,
 *   price: number,
 *   discount?: number | null,
 *   badge?: string | null,
 *   inStock?: boolean,
 *   wished?: boolean,
 *   onOpen?: () => void,
 *   onAdd?: (e: import("react").MouseEvent) => void,
 *   onToggleWishlist?: (e: import("react").MouseEvent) => void,
 * }} props
 */
export default function ProductCard({
  title,
  image,
  fallback,
  price,
  discount,
  badge,
  inStock = true,
  wished = false,
  onOpen,
  onAdd,
  onToggleWishlist,
}) {
  const safePrice = Number(price || 0);
  const originalPrice = discount ? Math.round(safePrice / (1 - discount / 100)) : null;
  const pillText = badge || (discount ? `-${discount}%` : null);

  return (
    <div className="product-card group relative bg-white rounded-2xl border border-gray-200/70 p-3 shadow-[0_1px_2px_rgba(28,43,30,0.04)] hover:shadow-[0_12px_32px_-12px_rgba(28,43,30,0.18)] hover:-translate-y-1 transition-all duration-300">
      <div
        onClick={onOpen}
        className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F5ED] cursor-pointer"
      >
        <SafeImage
          src={image}
          fallback={fallback}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {pillText && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#1E3F20] text-white text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full">
            {pillText}
          </span>
        )}

        {!inStock && (
          <span className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 text-red-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Out of Stock
          </span>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${wished
                ? "opacity-100 text-rose-500 scale-105"
                : "opacity-0 group-hover:opacity-100 text-[#5A6B5C] hover:text-rose-500 hover:scale-105"
              }`}
          >
            <Heart className={`w-4 h-4 transition-colors ${wished ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        )}
      </div>

      <div className="pt-3 pb-1 px-1 pr-12">
        <h3
          onClick={onOpen}
          className="text-sm font-semibold text-[#1C2B1E] line-clamp-1 cursor-pointer group-hover:text-[#1E3F20]"
        >
          {title}
        </h3>

        <div className="flex items-center gap-0.5 mt-1.5" aria-label="Rated 5 out of 5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-[#1E3F20]">৳{safePrice.toLocaleString()}</span>
          {originalPrice && (
            <del className="text-xs text-[#5A6B5C]/70 font-medium">৳{originalPrice.toLocaleString()}</del>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={onAdd}
        aria-label={inStock ? `Add ${title} to cart` : "Sold out"}
        className={`absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${inStock
            ? "bg-[#EBF0E6] text-[#1E3F20] hover:bg-[#1E3F20] hover:text-white cursor-pointer"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
      >
        <ShoppingBag className="w-4 h-4" />
      </button>
    </div>
  );
}
