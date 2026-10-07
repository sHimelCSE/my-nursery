import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import Product from "@/models/Product";
import { DEFAULT_BLOGS } from "@/constants/defaultBlogs";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Auto-seed if collection is empty
    const count = await Blog.countDocuments();
    if (count === 0) {
      // Find sample products to attach to seed blogs
      const sampleProducts = await Product.find().limit(6).select("_id");
      const pIds = sampleProducts.map((p) => p._id);

      const seededBlogs = DEFAULT_BLOGS.map((b, idx) => ({
        ...b,
        relatedProducts: pIds.slice(idx * 2, idx * 2 + 3),
      }));

      await Blog.insertMany(seededBlogs);
    }

    const query = { status: "published" };

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let queryBuilder = Blog.find(query).sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit, 10))) {
      queryBuilder = queryBuilder.limit(parseInt(limit, 10));
    }

    const blogs = await queryBuilder.lean();

    return NextResponse.json({
      success: true,
      blogs,
      count: blogs.length,
    });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blogs", blogs: [] },
      { status: 500 }
    );
  }
}
