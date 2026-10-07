"use client";

import Link from "next/link";
import { Award, Star, ArrowRight, ShoppingBag, Trophy, Flame } from "lucide-react";
import SafeImage from "@/components/SafeImage";

const TOP_RANKED_COLLECTIONS = [
  {
    categoryTitle: "Top Air Purifiers",
    categorySlug: "plant",
    items: [
      {
        rank: 1,
        title: "Peace Lily (Spathiphyllum)",
        price: "৳380",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=500&q=80",
        tag: "NASA Verified",
      },
      {
        rank: 2,
        title: "Golden Pothos in Hanging Pot",
        price: "৳280",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500&q=80",
        tag: "Easy Care",
      },
      {
        rank: 3,
        title: "Sansevieria Snake Plant",
        price: "৳320",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=500&q=80",
        tag: "Night Oxygen",
      },
    ],
  },
  {
    categoryTitle: "Collector Bonsai & Foliage",
    categorySlug: "plant",
    items: [
      {
        rank: 1,
        title: "Ficus Retusa Dwarf Bonsai",
        price: "৳1,250",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=500&q=80",
        tag: "Living Art",
      },
      {
        rank: 2,
        title: "Miniature Coconut Bonsai",
        price: "৳1,450",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&q=80",
        tag: "Hand-Crafted",
      },
      {
        rank: 3,
        title: "Monstera Deliciosa Mature",
        price: "৳850",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500&q=80",
        tag: "Urban Jungle",
      },
    ],
  },
  {
    categoryTitle: "Organic Soils & Planters",
    categorySlug: "fertilizer",
    items: [
      {
        rank: 1,
        title: "Pure Earthworm Vermicompost 5KG",
        price: "৳220",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&q=80",
        tag: "100% Bio",
      },
      {
        rank: 2,
        title: "Minimalist Ceramic Planter",
        price: "৳290",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80",
        tag: "Drainage Hole",
      },
      {
        rank: 3,
        title: "Organic Neem Cake Fertilizer 2KG",
        price: "৳180",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=500&q=80",
        tag: "Pest Shield",
      },
    ],
  },
];

export default function TopRankingsSection({ data, onSelectCategory }) {
  const getRankBadge = (rank) => {
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
            <span>Customer Favorites</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
            Mini Top Rankings
          </h2>
          <p className="text-sm text-[#5A6B5C] mt-1">
            Top-rated botanical varieties ranked by gardener reviews and seasonal demand.
          </p>
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3F20] border border-gray-300 bg-white px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View All Rankings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOP_RANKED_COLLECTIONS.map((col) => (
          <div
            key={col.categoryTitle}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <h3 className="font-extrabold text-sm text-[#1A2E22] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{col.categoryTitle}</span>
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  Top 3
                </span>
              </div>

              <div className="space-y-3.5">
                {col.items.map((item) => (
                  <Link
                    key={item.title}
                    href="/products"
                    className="group flex items-center gap-3.5 p-2 rounded-2xl hover:bg-[#FAFBF9] transition-all cursor-pointer"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      <SafeImage
                        src={item.image}
                        fallback="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shadow-2xs ${getRankBadge(
                          item.rank
                        )}`}
                      >
                        {item.rank}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-[#2D5A27] bg-[#EBF0E6] px-1.5 py-0.2 rounded">
                          {item.tag}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] text-gray-500 font-bold">
                            {item.rating}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-[#1A2E22] truncate group-hover:text-[#2D6A4F] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs font-extrabold text-[#1E3F20] mt-0.5">
                        {item.price}
                      </p>
                    </div>

                    <div className="text-gray-300 group-hover:text-[#2D6A4F] group-hover:translate-x-0.5 transition-all pr-1">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100/80">
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(col.categorySlug)}
                className="w-full text-center text-xs font-bold text-[#2D5A27] hover:text-[#1E3F20] py-1 cursor-pointer transition-colors"
              >
                Browse category products →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
