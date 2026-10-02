import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAdminModel } from "@/models/Admin";

// ─────────────────────────────────────────────
// GET /api/admin/overview
// Real-time metrics for Admin Overview Tab
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
    const Admin = await getAdminModel();

    // Run parallel counts & aggregations for high speed
    const [
      orders,
      totalProducts,
      totalAdmins,
      pendingAdmins,
      recentOrders,
    ] = await Promise.all([
      Order.find({}).select("totalPrice status createdAt").lean(),
      Product.countDocuments(),
      Admin.countDocuments(),
      Admin.countDocuments({ status: "pending" }),
      Order.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);
    const pendingOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
    const processingOrders = orders.filter((o) =>
      ["processing", "shipped"].includes((o.status || "").toLowerCase())
    ).length;
    const deliveredOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "delivered"
    ).length;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalSales,
          totalOrders,
          pendingOrders,
          processingOrders,
          deliveredOrders,
          totalProducts,
          totalAdmins,
          pendingAdmins,
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/overview error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load overview data", error: error.message },
      { status: 500 }
    );
  }
}
