import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

// ─────────────────────────────────────────────
// GET /api/admin/orders
// Returns all orders with customer & shipping info
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = {};

    if (status && status !== "all") {
      query.status = { $regex: new RegExp(`^${status}$`, "i") };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { "shippingAddress.fullName": { $regex: q, $options: "i" } },
        { "shippingAddress.phone": { $regex: q, $options: "i" } },
        { "shippingAddress.email": { $regex: q, $options: "i" } },
        { "shippingAddress.city": { $regex: q, $options: "i" } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin/orders
// Updates order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
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
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "orderId and status are required." },
        { status: 400 }
      );
    }

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    const matchedStatus = validStatuses.find(
      (s) => s.toLowerCase() === status.toLowerCase()
    );

    if (!matchedStatus) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: matchedStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Order status updated to ${matchedStatus}.`,
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status", error: error.message },
      { status: 500 }
    );
  }
}
