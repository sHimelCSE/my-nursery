"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Leaf,
  Package,
  Gift,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import SafeImage from "@/components/SafeImage";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_BOTANICAL_CATEGORIES,
} from "@/constants/defaultHomepageConfig";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

const ICON_MAP = {
  Headphones,
  Leaf,
  Package,
  Gift,
  ShieldCheck,
  Truck,
  Sparkles,
};

export default function BotanicalCategorySection({
  section,
  data,
  categories: initialCategories,
  onSelectCategory,
}) {
  const [allCategories, setAllCategories] = useState(
    Array.isArray(initialCategories) && initialCategories.length > 0
      ? initialCategories
      : []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setAllCategories(initialCategories);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.categories)) {
          setAllCategories(json.categories);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  // Determine the exact 4 categories to render
  const displayCategories = useMemo(() => {
    const rawFeatured = data?.featuredCategoryIds;

    // Case 1: Populated objects with name and productCount
    if (
      Array.isArray(rawFeatured) &&
      rawFeatured.length > 0 &&
      typeof rawFeatured[0] === "object" &&
      rawFeatured[0]?.name
    ) {
      return rawFeatured.slice(0, 4);
    }

    // Case 2: Array of category IDs (strings or {_id})
    if (Array.isArray(rawFeatured) && rawFeatured.length > 0 && allCategories.length > 0) {
      const idMap = new Map(
        allCategories.map((c) => [c._id?.toString() || c.id?.toString(), c])
      );
      const matched = rawFeatured
        .map((item) => {
          const id = typeof item === "object" && item?._id ? item._id.toString() : item?.toString();
          return idMap.get(id);
        })
        .filter(Boolean);

      if (matched.length > 0) {
        return matched.slice(0, 4);
      }
    }

    // Case 3: Fallback to first 4 active categories from MongoDB
    if (allCategories.length > 0) {
      return allCategories.slice(0, 4);
    }

    // Case 4: Default botanical categories fallback
    return DEFAULT_BOTANICAL_CATEGORIES.slice(0, 4);
  }, [data?.featuredCategoryIds, allCategories]);

  const title =
    data?.title ||
    section?.title ||
    DEFAULT_HOMEPAGE_CONFIG.categoriesSection.title;
  const subtitle =
    data?.subtitle ||
    section?.subtitle ||
    DEFAULT_HOMEPAGE_CONFIG.categoriesSection.subtitle;
  const viewAllText =
    data?.viewAllText ||
    DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllText ||
    "View All";
  const viewAllUrl =
    data?.viewAllUrl ||
    DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllUrl ||
    "/collections";

  const perks =
    Array.isArray(data?.perks) && data.perks.length > 0
      ? data.perks
      : DEFAULT_HOMEPAGE_CONFIG.categoriesSection.perks;

  return (
    <section
      id="category-section"
      className="section-categories max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20"
    >
      {/* ─── Dynamic Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57]">
            {subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllUrl}
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#1E3F20] border border-gray-300 bg-white px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ─── Dynamic Category Cards (Exact 4 Collections) ─────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
        {loading && displayCategories.length === 0
          ? Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="bg-[#F2F5ED] rounded-3xl p-3.5 text-center border border-transparent animate-pulse"
            >
              <div className="aspect-square w-full rounded-2xl bg-[#E2E8DC]" />
              <div className="h-4 w-20 bg-[#E2E8DC] rounded-md mx-auto mt-3" />
              <div className="h-3 w-14 bg-[#E2E8DC] rounded-md mx-auto mt-1.5" />
            </div>
          ))
          : displayCategories.map((cat, idx) => {
            const productCount =
              typeof cat.productCount === "number" ? cat.productCount : 0;
            const countText = `${productCount}+ Plants`;
            const catSlug =
              cat.slug ||
              cat.name?.toLowerCase().replace(/\s+/g, "-") ||
              "plant";
            const catImage = cat.image || FALLBACK_IMAGE;

            return (
              <Link
                key={cat._id || cat.id || catSlug || idx}
                href={`/collections/${catSlug}`}
                className="category-card group bg-[#F2F5ED] rounded-3xl p-3.5 text-center border border-[#1E3F20]/15 hover:border-[#1E3F20]/30 hover:shadow-[0_16px_32px_-16px_rgba(28,43,30,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/80 p-3 flex items-center justify-center">
                  <SafeImage
                    src={catImage}
                    fallback={FALLBACK_IMAGE}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 w-full">
                  <h3 className="text-sm font-bold text-[#1C2B1E] group-hover:text-[#2D6A4F] transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#5A6B5C] font-medium mt-0.5">
                    {countText}
                  </p>
                </div>
              </Link>
            );
          })}
      </div>

      {/* ─── Dynamic Perks Bar (Bottom Row) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-8">
        {perks.map((perk, idx) => {
          const Icon = ICON_MAP[perk.icon] || Leaf;
          return (
            <div
              key={perk.title || idx}
              className="flex items-center gap-3.5 bg-[#EBF0E6] rounded-full pl-3.5 pr-5 py-3 hover:bg-[#E3EBDD] transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-white text-[#1E3F20] flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1C2B1E] leading-tight truncate">
                  {perk.title}
                </p>
                <p className="text-xs text-[#5A6B5C] truncate mt-0.5">
                  {perk.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
