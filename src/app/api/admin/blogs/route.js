import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import Product from "@/models/Product";
import { DEFAULT_BLOGS } from "@/constants/defaultBlogs";

export const dynamic = "force-dynamic";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

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

    // Auto-seed if empty
    const count = await Blog.countDocuments();
    if (count === 0) {
      const sampleProducts = await Product.find().limit(6).select("_id");
      const pIds = sampleProducts.map((p) => p._id);

      const seededBlogs = DEFAULT_BLOGS.map((b, idx) => ({
        ...b,
        relatedProducts: pIds.slice(idx * 2, idx * 2 + 3),
      }));

      await Blog.insertMany(seededBlogs);
    }

    const blogs = await Blog.find()
      .populate("relatedProducts", "title price images category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error("GET /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category = "Plant Care",
      author,
      readTime = "5 min read",
      relatedProducts = [],
      status = "published",
    } = body;

    if (!title?.trim() || !content?.trim() || !coverImage?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, content, and cover image are required.",
        },
        { status: 400 }
      );
    }

    let finalSlug = slugify(customSlug || title);
    if (!finalSlug) finalSlug = `article-${Date.now()}`;

    // Ensure slug uniqueness
    const existing = await Blog.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: (excerpt || title).trim(),
      content,
      coverImage: coverImage.trim(),
      category: category.trim() || "Plant Care",
      author: {
        name: author?.name?.trim() || "GreenLeaf Botanist",
        role: author?.role?.trim() || "Horticulture Specialist",
        avatar: author?.avatar?.trim() || "",
      },
      readTime: readTime?.trim() || "5 min read",
      relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
      status: ["published", "draft"].includes(status) ? status : "published",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Article published successfully",
        blog: newBlog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
