import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import HomepageConfig from "@/models/HomepageConfig";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Blog from "@/models/Blog";
import Review from "@/models/Review";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";
import { DEFAULT_BLOGS } from "@/constants/defaultBlogs";

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

    // ── Populate heroSlider slides with real featuredProductId ──────────────
    const heroSlider = config.heroSlider || {};
    const rawSlides = Array.isArray(heroSlider.slides) && heroSlider.slides.length > 0
      ? heroSlider.slides
      : DEFAULT_HOMEPAGE_CONFIG.heroSlider.slides;

    const slideProductIds = rawSlides
      .map((s) => (s.featuredProductId?._id ? s.featuredProductId._id.toString() : s.featuredProductId?.toString()))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    let slideProductMap = new Map();
    let slideReviewMap = new Map();
    if (slideProductIds.length > 0) {
      const fetchedSlideProducts = await Product.find({ _id: { $in: slideProductIds } }).lean();
      slideProductMap = new Map(fetchedSlideProducts.map((p) => [p._id.toString(), p]));

      const slideStats = await Review.aggregate([
        {
          $match: {
            productId: { $in: slideProductIds.map((id) => new mongoose.Types.ObjectId(id)) },
            status: { $ne: "hidden" },
          },
        },
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 },
            avg: { $avg: "$rating" },
          },
        },
      ]);
      slideStats.forEach((s) => {
        slideReviewMap.set(s._id.toString(), {
          count: s.count,
          avg: Number(s.avg.toFixed(1)),
        });
      });
    }

    const populatedSlides = rawSlides.map((slide) => {
      const rawProdId = slide.featuredProductId?._id
        ? slide.featuredProductId._id.toString()
        : slide.featuredProductId?.toString();
      const prod = rawProdId ? slideProductMap.get(rawProdId) : null;

      let featuredProduct = null;
      if (prod) {
        const rev = slideReviewMap.get(prod._id.toString());
        const realCount = rev ? rev.count : 0;
        const realAvg = rev ? rev.avg : 0;
        featuredProduct = {
          _id: prod._id.toString(),
          title: prod.title || "Botanical Specimen",
          price: Number(prod.price) || 0,
          originalPrice: Number(prod.originalPrice) || 0,
          images: Array.isArray(prod.images) ? prod.images : [],
          image: (Array.isArray(prod.images) && prod.images[0]) || prod.image || "",
          avgRating: realAvg,
          averageRating: realAvg,
          reviewCount: realCount,
          category: prod.category || "plant",
        };
      }

      return {
        ...slide,
        _id: slide._id ? slide._id.toString() : undefined,
        featuredProductId: featuredProduct,
      };
    });

    config.heroSlider = {
      ...heroSlider,
      isEnabled: heroSlider.isEnabled !== false,
      slides: populatedSlides,
    };

    // ── Populate categoriesSection with 4 featured categories ───────────────
    const categoriesSection = config.categoriesSection || {};
    const rawCategoryIds = Array.isArray(categoriesSection.featuredCategoryIds)
      ? categoriesSection.featuredCategoryIds
      : [];

    const validCategoryIds = rawCategoryIds
      .map((item) => (item?._id ? item._id.toString() : item?.toString()))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    let featuredCategories = [];

    if (validCategoryIds.length > 0) {
      const fetched = await Category.find({ _id: { $in: validCategoryIds } }).lean();
      const idMap = new Map(fetched.map((c) => [c._id.toString(), c]));
      featuredCategories = validCategoryIds
        .map((id) => idMap.get(id))
        .filter(Boolean);
    }

    // Fallback automatically if empty or no valid IDs matched: fetch first 4 active categories from MongoDB
    if (featuredCategories.length === 0) {
      featuredCategories = await Category.find({})
        .sort({ order: 1, createdAt: 1 })
        .limit(4)
        .lean();
    }

    // For each populated category, calculate its real product count
    const populatedCategories = await Promise.all(
      featuredCategories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category: cat.slug },
            { category: cat.name },
            { category: cat.slug?.toLowerCase() },
            { category: cat.name?.toLowerCase() },
          ],
        });
        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          image: cat.image || "",
          description: cat.description || "",
          productCount: count,
        };
      })
    );

    config.categoriesSection = {
      ...categoriesSection,
      featuredCategoryIds: populatedCategories,
    };

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

    // Calculate real review stats for deal products
    const dealProductIds = dealProducts.map((p) => p._id);
    const dealStats = await Review.aggregate([
      {
        $match: {
          productId: { $in: dealProductIds },
          status: { $ne: "hidden" },
        },
      },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 },
          avg: { $avg: "$rating" },
        },
      },
    ]);
    const dealReviewMap = new Map();
    dealStats.forEach((s) => {
      dealReviewMap.set(s._id.toString(), {
        count: s.count,
        avg: Number(s.avg.toFixed(1)),
      });
    });

    const formattedDealProducts = dealProducts.map((p) => {
      const safePrice = Number(p.price) || 0;
      const rev = dealReviewMap.get(p._id.toString());
      const realCount = rev ? rev.count : 0;
      const realAvg = rev ? rev.avg : 0;
      return {
        _id: p._id.toString(),
        title: p.title || "Botanical Specimen",
        price: safePrice,
        originalPrice:
          p.originalPrice || Math.round(safePrice / (1 - fallbackDiscount / 100)),
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
        stock: p.stock_quantity ?? p.stock ?? 10,
        category: p.category || "plant",
        avgRating: realAvg,
        averageRating: realAvg,
        reviewCount: realCount,
        description: p.description || "",
      };
    });

    config.dealsSection = {
      ...dealsSection,
      dealProducts: formattedDealProducts,
      dealProductIds: formattedDealProducts,
    };

    // ── Populate newArrivals tabs with category metadata if applicable ──────
    const newArrivals = config.newArrivals || {};
    let rawTabs = Array.isArray(newArrivals.tabs) && newArrivals.tabs.length > 0
      ? newArrivals.tabs
      : DEFAULT_HOMEPAGE_CONFIG.newArrivals.tabs;

    const categoryTabIds = rawTabs
      .filter((t) => t.sourceType === "category" && t.categoryId)
      .map((t) => (t.categoryId?._id ? t.categoryId._id.toString() : t.categoryId.toString()))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    let catMap = new Map();
    if (categoryTabIds.length > 0) {
      const catDocs = await Category.find({ _id: { $in: categoryTabIds } }).lean();
      catMap = new Map(catDocs.map((c) => [c._id.toString(), c]));
    }

    const populatedTabs = rawTabs.slice(0, 5).map((t) => {
      if (t.sourceType === "category" && t.categoryId) {
        const rawId = t.categoryId?._id ? t.categoryId._id.toString() : t.categoryId.toString();
        const cat = catMap.get(rawId);
        return {
          _id: t._id ? t._id.toString() : undefined,
          label: t.label,
          sourceType: "category",
          presetFilter: t.presetFilter || "all",
          categoryId: cat
            ? { _id: cat._id.toString(), name: cat.name, slug: cat.slug }
            : null,
        };
      }
      return {
        _id: t._id ? t._id.toString() : undefined,
        label: t.label,
        sourceType: t.sourceType || "preset",
        presetFilter: t.presetFilter || "all",
        categoryId: null,
      };
    });

    config.newArrivals = {
      ...newArrivals,
      showSpotlightBanner: newArrivals.showSpotlightBanner !== false,
      tabs: populatedTabs,
    };

    // ── Populate topRankings columns items with real product data ──────────
    const topRankings = config.topRankings || {};
    const rawColumns = Array.isArray(topRankings.columns) && topRankings.columns.length > 0
      ? topRankings.columns
      : DEFAULT_HOMEPAGE_CONFIG.topRankings.columns;

    const allItemProductIds = [];
    rawColumns.forEach((col) => {
      (col.items || []).forEach((item) => {
        const rawId = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
          allItemProductIds.push(rawId);
        }
      });
    });

    let rankingProductMap = new Map();
    if (allItemProductIds.length > 0) {
      const fetchedProducts = await Product.find({ _id: { $in: allItemProductIds } }).lean();
      rankingProductMap = new Map(fetchedProducts.map((p) => [p._id.toString(), p]));
    }

    // Fallback pool of active / top-rated products if any slots are unassigned
    const unassignedCount = rawColumns.reduce(
      (acc, col) =>
        acc +
        (col.items || []).filter((item) => {
          const rawId = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
          return !rawId || !rankingProductMap.has(rawId);
        }).length,
      0
    );

    let fallbackRankingPool = [];
    if (unassignedCount > 0) {
      fallbackRankingPool = await Product.find({})
        .sort({ averageRating: -1, reviewCount: -1, createdAt: -1 })
        .limit(Math.max(10, unassignedCount + 3))
        .lean();
    }

    let fallbackPoolIdx = 0;

    // Calculate real review stats for ranking products
    const rankingObjIds = (allItemProductIds.concat(fallbackRankingPool.map(p => p._id.toString())))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    let rankingReviewMap = new Map();
    if (rankingObjIds.length > 0) {
      const rStats = await Review.aggregate([
        {
          $match: {
            productId: { $in: rankingObjIds },
            status: { $ne: "hidden" },
          },
        },
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 },
            avg: { $avg: "$rating" },
          },
        },
      ]);
      rStats.forEach((s) => {
        rankingReviewMap.set(s._id.toString(), {
          count: s.count,
          avg: Number(s.avg.toFixed(1)),
        });
      });
    }

    const populatedColumns = rawColumns.slice(0, 3).map((col, cIdx) => {
      const items = (col.items || []).slice(0, 3).map((item, iIdx) => {
        const rawId = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        let prod = rawId ? rankingProductMap.get(rawId) : null;
        if (!prod && fallbackRankingPool.length > 0) {
          prod = fallbackRankingPool[fallbackPoolIdx % fallbackRankingPool.length];
          fallbackPoolIdx++;
        }

        const safePrice = prod ? (Number(prod.price) || 0) : 0;
        const safeImage = prod
          ? (Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images[0]
              : prod.image || "")
          : "";

        const rev = prod ? rankingReviewMap.get(prod._id.toString()) : null;
        const realCount = rev ? rev.count : 0;
        const realAvg = rev ? rev.avg : 0;

        return {
          _id: item._id ? item._id.toString() : undefined,
          rank: Number(item.rank) || iIdx + 1,
          badge: item.badge || "Top Choice",
          productId: prod
            ? {
                _id: prod._id.toString(),
                title: prod.title || "Botanical Specimen",
                price: safePrice,
                formattedPrice: `৳${safePrice.toLocaleString()}`,
                image: safeImage,
                images: Array.isArray(prod.images) ? prod.images : [],
                avgRating: realAvg,
                averageRating: realAvg,
                reviewCount: realCount,
                category: prod.category || "plant",
              }
            : null,
        };
      });

      return {
        _id: col._id ? col._id.toString() : undefined,
        title: col.title || `Ranking Column ${cIdx + 1}`,
        browseUrl: col.browseUrl || "/collections",
        items,
      };
    });

    config.topRankings = {
      ...topRankings,
      isEnabled: topRankings.isEnabled !== false,
      badge: topRankings.badge || DEFAULT_HOMEPAGE_CONFIG.topRankings.badge,
      title: topRankings.title || DEFAULT_HOMEPAGE_CONFIG.topRankings.title,
      subtitle: topRankings.subtitle || DEFAULT_HOMEPAGE_CONFIG.topRankings.subtitle,
      viewAllText: topRankings.viewAllText || DEFAULT_HOMEPAGE_CONFIG.topRankings.viewAllText,
      viewAllUrl: topRankings.viewAllUrl || DEFAULT_HOMEPAGE_CONFIG.topRankings.viewAllUrl,
      columns: populatedColumns,
    };

    // ── Populate blogSection with real blog posts ──────────────────────────
    const blogSection = config.blogSection || {};
    const sourceMode = blogSection.sourceMode || "latest";
    const displayCount = Number(blogSection.displayCount) === 6 ? 6 : 3;
    let populatedBlogs = [];

    if (sourceMode === "selected" && Array.isArray(blogSection.selectedBlogIds) && blogSection.selectedBlogIds.length > 0) {
      const rawBlogIds = blogSection.selectedBlogIds
        .map((item) => (item?._id ? item._id.toString() : item?.toString()))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

      if (rawBlogIds.length > 0) {
        const fetchedBlogs = await Blog.find({ _id: { $in: rawBlogIds } }).lean();
        const bMap = new Map(fetchedBlogs.map((b) => [b._id.toString(), b]));
        populatedBlogs = rawBlogIds.map((id) => bMap.get(id)).filter(Boolean);
      }
    }

    // Fallback if sourceMode === 'latest' or selected blogs were empty/insufficient
    if (populatedBlogs.length === 0) {
      populatedBlogs = await Blog.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(displayCount)
        .lean();
    }

    // Fallback if collection in DB is empty
    if (populatedBlogs.length === 0) {
      populatedBlogs = DEFAULT_BLOGS.slice(0, displayCount);
    }

    config.blogSection = {
      ...blogSection,
      isEnabled: blogSection.isEnabled !== false,
      badge: blogSection.badge || DEFAULT_HOMEPAGE_CONFIG.blogSection.badge,
      title: blogSection.title || DEFAULT_HOMEPAGE_CONFIG.blogSection.title,
      subtitle: blogSection.subtitle || DEFAULT_HOMEPAGE_CONFIG.blogSection.subtitle,
      viewAllText: blogSection.viewAllText || DEFAULT_HOMEPAGE_CONFIG.blogSection.viewAllText,
      viewAllUrl: blogSection.viewAllUrl || DEFAULT_HOMEPAGE_CONFIG.blogSection.viewAllUrl,
      sourceMode: sourceMode,
      displayCount: displayCount,
      selectedBlogIds: Array.isArray(blogSection.selectedBlogIds)
        ? blogSection.selectedBlogIds.map((id) => (id?._id ? id._id.toString() : id?.toString()))
        : [],
      blogs: populatedBlogs,
    };

    // ── Populate guaranteeStrip ─────────────────────────────────────────────
    const guaranteeStrip = config.guaranteeStrip || {};
    config.guaranteeStrip = {
      ...guaranteeStrip,
      isEnabled: guaranteeStrip.isEnabled !== false,
      items:
        Array.isArray(guaranteeStrip.items) && guaranteeStrip.items.length > 0
          ? guaranteeStrip.items
          : DEFAULT_HOMEPAGE_CONFIG.guaranteeStrip.items,
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

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Sanitize heroSlider slides if provided
    if (body.heroSlider?.slides && Array.isArray(body.heroSlider.slides)) {
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
    console.error("PUT /api/homepage-config error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update homepage settings" },
      { status: 500 }
    );
  }
}
