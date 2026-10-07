import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    // Ensure Product model is registered in Mongoose for population
    const _dummyProduct = Product;

    const blog = await Blog.findOne({
      slug: slug.toLowerCase(),
      status: "published",
    })
      .populate({
        path: "relatedProducts",
        select: "title price costPrice category images stock_quantity care_instructions averageRating reviewCount",
      })
      .lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog article not found" },
        { status: 404 }
      );
    }

    // Fetch up to 3 other related guides for recommendation
    const relatedBlogs = await Blog.find({
      status: "published",
      slug: { $ne: blog.slug },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title slug excerpt coverImage category readTime createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      blog,
      relatedBlogs,
    });
  } catch (error) {
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blog article" },
      { status: 500 }
    );
  }
}
