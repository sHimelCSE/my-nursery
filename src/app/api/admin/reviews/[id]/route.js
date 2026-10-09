import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// PATCH /api/admin/reviews/[id] - Toggle approved/hidden status
export async function PATCH(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    let nextStatus;
    try {
      const body = await request.json();
      if (body && body.status && ["approved", "hidden"].includes(body.status)) {
        nextStatus = body.status;
      }
    } catch {
      // Body may be empty if simple toggle requested
    }

    if (!nextStatus) {
      nextStatus = review.status === "hidden" ? "approved" : "hidden";
    }

    review.status = nextStatus;
    await review.save();

    // Recalculate associated product's average rating and reviewCount from approved reviews
    if (review.productId) {
      const approvedReviews = await Review.find({
        productId: review.productId,
        status: { $ne: "hidden" },
      }).lean();

      const count = approvedReviews.length;
      const avg =
        count > 0
          ? Number(
              (
                approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                count
              ).toFixed(1)
            )
          : 0;

      await Product.findByIdAndUpdate(review.productId, {
        avgRating: avg,
        averageRating: avg,
        reviewCount: count,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Review status updated to ${nextStatus}`,
      review,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Permanently delete review
export async function DELETE(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(id);

    // Recalculate associated product's average rating & reviewCount
    if (productId) {
      const approvedReviews = await Review.find({
        productId,
        status: { $ne: "hidden" },
      }).lean();

      const count = approvedReviews.length;
      const avg =
        count > 0
          ? Number(
              (
                approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                count
              ).toFixed(1)
            )
          : 0;

      await Product.findByIdAndUpdate(productId, {
        avgRating: avg,
        averageRating: avg,
        reviewCount: count,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted permanently",
    });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
