"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  PackageOpen,
  Check,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function ProductsCatalogClient({
  initialProducts = [],
  categories = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured"); // featured | price_asc | price_desc | newest
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync category with URL search param if changed externally
  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat) {
      setSelectedCategory(cat.toLowerCase());
    }
  }, [searchParams]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === "all") {
      router.replace("/products", { scroll: false });
    } else {
      router.replace(`/products?category=${encodeURIComponent(slug)}`, {
        scroll: false,
      });
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      const target = selectedCategory.toLowerCase();
      list = list.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        return (
          cat === target ||
          cat.replace(/[\s_]+/g, "-") === target ||
          target.replace(/[\s_]+/g, "-") === cat
        );
      });
    }

    // Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [initialProducts, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1C2B1E] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Breadcrumb ────────────────────────────────────────── */}
        <nav
          className="flex items-center gap-2 text-xs text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="hover:text-[#2D5A27] transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-900">All Products</span>
        </nav>

        {/* ── Header Title Banner ───────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBF0E6] shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
              Living Botanical Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2B1E] tracking-tight font-serif">
              All Botanical Products &amp; Plant Care
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Browse our complete living inventory of indoor plants, organic
              fertilizers, and handcrafted planters.
            </p>
          </div>
        </div>

        {/* ── Controls & Filter Bar ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                  selectedCategory === "all"
                    ? "bg-[#2D5A27] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                All Products ({initialProducts.length})
              </button>
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory === (cat.slug || "").toLowerCase() ||
                  selectedCategory === (cat.name || "").toLowerCase();

                return (
                  <button
                    key={cat._id || cat.slug}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(
                        (cat.slug || cat.name || "").toLowerCase()
                      )
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                      isSelected
                        ? "bg-[#2D5A27] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown & Count Indicator */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Showing {filteredProducts.length} of {initialProducts.length}{" "}
                items
              </span>

              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-2"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Product Grid ──────────────────────────────────────── */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p, idx) => (
              <ProductCard
                key={p._id || idx}
                product={p}
                priority={idx < 4}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F9F6] text-[#2D5A27] flex items-center justify-center mx-auto">
              <PackageOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                No Botanical Items Found
              </h3>
              <p className="text-xs text-gray-500">
                There are no products matching this selected category filter.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className="px-5 py-2.5 rounded-full bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3F20] transition-colors cursor-pointer"
            >
              Reset to All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
