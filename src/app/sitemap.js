import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Blog from "@/models/Blog";

export const revalidate = 3600; // Cache and revalidate sitemap every hour

export default async function sitemap() {
  const baseUrl = "https://my-nursery-flame.vercel.app";
  const now = new Date();

  // 1. Guaranteed Static Routes (Always available even if DB fails)
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/track-order`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    await dbConnect();

    const [products, categories, blogs] = await Promise.all([
      Product.find({}, "_id slug updatedAt").lean(),
      Category.find({}, "slug updatedAt").lean(),
      Blog.find({ status: "published" }, "slug updatedAt").lean(),
    ]);

    const productRoutes = (products || [])
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "daily",
        priority: 0.8,
      }));

    const categoryRoutes = (categories || []).map((c) => ({
      url: `${baseUrl}/collections/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogRoutes = (blogs || []).map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
  } catch (err) {
    console.error("Sitemap DB fetch error:", err);
    // Return static routes fallback so Google Search Console NEVER sees a 500 error!
    return staticRoutes;
  }
}
