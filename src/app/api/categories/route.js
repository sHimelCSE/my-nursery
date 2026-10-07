import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    const categories = await Category.find({})
      .sort({ order: 1, createdAt: 1 })
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

    return NextResponse.json(
      {
        success: true,
        count: categoriesWithCounts.length,
        categories: categoriesWithCounts,
        data: categoriesWithCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories", error: error.message },
      { status: 500 }
    );
  }
}
