import { unstable_cache } from "next/cache";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import HomepageConfig from "@/models/HomepageConfig";
import Blog from "@/models/Blog";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";


/**
 * 1. Cache single product details by slug
 * Cached for 1 hour, tagged for on-demand revalidation
 */
export const getCachedProductBySlug = unstable_cache(
  async (slug) => {
    if (!slug) return null;
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  },
  ["product-by-slug"],
  {
    revalidate: 3600, // Revalidate background every 1 hour
    tags: ["products"],
  }
);

/**
 * 2. Cache category lookup by slug or name
 */
export const getCachedCategoryBySlug = unstable_cache(
  async (categorySlugOrName) => {
    if (!categorySlugOrName) return null;
    await dbConnect();
    const regex = new RegExp(`^${categorySlugOrName.toString().trim()}$`, "i");
    const category = await Category.findOne({
      $or: [{ slug: regex }, { name: regex }],
    }).lean();
    if (!category) return null;
    return JSON.parse(JSON.stringify(category));
  },
  ["category-by-slug"],
  {
    revalidate: 3600,
    tags: ["categories"],
  }
);

/**
 * 3. Cache all products for catalog / listing
 */
export const getCachedAllProducts = unstable_cache(
  async () => {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products || []));
  },
  ["all-products"],
  {
    revalidate: 3600,
    tags: ["products"],
  }
);

/**
 * 4. Cache all active categories with accurate productCount
 */
export const getCachedAllCategories = unstable_cache(
  async () => {
    await dbConnect();
    const categories = await Category.find({ isUnlisted: { $ne: true } })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const categoriesWithRealCounts = await Promise.all(
      (categories || []).map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { categories: cat._id },
            { category: cat.slug },
            { category: cat.name },
            { category: new RegExp(`^${cat.slug}$`, "i") },
            { category: new RegExp(`^${cat.name}$`, "i") },
            { categoryId: cat._id },
            { category: cat._id },
          ],
        });
        return {
          ...cat,
          productCount: count,
        };
      })
    );

    return JSON.parse(JSON.stringify(categoriesWithRealCounts));
  },
  ["all-categories"],
  {
    revalidate: 3600,
    tags: ["categories"],
  }
);

/**
 * 5. Cache homepage configuration with populated heroSlider and categoriesSection
 */
export const getCachedHomepageConfig = unstable_cache(
  async () => {
    await dbConnect();
    let config = await HomepageConfig.findOne()
      .populate({
        path: "heroSlider.slides.featuredProductId",
        model: "Product",
        select:
          "title price originalPrice images image slug stock stock_quantity avgRating reviewCount category",
      })
      .populate({
        path: "categoriesSection.featuredCategoryIds",
        model: "Category",
      })
      .populate({
        path: "newArrivals.tabs.categoryId",
        model: "Category",
        select: "_id name slug isUnlisted",
      })
      .lean();

    if (!config) return DEFAULT_HOMEPAGE_CONFIG;

    // Ensure newArrivals tabs categoryId is fully populated with all metadata
    if (config.newArrivals?.tabs && Array.isArray(config.newArrivals.tabs)) {
      const categoryTabIds = config.newArrivals.tabs
        .filter((t) => t.sourceType === "category" && t.categoryId)
        .map((t) => (t.categoryId?._id ? t.categoryId._id.toString() : t.categoryId?.toString()))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

      let catMap = new Map();
      if (categoryTabIds.length > 0) {
        const catDocs = await Category.find({ _id: { $in: categoryTabIds } })
          .select("_id name slug isUnlisted")
          .lean();
        catMap = new Map(catDocs.map((c) => [c._id.toString(), c]));
      }

      config.newArrivals.tabs = config.newArrivals.tabs.slice(0, 5).map((t) => {
        if (t.sourceType === "category" && t.categoryId) {
          const rawId = t.categoryId?._id ? t.categoryId._id.toString() : t.categoryId?.toString();
          const cat = catMap.get(rawId) || (typeof t.categoryId === "object" ? t.categoryId : null);
          return {
            ...t,
            categoryId: cat
              ? {
                  _id: (cat._id || cat.id)?.toString(),
                  name: cat.name,
                  slug: cat.slug,
                  isUnlisted: cat.isUnlisted,
                }
              : null,
          };
        }
        return t;
      });
    }

    // Fallback if no featured categories were explicitly selected: fetch 4 active categories
    let featuredCats = config.categoriesSection?.featuredCategoryIds;
    if (!Array.isArray(featuredCats) || featuredCats.length === 0) {
      featuredCats = await Category.find({ isUnlisted: { $ne: true } })
        .sort({ order: 1, createdAt: 1 })
        .limit(4)
        .lean();
    }

    // Populate accurate productCount for featured categories
    const categoriesWithRealCounts = await Promise.all(
      (featuredCats || []).map(async (cat) => {
        if (!cat || typeof cat !== "object") return cat;
        const count = await Product.countDocuments({
          $or: [
            { categories: cat._id },
            { category: cat.slug },
            { category: cat.name },
            { category: new RegExp(`^${cat.slug}$`, "i") },
            { category: new RegExp(`^${cat.name}$`, "i") },
            { categoryId: cat._id },
            { category: cat._id },
          ],
        });
        return {
          ...cat,
          productCount: count,
        };
      })
    );

    if (config.categoriesSection) {
      config.categoriesSection.featuredCategoryIds = categoriesWithRealCounts;
    }

    return JSON.parse(JSON.stringify(config));
  },
  ["homepage-config"],
  {
    revalidate: 3600,
    tags: ["homepage-config"],
  }
);

/**
 * 6. Cache recent blogs for homepage
 */
export const getCachedRecentBlogs = unstable_cache(
  async () => {
    await dbConnect();
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    return JSON.parse(JSON.stringify(blogs || []));
  },
  ["recent-blogs"],
  {
    revalidate: 3600,
    tags: ["blogs"],
  }
);

