import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─────────────────────────────────────────────
// GET /api/products
// Supports: ?search=<query> & ?category=<plant|tool|fertilizer>
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // Build dynamic filter object
    const filter = {};

    if (category && category.toLowerCase() !== "all") {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Live rating calculation & self-healing from Review collection for ALL products
    if (products.length > 0) {
      const ids = products.map((p) => p._id);
      try {
        const stats = await Review.aggregate([
          {
            $match: {
              productId: { $in: ids },
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

        const statsMap = new Map();
        stats.forEach((s) => {
          statsMap.set(s._id.toString(), {
            count: s.count,
            avg: Number(s.avg.toFixed(1)),
          });
        });

        for (const p of products) {
          const stat = statsMap.get(p._id.toString());
          const realCount = stat ? stat.count : 0;
          const realAvg = stat ? stat.avg : 0;

          if (p.reviewCount !== realCount || p.avgRating !== realAvg || p.averageRating !== realAvg) {
            p.reviewCount = realCount;
            p.avgRating = realAvg;
            p.averageRating = realAvg;
            Product.findByIdAndUpdate(p._id, {
              reviewCount: realCount,
              avgRating: realAvg,
              averageRating: realAvg,
            }).catch(() => {});
          }
        }
      } catch (aggErr) {
        console.error("Error aggregating reviews in /api/products:", aggErr);
      }
    }

    // Self-heal known broken URLs (e.g. legacy 404 Snake Plant image)
    const BROKEN_URL = "https://images.unsplash.com/photo-1598880940371-c756e015fdef?w=600&q=80";
    const WORKING_SNAKE_PLANT = "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=600&q=80";
    for (const p of products) {
      if (p.avgRating === undefined && p.averageRating !== undefined) {
        p.avgRating = p.averageRating;
      }
      if (Array.isArray(p.images) && p.images.includes(BROKEN_URL)) {
        p.images = p.images.map((img) => (img === BROKEN_URL ? WORKING_SNAKE_PLANT : img));
        Product.findByIdAndUpdate(p._id, { images: p.images }).catch(() => {});
      }
    }

    return NextResponse.json(
      { success: true, count: products.length, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST /api/products
// Body: { title, description, price, category, images, stock_quantity, care_instructions }
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      title,
      description,
      price,
      category,
      images,
      stock_quantity,
      care_instructions,
    } = body;

    // Basic validation
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, message: "title, description, price, and category are required" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      images: images || [],
      stock_quantity: stock_quantity ?? 0,
      care_instructions: care_instructions || "",
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
