import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SEED_CATEGORIES = [
  {
    name: "Living Plants",
    slug: "plant",
    description: "Indoor air-purifying foliage, succulents, and flowering specimens.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80",
    showInNavbar: true,
    order: 0,
  },
  {
    name: "Organic Fertilizers",
    slug: "fertilizer",
    description: "100% pure vermicompost, bone meal, and natural plant nutrients.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    showInNavbar: true,
    order: 1,
  },
  {
    name: "Tools & Ceramic Pots",
    slug: "tool",
    description: "Handcrafted drainage pots, shears, sprayers, and grow bags.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
    showInNavbar: true,
    order: 2,
  },
  {
    name: "Bonsai & Rare Palms",
    slug: "bonsai-plants",
    description: "Carefully sculpted statement bonsai and exotic slow-grown palms.",
    image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=600&q=80",
    showInNavbar: true,
    order: 3,
  },
];

// Helper to auto-seed if empty
async function ensureSeedCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_SEED_CATEGORIES);
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/categories
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();
    await ensureSeedCategories();

    const { searchParams } = new URL(request.url);
    const navbarOnly = searchParams.get("navbar") === "true";

    const filter = navbarOnly ? { showInNavbar: true } : {};
    const categories = await Category.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category: cat.slug },
            { category: cat.name },
            { category: cat.slug?.toLowerCase() },
            { category: cat.name?.toLowerCase() },
          ],
        });
        const catObj = typeof cat.toObject === "function" ? cat.toObject() : cat;
        return { ...catObj, productCount: count };
      })
    );

    return NextResponse.json({
      success: true,
      count: categoriesWithCounts.length,
      categories: categoriesWithCounts,
      data: categoriesWithCounts,
    });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/categories
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

    await dbConnect();
    const body = await request.json();
    const { name, slug, description, image, showInNavbar, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: cleanSlug }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A category with this name or slug already exists." },
        { status: 409 }
      );
    }

    const highest = await Category.findOne().sort({ order: -1 }).select("order");
    const nextOrder = order !== undefined ? Number(order) : highest ? (highest.order || 0) + 1 : 0;

    const newCategory = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      description: (description || "").trim(),
      image: (image || "").trim(),
      showInNavbar: showInNavbar !== undefined ? Boolean(showInNavbar) : true,
      order: nextOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully!",
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT /api/admin/categories
// ─────────────────────────────────────────────
export async function PUT(request) {
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
    const { _id, id, name, slug, description, image, showInNavbar, order } = body;

    const targetId = _id || id;
    if (!targetId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required for update" },
        { status: 400 }
      );
    }

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

    const updated = await Category.findByIdAndUpdate(targetId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully!",
      category: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin/categories
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

    await dbConnect();
    const { searchParams } = new URL(request.url);
    let targetId = searchParams.get("id");

    if (!targetId) {
      try {
        const body = await request.json();
        targetId = body.id || body._id;
      } catch {
        // body might be empty if query param was intended
      }
    }

    if (!targetId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required for deletion" },
        { status: 400 }
      );
    }

    const deleted = await Category.findByIdAndDelete(targetId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully!",
      category: deleted,
    });
  } catch (error) {
    console.error("DELETE /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
