import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight, Sprout, Sparkles } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

import SiteSetting from "@/models/SiteSetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  await dbConnect();
  let siteName = "MSH BloomCraft";
  try {
    const settings = await SiteSetting.getSettings();
    if (settings?.general?.siteName) siteName = settings.general.siteName;
  } catch (err) {}
  return {
    title: "Botanical Collections",
    description:
      "Explore our curated plant varieties, specialized potting soils, and handcrafted planters organized for every green space.",
  };
}

const DEFAULT_COLLECTION_IMAGE =
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";

export default async function CollectionsPage() {
  await dbConnect();

  // Fetch only listed categories (isUnlisted !== true)
  const categories = await Category.find({
    isUnlisted: { $ne: true },
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // Fetch all products to calculate collection counts
  const products = await Product.find({}, "category").lean();

  const collectionsWithCount = categories.map((cat) => {
    const slugRegex = new RegExp(`^${cat.slug}$`, "i");
    const nameRegex = new RegExp(`^${cat.name}$`, "i");
    const count = products.filter(
      (p) => slugRegex.test(p.category) || nameRegex.test(p.category)
    ).length;

    return {
      ...cat,
      _id: cat._id.toString(),
      itemCount: count,
    };
  });

  return (
    <div className="min-h-screen bg-[#F7F8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-[#5A6B5C]">
            <li>
              <Link
                href="/"
                className="hover:text-[#1E3F20] transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </li>
            <li className="font-semibold text-[#1C2B1E]" aria-current="page">
              Collections
            </li>
          </ol>
        </nav>

        {/* ── Page Header ────────────────────────────────────── */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#1E3F20] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Botanical Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2B1E] tracking-tight">
            Botanical Collections
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5A6B5C] leading-relaxed">
            Explore our curated plant varieties, specialized potting soils, and
            handcrafted planters organized for every green space.
          </p>
        </div>

        {/* ── Collections Grid ───────────────────────────────── */}
        {collectionsWithCount.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/70 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1C2B1E]">
              No Collections Available Yet
            </h3>
            <p className="text-sm text-[#5A6B5C] mt-1.5">
              Please check back soon or browse our full nursery catalog.
            </p>
            <Link
              href="/#products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1E3F20] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-all"
            >
              Browse All Plants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {collectionsWithCount.map((collection) => (
              <div
                key={collection._id}
                className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <Link
                  href={`/collections/${collection.slug}`}
                  className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-[#F2F5ED] block"
                >
                  <Image
                    src={collection.image || DEFAULT_COLLECTION_IMAGE}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Item Count Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10 bg-white/95 backdrop-blur-md text-[#1E3F20] text-xs font-semibold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-[#1E3F20]/10">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>
                      {collection.itemCount}{" "}
                      {collection.itemCount === 1 ? "Plant" : "Plants"} Available
                    </span>
                  </div>
                </Link>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="block group-hover:text-[#1E3F20] transition-colors"
                    >
                      <h2 className="text-xl font-bold text-[#1C2B1E]">
                        {collection.name}
                      </h2>
                    </Link>
                    <p className="text-sm text-[#5A6B5C] mt-2 line-clamp-2 leading-relaxed">
                      {collection.description ||
                        "Explore healthy nursery plants, handcrafted planters, and organic gardening essentials."}
                    </p>
                  </div>

                  {/* Explore Button */}
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="mt-6 inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-[#F7F8F4] group-hover:bg-[#1E3F20] text-[#1E3F20] group-hover:text-white font-semibold text-xs transition-all duration-300 shadow-xs cursor-pointer"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
