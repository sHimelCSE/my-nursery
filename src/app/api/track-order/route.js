import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

// Calculate estimated delivery date based on order creation date and destination
function calculateEstimatedDelivery(createdAt, city, district) {
  const orderDate = new Date(createdAt || Date.now());
  const isDhaka =
    (city && city.toLowerCase().includes("dhaka")) ||
    (district && district.toLowerCase().includes("dhaka"));

  const minDays = isDhaka ? 1 : 2;
  const maxDays = isDhaka ? 2 : 4;

  const minDate = new Date(orderDate);
  minDate.setDate(minDate.getDate() + minDays);

  const maxDate = new Date(orderDate);
  maxDate.setDate(maxDate.getDate() + maxDays);

  const options = { month: "short", day: "numeric", year: "numeric" };
  const minStr = minDate.toLocaleDateString("en-US", options);
  const maxStr = maxDate.toLocaleDateString("en-US", options);

  return minStr === maxStr ? minStr : `${minStr} – ${maxStr}`;
}

// Map order status to numeric step index (0 to 3)
// 0: Order Placed
// 1: Processing / Packaging
// 2: Shipped / On the Way
// 3: Delivered
function getTimelineProgress(status) {
  const norm = (status || "").toLowerCase().trim();
  switch (norm) {
    case "pending":
      return { currentStep: 0, stepLabel: "Order Placed", isCancelled: false };
    case "confirmed":
    case "processing":
      return { currentStep: 1, stepLabel: "Processing & Packaging", isCancelled: false };
    case "shipped":
    case "on the way":
      return { currentStep: 2, stepLabel: "Shipped & In Transit", isCancelled: false };
    case "delivered":
      return { currentStep: 3, stepLabel: "Delivered", isCancelled: false };
    case "cancelled":
      return { currentStep: -1, stepLabel: "Order Cancelled", isCancelled: true };
    default:
      return { currentStep: 0, stepLabel: "Order Placed", isCancelled: false };
  }
}

async function handleTrackOrder(queryStr) {
  if (!queryStr || typeof queryStr !== "string") {
    return { success: false, status: 400, message: "Please provide a valid Order ID or Phone number." };
  }

  const query = queryStr.trim();
  if (query.length < 3) {
    return { success: false, status: 400, message: "Search query must be at least 3 characters long." };
  }

  await dbConnect();

  const searchConditions = [];

  // Check if query is a valid 24-character hexadecimal ObjectId
  if (mongoose.Types.ObjectId.isValid(query) && query.length === 24) {
    searchConditions.push({ _id: new mongoose.Types.ObjectId(query) });
  }

  // Clean phone number query: remove spaces, dashes, parentheses
  const cleanPhone = query.replace(/[^\d+]/g, "");
  if (cleanPhone.length >= 6) {
    const rawDigits = cleanPhone.replace(/^\+88/, "");
    searchConditions.push({
      "shippingAddress.phone": { $regex: rawDigits, $options: "i" },
    });
  }

  // Also allow partial search by customerEmail if query looks like email
  if (query.includes("@")) {
    searchConditions.push({ customerEmail: query.toLowerCase() });
    searchConditions.push({ "shippingAddress.email": query.toLowerCase() });
  }

  if (searchConditions.length === 0) {
    // Fallback: search phone by raw string regex
    searchConditions.push({
      "shippingAddress.phone": { $regex: query, $options: "i" },
    });
  }

  const orders = await Order.find({ $or: searchConditions })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (!orders || orders.length === 0) {
    return {
      success: false,
      status: 404,
      message: "No order found matching your inquiry. Please verify the mobile number or Order ID.",
    };
  }

  const formattedOrders = orders.map((ord) => {
    const timeline = getTimelineProgress(ord.status);
    const estimatedDelivery = calculateEstimatedDelivery(
      ord.createdAt,
      ord.shippingAddress?.city,
      ord.shippingAddress?.district
    );

    return {
      _id: ord._id.toString(),
      orderId: ord._id.toString(),
      status: ord.status,
      timeline,
      estimatedDelivery,
      createdAt: ord.createdAt,
      updatedAt: ord.updatedAt,
      shippingAddress: {
        fullName: ord.shippingAddress?.fullName || "",
        phone: ord.shippingAddress?.phone || "",
        street: ord.shippingAddress?.street || "",
        city: ord.shippingAddress?.city || "",
        district: ord.shippingAddress?.district || "",
        division: ord.shippingAddress?.division || "",
      },
      products: (ord.products || []).map((p) => ({
        productId: p.productId?.toString(),
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        total: p.price * p.quantity,
      })),
      subtotal: ord.subtotal,
      deliveryCharge: ord.deliveryCharge,
      totalPrice: ord.totalPrice,
      paymentMethod: ord.paymentMethod,
      notes: ord.notes || "",
    };
  });

  return {
    success: true,
    status: 200,
    count: formattedOrders.length,
    orders: formattedOrders,
    order: formattedOrders[0], // primary / latest order
  };
}

// GET /api/track-order?query=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query =
      searchParams.get("query") ||
      searchParams.get("phone") ||
      searchParams.get("orderId") ||
      searchParams.get("id");

    const result = await handleTrackOrder(query);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("GET /api/track-order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track order", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/track-order
export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || body.phone || body.orderId || body.id;

    const result = await handleTrackOrder(query);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("POST /api/track-order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track order", error: error.message },
      { status: 500 }
    );
  }
}
