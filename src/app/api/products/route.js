import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

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

    if (category && ["plant", "tool", "fertilizer"].includes(category)) {
      filter.category = category;
    }

    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

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
