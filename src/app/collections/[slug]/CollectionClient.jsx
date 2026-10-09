"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Sprout,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";

const DISCOUNTS = [10, 15, 20, 25, null, 12, null, 18];

export default function CollectionClient({ category, initialProducts, slug }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const openCart = useCartStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addItem(product);
    openCart();
  };

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...initialProducts];
    if (sortBy === "price-low") {
      return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    if (sortBy === "newest") {
      return list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    // "featured" default
    return list;
  }, [initialProducts, sortBy]);

  const categoryTitle =
    category?.name ||
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const categoryDescription =
    category?.description ||
    `Explore our curated selection of healthy nursery specimens and care essentials for ${categoryTitle}.`;

  const totalCount = initialProducts.length;

  return (
    <div className="min-h-screen bg-[#F7F8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-[#5A6B5C]">
            <li>
              <Link href="/" className="hover:text-[#1E3F20] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </li>
            <li>
              <Link
                href="/collections"
                className="hover:text-[#1E3F20] transition-colors"
              >
                Collections
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </li>
            <li className="font-semibold text-[#1C2B1E]" aria-current="page">
              {categoryTitle}
            </li>
          </ol>
        </nav>

        {/* ── Collection Hero Banner ─────────────────────────── */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 mb-8 sm:mb-12 shadow-xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#1E3F20] text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" />
              <span>Botanical Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C2B1E] tracking-tight">
              {categoryTitle}{" "}
              <span className="text-xl sm:text-2xl font-semibold text-[#5A6B5C]">
                ({totalCount} {totalCount === 1 ? "Variety" : "Varieties"})
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#5A6B5C] leading-relaxed max-w-2xl">
              {categoryDescription}
            </p>
          </div>
        </div>

        {/* ── Filter & Sorting Bar ────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Product Count */}
          <div className="text-xs sm:text-sm font-medium text-[#5A6B5C] w-full sm:w-auto text-left">
            Showing <span className="font-bold text-[#1C2B1E]">{sortedProducts.length}</span> of{" "}
            <span className="font-bold text-[#1C2B1E]">{totalCount}</span> products
          </div>

          {/* Right: Sort Dropdown */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <label
              htmlFor="sort-select"
              className="text-xs font-bold text-[#1C2B1E] flex items-center gap-1.5 shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Sort By:</span>
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#F7F8F4] border border-gray-200 text-xs font-semibold text-[#1C2B1E] rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Product Grid or Empty State ─────────────────────── */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-200/70 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1C2B1E]">
              No plants found in this collection currently
            </h3>
            <p className="text-sm text-[#5A6B5C] mt-2 leading-relaxed">
              We are propagating and restocking new botanical specimens for this
              category. Please browse all available nursery plants.
            </p>
            <Link
              href="/#products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E3F20] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-all shadow-xs cursor-pointer"
            >
              <span>Browse All Plants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpen={() => router.push(`/products/${product._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
