import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Expense from "@/models/Expense";
import { getAdminModel } from "@/models/Admin";

// ─────────────────────────────────────────────
// GET /api/admin/stats
// Comprehensive financial, order, and monthly metrics
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

    // 1. Fetch orders, products, expenses, and admins in parallel
    const [orders, allProducts, allExpenses, totalProducts, totalAdmins, pendingAdmins] =
      await Promise.all([
        Order.find({}).sort({ createdAt: -1 }).lean(),
        Product.find({}).select("_id costPrice price").lean(),
        Expense.find({}).sort({ date: -1 }).lean(),
        Product.countDocuments(),
        Admin.countDocuments(),
        Admin.countDocuments({ status: "pending" }),
      ]);

    // 2. Build cost price lookup map by product ID
    const costPriceMap = new Map();
    allProducts.forEach((p) => {
      costPriceMap.set(p._id.toString(), Number(p.costPrice) || 0);
    });

    // 3. Financial & order calculations
    let totalRevenue = 0;
    let deliveredValue = 0;
    let deliveredCount = 0;
    let pendingValue = 0;
    let pendingCount = 0;
    let cancelledValue = 0;
    let cancelledCount = 0;
    let totalProductCosts = 0; // Buying cost of products sold in delivered orders

    orders.forEach((order) => {
      const statusLower = (order.status || "").toLowerCase();
      const orderTotal = Number(order.totalPrice) || 0;

      if (statusLower !== "cancelled") {
        totalRevenue += orderTotal;
      }

      if (statusLower === "delivered") {
        deliveredValue += orderTotal;
        deliveredCount += 1;

        // Calculate product cost for this delivered order
        if (Array.isArray(order.products)) {
          order.products.forEach((item) => {
            const pId = item.productId?.toString();
            const unitCost = costPriceMap.get(pId) || 0;
            const qty = Number(item.quantity) || 1;
            totalProductCosts += unitCost * qty;
          });
        }
      } else if (statusLower === "pending" || statusLower === "processing") {
        pendingValue += orderTotal;
        pendingCount += 1;
      } else if (statusLower === "cancelled") {
        cancelledValue += orderTotal;
        cancelledCount += 1;
      }
    });

    // 4. Operational expenses
    const operationalExpenses = allExpenses.reduce(
      (sum, exp) => sum + (Number(exp.amount) || 0),
      0
    );

    // 5. Net Profit = deliveredValue - (totalProductCosts + operationalExpenses)
    const netProfit = deliveredValue - (totalProductCosts + operationalExpenses);

    // 6. Aggregate Monthly Orders Data for the last 6-12 months (last 12 months)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyMap = new Map();
    const currentDate = new Date();

    // Initialize the last 12 months in chronological order
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
      const label = `${monthNames[monthIndex]}`;
      const fullLabel = `${monthNames[monthIndex]} ${year}`;

      monthlyMap.set(key, {
        key,
        month: label,
        fullLabel,
        revenue: 0,
        orders: 0,
        deliveredRevenue: 0,
      });
    }

    // Populate data from orders
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const orderDate = new Date(order.createdAt);
      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

      if (monthlyMap.has(key)) {
        const item = monthlyMap.get(key);
        const statusLower = (order.status || "").toLowerCase();
        const orderTotal = Number(order.totalPrice) || 0;

        if (statusLower !== "cancelled") {
          item.revenue += orderTotal;
          item.orders += 1;
        }

        if (statusLower === "delivered") {
          item.deliveredRevenue += orderTotal;
        }
      }
    });

    const monthlyData = Array.from(monthlyMap.values());

    // 7. Recent orders (latest 8)
    const recentOrders = orders.slice(0, 8);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalRevenue,
          totalOrdersCount: orders.length,
          deliveredValue,
          deliveredCount,
          pendingValue,
          pendingCount,
          cancelledValue,
          cancelledCount,
          totalProductCosts,
          operationalExpenses,
          netProfit,
          totalProducts,
          totalAdmins,
          pendingAdmins,
          monthlyData,
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate stats", error: error.message },
      { status: 500 }
    );
  }
}
