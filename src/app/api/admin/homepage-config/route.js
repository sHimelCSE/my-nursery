import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import HomepageConfig from "@/models/HomepageConfig";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();

    let config = await HomepageConfig.findOne().lean();

    if (!config) {
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

    if (config.dealsSection?.dealProductIds) {
      config.dealsSection.dealProductIds = config.dealsSection.dealProductIds.map((id) =>
        id?.toString ? id.toString() : String(id)
      );
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("GET /api/admin/homepage-config error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load config" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    await dbConnect();

    const updated = await HomepageConfig.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Homepage settings saved successfully",
      config: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/homepage-config error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update homepage settings" },
      { status: 500 }
    );
  }
}
