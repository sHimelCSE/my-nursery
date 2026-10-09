import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

      if (config.newArrivals?.showSpotlightBanner === undefined) {
        updates["newArrivals.showSpotlightBanner"] = true;
      }

      if (!Array.isArray(config.newArrivals?.tabs) || config.newArrivals.tabs.length === 0) {
        updates["newArrivals.tabs"] = DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs;
      }

      if (!config.topRankings?.badge || !Array.isArray(config.topRankings?.columns) || config.topRankings.columns.length === 0) {
        updates["topRankings.badge"] = config.topRankings?.badge || DEFAULT_HOMEPAGE_CONFIG.topRankings.badge;
        updates["topRankings.title"] = config.topRankings?.title || DEFAULT_HOMEPAGE_CONFIG.topRankings.title;
        updates["topRankings.subtitle"] = config.topRankings?.subtitle || DEFAULT_HOMEPAGE_CONFIG.topRankings.subtitle;
        updates["topRankings.viewAllText"] = config.topRankings?.viewAllText || DEFAULT_HOMEPAGE_CONFIG.topRankings.viewAllText;
        updates["topRankings.viewAllUrl"] = config.topRankings?.viewAllUrl || DEFAULT_HOMEPAGE_CONFIG.topRankings.viewAllUrl;
        updates["topRankings.columns"] = DEFAULT_HOMEPAGE_CONFIG.topRankings.columns;
      }

      if (!config.blogSection?.badge || !config.blogSection?.viewAllText) {
        updates["blogSection.badge"] = config.blogSection?.badge || DEFAULT_HOMEPAGE_CONFIG.blogSection.badge;
        updates["blogSection.title"] = config.blogSection?.title || DEFAULT_HOMEPAGE_CONFIG.blogSection.title;
        updates["blogSection.subtitle"] = config.blogSection?.subtitle || DEFAULT_HOMEPAGE_CONFIG.blogSection.subtitle;
        updates["blogSection.viewAllText"] = config.blogSection?.viewAllText || DEFAULT_HOMEPAGE_CONFIG.blogSection.viewAllText;
        updates["blogSection.viewAllUrl"] = config.blogSection?.viewAllUrl || DEFAULT_HOMEPAGE_CONFIG.blogSection.viewAllUrl;
        updates["blogSection.sourceMode"] = config.blogSection?.sourceMode || DEFAULT_HOMEPAGE_CONFIG.blogSection.sourceMode;
        updates["blogSection.displayCount"] = config.blogSection?.displayCount || DEFAULT_HOMEPAGE_CONFIG.blogSection.displayCount;
        updates["blogSection.selectedBlogIds"] = Array.isArray(config.blogSection?.selectedBlogIds) ? config.blogSection.selectedBlogIds : [];
      }

      if (!Array.isArray(config.guaranteeStrip?.items) || config.guaranteeStrip.items.length === 0) {
        updates["guaranteeStrip.items"] = DEFAULT_HOMEPAGE_CONFIG.guaranteeStrip.items;
      }

      if (Object.keys(updates).length > 0) {
        await HomepageConfig.updateOne({ _id: config._id }, { $set: updates });
        config = await HomepageConfig.findOne().lean();
      }
    }

    if (config.categoriesSection?.featuredCategoryIds) {
      config.categoriesSection.featuredCategoryIds = config.categoriesSection.featuredCategoryIds.map((id) =>
        id?._id ? id._id.toString() : (id?.toString ? id.toString() : String(id))
      );
    }

    if (config.dealsSection?.dealProductIds) {
      config.dealsSection.dealProductIds = config.dealsSection.dealProductIds.map((id) =>
        id?.toString ? id.toString() : String(id)
      );
    }

    if (config.blogSection?.selectedBlogIds) {
      config.blogSection.selectedBlogIds = config.blogSection.selectedBlogIds.map((id) =>
        id?._id ? id._id.toString() : (id?.toString ? id.toString() : String(id))
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

    if (Array.isArray(body.heroSlider?.slides)) {
      body.heroSlider.slides = body.heroSlider.slides.map((slide) => {
        const rawProdId = slide.featuredProductId?._id
          ? slide.featuredProductId._id.toString()
          : slide.featuredProductId?.toString();
        const validProdId =
          rawProdId && mongoose.Types.ObjectId.isValid(rawProdId)
            ? rawProdId
            : null;
        return {
          ...slide,
          featuredProductId: validProdId,
        };
      });
    }

    // Sanitize featuredCategoryIds if provided to prevent CastError on empty strings
    if (body.categoriesSection?.featuredCategoryIds) {
      body.categoriesSection.featuredCategoryIds = body.categoriesSection.featuredCategoryIds
        .map((id) => (typeof id === "object" && id?._id ? id._id.toString() : id?.toString()))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
    }

    if (body.dealsSection?.dealProductIds) {
      body.dealsSection.dealProductIds = body.dealsSection.dealProductIds
        .map((id) => (typeof id === "object" && id?._id ? id._id.toString() : id?.toString()))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
    }

    if (body.newArrivals) {
      if (body.newArrivals.showSpotlightBanner !== undefined) {
        body.newArrivals.showSpotlightBanner = Boolean(body.newArrivals.showSpotlightBanner);
      }
      if (Array.isArray(body.newArrivals.tabs)) {
        body.newArrivals.tabs = body.newArrivals.tabs.slice(0, 5).map((tab) => {
          const isCategory = tab.sourceType === "category";
          const rawCatId = tab.categoryId?._id
            ? tab.categoryId._id.toString()
            : tab.categoryId?.toString();
          const validCatId =
            isCategory && rawCatId && mongoose.Types.ObjectId.isValid(rawCatId)
              ? rawCatId
              : null;
          return {
            label: tab.label || "Tab",
            sourceType: isCategory ? "category" : "preset",
            presetFilter: tab.presetFilter || "all",
            categoryId: validCatId,
          };
        });
      }
    }

    if (body.topRankings) {
      if (body.topRankings.isEnabled !== undefined) {
        body.topRankings.isEnabled = Boolean(body.topRankings.isEnabled);
      }
      if (Array.isArray(body.topRankings.columns)) {
        body.topRankings.columns = body.topRankings.columns.slice(0, 3).map((col, cIdx) => ({
          title: col.title || `Column ${cIdx + 1}`,
          browseUrl: col.browseUrl || "/collections",
          items: (col.items || []).slice(0, 3).map((item, iIdx) => {
            const rawId = item.productId?._id
              ? item.productId._id.toString()
              : item.productId?.toString();
            const validId = rawId && mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;
            return {
              rank: Number(item.rank) || iIdx + 1,
              badge: item.badge || "Top Choice",
              productId: validId,
            };
          }),
        }));
      }
    }

    if (body.blogSection) {
      if (body.blogSection.isEnabled !== undefined) {
        body.blogSection.isEnabled = Boolean(body.blogSection.isEnabled);
      }
      if (body.blogSection.sourceMode !== undefined) {
        body.blogSection.sourceMode = body.blogSection.sourceMode === "selected" ? "selected" : "latest";
      }
      if (body.blogSection.displayCount !== undefined) {
        body.blogSection.displayCount = Number(body.blogSection.displayCount) === 6 ? 6 : 3;
      }
      if (body.blogSection.selectedBlogIds) {
        body.blogSection.selectedBlogIds = body.blogSection.selectedBlogIds
          .map((id) => (typeof id === "object" && id?._id ? id._id.toString() : id?.toString()))
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
      }
    }

    if (body.guaranteeStrip) {
      if (body.guaranteeStrip.isEnabled !== undefined) {
        body.guaranteeStrip.isEnabled = Boolean(body.guaranteeStrip.isEnabled);
      }
      if (Array.isArray(body.guaranteeStrip.items)) {
        body.guaranteeStrip.items = body.guaranteeStrip.items.slice(0, 4).map((item, idx) => ({
          icon: item.icon || "ShieldCheck",
          title: item.title || `Guarantee Pillar ${idx + 1}`,
          description: item.description || "",
        }));
      }
    }

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
