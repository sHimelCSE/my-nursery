import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";

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
      shortDescription,
      fullDescriptionHtml,
      price,
      costPrice,
      originalPrice,
      category,
      categories,
      images,
      stock_quantity,
      care_instructions,
      hasVariants,
      variantGroupTitle,
      variants,
      showCareGuideBadges,
      careBadges,
      hasCareGuide,
      careGuide,
      customTabTitle,
      tags,
    } = body;

    if (!title || (!description && !shortDescription) || price === undefined || (!category && (!categories || categories.length === 0))) {
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

    const tagList = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === "string" && tags.trim()
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Sanitize categories array
    let cleanCategories = Array.isArray(categories)
      ? categories.map((c) => String(c?._id || c).trim()).filter(Boolean)
      : [];

    let primaryCategory = category ? category.toLowerCase().trim() : "";
    if (!primaryCategory && cleanCategories.length > 0) {
      const firstCatDoc = await Category.findById(cleanCategories[0]).select("slug name").lean();
      primaryCategory = firstCatDoc?.slug || firstCatDoc?.name?.toLowerCase().replace(/\s+/g, "-") || "plant";
    }
    if (!primaryCategory) primaryCategory = "plant";

    const newProduct = await Product.create({
      title: title.trim(),
      description: (description || shortDescription || "").trim(),
      shortDescription: (shortDescription || "").trim(),
      fullDescriptionHtml: (fullDescriptionHtml || "").trim(),
      price: Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      originalPrice: Number(originalPrice) || 0,
      categories: cleanCategories,
      category: primaryCategory,
      tags: tagList,
      images: imageList,
      stock_quantity: Number(stock_quantity) || 0,
      care_instructions: (care_instructions || "").trim(),
      hasVariants: Boolean(hasVariants),
      variantGroupTitle: (variantGroupTitle || "Select Option").trim(),
      variants: Array.isArray(variants) ? variants : [],
      showCareGuideBadges: showCareGuideBadges !== false,
      careBadges: careBadges || {
        sunlight: "Medium Indirect",
        water: "Once a week",
        petSafe: "Non-Toxic",
        difficulty: "Beginner",
      },
      hasCareGuide: hasCareGuide !== false,
      careGuide: careGuide || {
        lightLocation: "",
        hydrationWatering: "",
        safetyDifficulty: "",
        horticulturistNote: "",
      },
      customTabTitle: (customTabTitle || "Botanical Background & Characteristics").trim(),
    });

    try {
      revalidateTag("products");
    } catch {}

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
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock_quantity !== undefined)
      updates.stock_quantity = Number(updates.stock_quantity);

    if (updates.images && typeof updates.images === "string") {
      updates.images = updates.images.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (updates.tags !== undefined) {
      updates.tags = Array.isArray(updates.tags)
        ? updates.tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof updates.tags === "string" && updates.tags.trim()
        ? updates.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    if (Array.isArray(updates.variants)) {
      updates.variants = updates.variants.map((v) => ({
        ...v,
        name: v.name?.trim() || "Option",
        price: Number(v.price) || 0,
        originalPrice: Number(v.originalPrice) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku?.trim() || "",
      }));
    }

    if (updates.categories !== undefined) {
      updates.categories = Array.isArray(updates.categories)
        ? updates.categories.map((c) => String(c?._id || c).trim()).filter(Boolean)
        : [];
      if (!updates.category && updates.categories.length > 0) {
        const firstCatDoc = await Category.findById(updates.categories[0]).select("slug name").lean();
        if (firstCatDoc) {
          updates.category = firstCatDoc.slug || firstCatDoc.name?.toLowerCase().replace(/\s+/g, "-");
        }
      }
    }

    if (updates.title) {
      const { getUniqueSlug } = await import("@/models/Product");
      updates.slug = await getUniqueSlug(Product, updates.title, productId);
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

    try {
      revalidateTag("products");
    } catch {}

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

    try {
      revalidateTag("products");
    } catch {}

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
