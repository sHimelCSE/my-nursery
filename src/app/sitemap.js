import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Blog from "@/models/Blog";
import Category from "@/models/Category";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap() {
  const baseUrl = "https://my-nursery-flame.vercel.app";
  const now = new Date();

  // Static core routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let productRoutes = [];
  let blogRoutes = [];
  let categoryRoutes = [];

  try {
    await dbConnect();

    // Query active products
    const products = await Product.find({}, "_id updatedAt createdAt").lean();
    if (Array.isArray(products)) {
      productRoutes = products.map((item) => ({
        url: `${baseUrl}/products/${item._id}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }

    // Query published blogs
    const blogs = await Blog.find({}, "slug updatedAt createdAt").lean();
    if (Array.isArray(blogs)) {
      blogRoutes = blogs.map((item) => ({
        url: `${baseUrl}/blog/${item.slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }

    // Query categories
    const categories = await Category.find({}, "slug updatedAt createdAt").lean();
    if (Array.isArray(categories)) {
      categoryRoutes = categories.map((item) => ({
        url: `${baseUrl}/collections?category=${item.slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap from MongoDB:", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
