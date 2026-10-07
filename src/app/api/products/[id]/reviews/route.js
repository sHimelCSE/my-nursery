import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { authOptions } from "@/lib/authOptions";

// GET /api/products/[id]/reviews
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const productObjectId = new mongoose.Types.ObjectId(id);

    // Fetch reviews (excluding hidden reviews) sorted newest first
    const reviews = await Review.find({
      productId: productObjectId,
      status: { $ne: "hidden" },
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      success: true,
      reviews,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Review comment must be at least 5 characters long",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const productObjectId = new mongoose.Types.ObjectId(id);
    const product = await Product.findById(productObjectId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if session exists for verified badge
    const session = await getServerSession(authOptions);
    const isLoggedIn = Boolean(session && session.user);

    let userName = "";
    let userEmail = "";
    let userImage = "";
    let userId = undefined;
    let isVerified = false;

    if (isLoggedIn) {
      // Logged in user: Grant Verified status
      isVerified = true;
      userName =
        (session.user.name || body.userName || "Verified Customer").trim();
      userEmail = session.user.email || "";
      userImage = session.user.image || "";
      userId =
        session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)
          ? new mongoose.Types.ObjectId(session.user.id)
          : undefined;
    } else {
      // Guest: Not logged in, no verified badge
      isVerified = false;
      userName = (body.userName || "").trim();

      if (!userName || userName.length < 2) {
        return NextResponse.json(
          { success: false, error: "Please enter your name" },
          { status: 400 }
        );
      }
    }

    // Create review in MongoDB
    const newReview = await Review.create({
      productId: productObjectId,
      userId,
      userName,
      userEmail,
      userImage,
      rating: numRating,
      comment: comment.trim(),
      isVerified,
      isGoogleVerified: isVerified,
      createdAt: new Date(),
    });

    // Re-aggregate and update Product averageRating & reviewCount
    const allReviews = await Review.find({
      productId: productObjectId,
      status: { $ne: "hidden" },
    }).lean();
    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              allReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    await Product.findByIdAndUpdate(productObjectId, {
      averageRating: avgRating,
      reviewCount: totalReviews,
    });

    return NextResponse.json(
      {
        success: true,
        message: isVerified
          ? "Thank you! Your verified review has been published."
          : "Thank you! Your review has been submitted as a guest.",
        review: newReview,
        averageRating: avgRating,
        totalReviews,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
