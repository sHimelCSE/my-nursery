import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import HomepageConfig from "@/models/HomepageConfig";
import Product from "@/models/Product";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    let config = await HomepageConfig.findOne().lean();

    if (!config) {
      // Auto-seed initial configuration if empty
      const created = await HomepageConfig.create(DEFAULT_HOMEPAGE_CONFIG);
      config = created.toObject();
    } else {
      const updates = {};

      if (!config.categoriesSection?.perks || config.categoriesSection.perks.length === 0) {
        updates["categoriesSection.viewAllText"] =
          config.categoriesSection?.viewAllText || DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllText;
        updates["categoriesSection.viewAllUrl"] =
          config.categoriesSection?.viewAllUrl || DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllUrl;
        updates["categoriesSection.subtitle"] =
          config.categoriesSection?.subtitle || DEFAULT_HOMEPAGE_CONFIG.categoriesSection.subtitle;
        updates["categoriesSection.perks"] = DEFAULT_HOMEPAGE_CONFIG.categoriesSection.perks;
      }

      if (!config.dealsSection?.badge || !config.dealsSection?.displayType) {
        updates["dealsSection.badge"] =
          config.dealsSection?.badge || DEFAULT_HOMEPAGE_CONFIG.dealsSection.badge;
        updates["dealsSection.title"] =
          config.dealsSection?.title || DEFAULT_HOMEPAGE_CONFIG.dealsSection.title;
        updates["dealsSection.subtitle"] =
          config.dealsSection?.subtitle || DEFAULT_HOMEPAGE_CONFIG.dealsSection.subtitle;
        updates["dealsSection.displayType"] =
          config.dealsSection?.displayType || DEFAULT_HOMEPAGE_CONFIG.dealsSection.displayType;
        updates["dealsSection.discountPercentage"] =
          config.dealsSection?.discountPercentage || DEFAULT_HOMEPAGE_CONFIG.dealsSection.discountPercentage;
      }

      if (!config.newArrivals?.badge || !config.newArrivals?.spotlightBanner?.price) {
        updates["newArrivals.badge"] =
          config.newArrivals?.badge || DEFAULT_HOMEPAGE_CONFIG.newArrivals.badge;
        updates["newArrivals.title"] =
          config.newArrivals?.title || DEFAULT_HOMEPAGE_CONFIG.newArrivals.title;
        updates["newArrivals.spotlightBanner.badge"] =
          config.newArrivals?.spotlightBanner?.badge || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.badge;
        updates["newArrivals.spotlightBanner.title"] =
          config.newArrivals?.spotlightBanner?.title || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.title;
        updates["newArrivals.spotlightBanner.subtitle"] =
          config.newArrivals?.spotlightBanner?.subtitle || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.subtitle;
        updates["newArrivals.spotlightBanner.price"] =
          config.newArrivals?.spotlightBanner?.price || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.price;
        updates["newArrivals.spotlightBanner.buttonText"] =
          config.newArrivals?.spotlightBanner?.buttonText || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.buttonText;
        updates["newArrivals.spotlightBanner.buttonUrl"] =
          config.newArrivals?.spotlightBanner?.buttonUrl || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.buttonUrl;
        updates["newArrivals.spotlightBanner.imageUrl"] =
          config.newArrivals?.spotlightBanner?.imageUrl || DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.imageUrl;
      }

      if (Object.keys(updates).length > 0) {
        await HomepageConfig.updateOne({ _id: config._id }, { $set: updates });
        config = await HomepageConfig.findOne().lean();
      }
    }

    // ── Populate dealsSection with real product data ───────────────────────
    const dealsSection = config.dealsSection || {};
    const fallbackDiscount = Number(dealsSection.discountPercentage) || 15;
    let dealProducts = [];

    const rawIds = Array.isArray(dealsSection.dealProductIds)
      ? dealsSection.dealProductIds
      : [];

    const validIds = rawIds
      .map((item) => (item?._id ? item._id.toString() : item?.toString()))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length > 0) {
      const fetched = await Product.find({ _id: { $in: validIds } }).lean();
      const idMap = new Map(fetched.map((p) => [p._id.toString(), p]));
      dealProducts = validIds
        .map((id) => idMap.get(id))
        .filter(Boolean);
    }

    // Fallback automatically to top 8 featured or latest products if empty
    if (dealProducts.length === 0) {
      dealProducts = await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();
    }

    const formattedDealProducts = dealProducts.map((p) => {
      const safePrice = Number(p.price) || 0;
      return {
        _id: p._id.toString(),
        title: p.title || "Botanical Specimen",
        price: safePrice,
        originalPrice:
          p.originalPrice || Math.round(safePrice / (1 - fallbackDiscount / 100)),
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
        stock: p.stock_quantity ?? p.stock ?? 10,
        category: p.category || "plant",
        averageRating: p.averageRating || 5,
        reviewCount: p.reviewCount || 12,
        description: p.description || "",
      };
    });

    config.dealsSection = {
      ...dealsSection,
      dealProducts: formattedDealProducts,
      dealProductIds: formattedDealProducts,
    };

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("GET /api/homepage-config error:", error);
    // Instant solid fallback so homepage NEVER crashes or renders blank
    return NextResponse.json({
      success: true,
      config: DEFAULT_HOMEPAGE_CONFIG,
      isFallback: true,
    });
  }
}
