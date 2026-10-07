import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// GET /api/admin/reviews
export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch all reviews sorted by createdAt: -1 with populated product details
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .populate("productId", "title price images image category stock_quantity")
      .lean();

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
    const verifiedCount = reviews.filter(
      (r) => r.isVerified === true || r.isGoogleVerified === true
    ).length;
    const approvedCount = reviews.filter(
      (r) => (r.status || "approved") === "approved"
    ).length;
    const hiddenCount = reviews.filter((r) => r.status === "hidden").length;

    return NextResponse.json({
      success: true,
      reviews,
      summary: {
        totalReviews,
        avgRating,
        fiveStarCount,
        verifiedCount,
        approvedCount,
        hiddenCount,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
