"use client";

import Link from "next/link";
import { Star, ArrowRight, Trophy, Flame } from "lucide-react";
import SafeImage from "@/components/SafeImage";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=500&q=80";

export default function TopRankingsSection({ data, onSelectCategory }) {
  if (data?.isEnabled === false) {
    return null;
  }

  const badge = data?.badge || "CUSTOMER FAVORITES";
  const title = data?.title || "Mini Top Rankings";
  const subtitle =
    data?.subtitle ||
    "Top-rated botanical varieties ranked by gardener reviews and seasonal demand.";
  const viewAllText = data?.viewAllText || "View All Rankings";
  const viewAllUrl = data?.viewAllUrl || "/collections";

  const columns =
    Array.isArray(data?.columns) && data.columns.length > 0
      ? data.columns
      : [];

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) {
      return "bg-amber-100 text-amber-800 border-amber-300 font-black";
    }
    if (rank === 2) {
      return "bg-slate-100 text-slate-700 border-slate-300 font-bold";
    }
    return "bg-orange-100 text-orange-800 border-orange-200 font-bold";
  };

  return (
    <section
      id="top-rankings"
      className="section-top-rankings max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{badge}</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
            {title}
          </h2>
          <p className="text-sm text-[#5A6B5C] mt-1 max-w-2xl">{subtitle}</p>
        </div>

        <Link
          href={viewAllUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3F20] border border-gray-300 bg-white px-5 py-2.5 rounded-full hover:bg-[#F4F6F4] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-4 h-4 text-[#2D6A4F]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col, cIdx) => {
          const colTitle = col.title || `Ranking Group #${cIdx + 1}`;
          const browseUrl = col.browseUrl || "/collections";
          const items = Array.isArray(col.items) ? col.items : [];

          return (
            <div
              key={cIdx}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                  <h3 className="font-extrabold text-sm text-[#1A2E22] flex items-center">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 inline mr-1.5" />
                    <span>{colTitle}</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-full">
                    Top 3
                  </span>
                </div>

                <div className="space-y-3.5">
                  {items.map((item, iIdx) => {
                    const rankNum = item.rank || iIdx + 1;
                    const product =
                      item.productId && typeof item.productId === "object"
                        ? item.productId
                        : null;

                    const itemTitle =
                      product?.title ||
                      item.title ||
                      `Featured Botanical #${rankNum}`;
                    const itemPrice =
                      product?.price !== undefined
                        ? `৳${product.price}`
                        : item.price || "৳350";
                    const count = Number(product?.reviewCount ?? item.reviewCount ?? 0);
                    const avgRating = Number(
                      product?.avgRating ?? product?.averageRating ?? item.avgRating ?? 0
                    );

                    const itemImage =
                      (product?.images && product.images[0]) ||
                      product?.image ||
                      item.image ||
                      FALLBACK_IMAGE;

                    const itemUrl = product?._id
                      ? `/products/${product._id}`
                      : product?.id
                      ? `/products/${product.id}`
                      : "/products";

                    const itemTag = item.badge || item.tag || "Top Choice";

                    return (
                      <Link
                        key={item._id || product?._id || iIdx}
                        href={itemUrl}
                        className="group flex items-center gap-3.5 p-2 rounded-2xl hover:bg-[#FAFBF9] transition-all cursor-pointer"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                          <SafeImage
                            src={itemImage}
                            fallback={FALLBACK_IMAGE}
                            alt={itemTitle}
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <span
                            className={`absolute top-1 left-1 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shadow-2xs ${getRankBadgeStyle(
                              rankNum
                            )}`}
                          >
                            {rankNum}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold text-[#2D5A27] bg-[#EBF0E6] px-1.5 py-0.5 rounded border border-[#2D6A4F]/10">
                              {itemTag}
                            </span>
                            {count > 0 ? (
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                                <span className="text-[10px] text-gray-700 font-bold">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Unrated</span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#1A2E22] truncate group-hover:text-[#2D6A4F] transition-colors">
                            {itemTitle}
                          </h4>
                          <p className="text-xs font-extrabold text-[#1E3F20] mt-0.5">
                            {itemPrice}
                          </p>
                        </div>

                        <div className="text-gray-300 group-hover:text-[#2D6A4F] group-hover:translate-x-0.5 transition-all pr-1">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100/80">
                <Link
                  href={browseUrl}
                  className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-[#2D5A27] hover:text-[#1E3F20] py-1 cursor-pointer transition-colors"
                >
                  <span>Browse category products</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2D6A4F]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
