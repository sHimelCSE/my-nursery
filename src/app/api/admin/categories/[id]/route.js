import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// GET /api/admin/categories/[id]
// ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Find all products assigned to this category
    const assignedProducts = await Product.find({
      $or: [
        { categories: category._id },
        { category: category.slug },
        { category: category.name },
        { categoryId: category._id },
      ],
    })
      .select("_id title price image images stock_quantity category categories")
      .lean();

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        productCount: assignedProducts.length,
        productIds: assignedProducts.map((p) => p._id.toString()),
        products: assignedProducts,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT /api/admin/categories/[id]
// ─────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const categoryId = id;
    await dbConnect();

    const body = await request.json();
    const { name, slug, description, image, showInNavbar, order, isUnlisted, productIds } = body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (slug) {
      updateFields.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
    }
    if (description !== undefined) updateFields.description = description.trim();
    if (image !== undefined) updateFields.image = image.trim();
    if (showInNavbar !== undefined) updateFields.showInNavbar = Boolean(showInNavbar);
    if (order !== undefined) updateFields.order = Number(order);
    if (isUnlisted !== undefined) updateFields.isUnlisted = Boolean(isUnlisted);

    const updated = await Category.findByIdAndUpdate(categoryId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Bidirectional sync: assign/unassign products
    if (Array.isArray(productIds)) {
      // Add categoryId to checked products
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { categories: categoryId } }
      );
      // Remove categoryId from unchecked products
      await Product.updateMany(
        { _id: { $nin: productIds }, categories: categoryId },
        { $pull: { categories: categoryId } }
      );
    }

    try {
      revalidateTag("categories");
      revalidateTag("products");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Category updated and products synchronized successfully!",
      category: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}
