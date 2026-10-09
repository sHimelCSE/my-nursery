import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─────────────────────────────────────────────
// GET /api/products/[id]
// Fetch single product by Mongo ID
// ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    await dbConnect();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Live rating check from Review collection
    if (!product.reviewCount || product.reviewCount === 0 || product.avgRating === undefined) {
      try {
        const Review = (await import("@/models/Review")).default;
        const reviewStats = await Review.aggregate([
          {
            $match: {
              productId: new mongoose.Types.ObjectId(id),
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

        if (reviewStats.length > 0) {
          const count = reviewStats[0].count;
          const avg = Number(reviewStats[0].avg.toFixed(1));
          product.reviewCount = count;
          product.avgRating = avg;
          product.averageRating = avg;
          Product.findByIdAndUpdate(id, {
            reviewCount: count,
            avgRating: avg,
            averageRating: avg,
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Error aggregating reviews in /api/products/[id]:", err);
      }
    }

    if (product.avgRating === undefined && product.averageRating !== undefined) {
      product.avgRating = product.averageRating;
    }

    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product", error: error.message },
      { status: 500 }
    );
  }
}
