import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// GET /api/orders/user
// Fetches order history for the currently logged-in user
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Use session ID if available, or queryUserId
    const targetUserId = session?.user?.id || queryUserId;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to view your orders." },
        { status: 401 }
      );
    }

    await dbConnect();

    // Query orders for this user (support both ObjectId and string representation)
    const orders = await Order.find({
      $or: [
        { userId: targetUserId },
        ...(mongoose.isValidObjectId(targetUserId)
          ? [{ userId: new mongoose.Types.ObjectId(targetUserId) }]
          : []),
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders/user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user orders", error: error.message },
      { status: 500 }
    );
  }
}
