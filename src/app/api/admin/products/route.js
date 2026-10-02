import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// ─────────────────────────────────────────────
// GET /api/admin/products
// Fetch all products for admin management
// ─────────────────────────────────────────────
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
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/products
// Create new plant, tool, or fertilizer
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      costPrice,
      category,
      images,
      stock_quantity,
      care_instructions,
    } = body;

    if (!title || !description || price === undefined || !category) {
      return NextResponse.json(
        { success: false, message: "Title, description, price, and category are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure images is array
    const imageList = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === "string" && images.trim()
      ? [images.trim()]
      : ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"];

    const newProduct = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      category: category.toLowerCase().trim(),
      images: imageList,
      stock_quantity: Number(stock_quantity) || 0,
      care_instructions: (care_instructions || "").trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully!",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin/products
// Edit price, stock, care instructions, or details
// ─────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Sanitize numeric fields if provided
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.costPrice !== undefined) updates.costPrice = Number(updates.costPrice);
    if (updates.stock_quantity !== undefined)
      updates.stock_quantity = Number(updates.stock_quantity);

    if (updates.images && typeof updates.images === "string") {
      updates.images = updates.images.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully!",
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin/products
// Remove a product from inventory
// ─────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product "${deleted.title}" deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product", error: error.message },
      { status: 500 }
    );
  }
}
