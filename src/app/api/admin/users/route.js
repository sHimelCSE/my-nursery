import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

// ─────────────────────────────────────────────
// GET /api/admin/users
// Returns all registered users with their order count
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

    // 1. Fetch all users
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    // 2. Aggregate order counts by userId and customerEmail
    const [ordersByUserId, ordersByEmail] = await Promise.all([
      Order.aggregate([
        { $match: { userId: { $ne: null } } },
        { $group: { _id: { $toString: "$userId" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        {
          $project: {
            resolvedEmail: {
              $toLower: {
                $ifNull: ["$customerEmail", "$shippingAddress.email"],
              },
            },
          },
        },
        { $match: { resolvedEmail: { $ne: "" } } },
        { $group: { _id: "$resolvedEmail", count: { $sum: 1 } } },
      ]),
    ]);

    const userIdMap = new Map();
    ordersByUserId.forEach((item) => {
      if (item._id) userIdMap.set(item._id.toString(), item.count);
    });

    const emailMap = new Map();
    ordersByEmail.forEach((item) => {
      if (item._id) emailMap.set(item._id.toLowerCase(), item.count);
    });

    // 3. Map aggregated order counts to users
    const enrichedUsers = users.map((u) => {
      const idStr = u._id.toString();
      const emailLower = (u.email || "").toLowerCase();

      const countFromId = userIdMap.get(idStr) || 0;
      const countFromEmail = emailMap.get(emailLower) || 0;
      const totalOrders = Math.max(countFromId, countFromEmail);

      return {
        _id: idStr,
        name: u.name || "N/A",
        email: u.email || "N/A",
        phone: u.phone || "—",
        address: u.address || "—",
        postalCode: u.postalCode || "",
        role: u.role || "user",
        createdAt: u.createdAt,
        totalOrders,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: enrichedUsers.length,
        data: enrichedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}
