import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// GET /api/orders/[id]
// Fetch single order by Mongo ID
// ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    let userHasTemporaryPassword = false;
    let userEmail = order.customerEmail || order.shippingAddress?.email || "";

    if (order.userId) {
      const user = await User.findById(order.userId).select("email isTemporaryPassword").lean();
      if (user) {
        userHasTemporaryPassword = !!user.isTemporaryPassword;
        userEmail = user.email || userEmail;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order,
          userHasTemporaryPassword,
          userEmail,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order", error: error.message },
      { status: 500 }
    );
  }
}
