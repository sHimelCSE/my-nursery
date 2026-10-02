import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import Notification from "@/models/Notification";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Body: { shippingAddress, paymentMethod, notes, products, subtotal, deliveryCharge, totalPrice, email }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      shippingAddress,
      paymentMethod,
      notes,
      products,
      subtotal,
      deliveryCharge,
      totalPrice,
      userId,
      email: directEmail,
    } = body;

    // ── Validation ──────────────────────────────────────
    if (!shippingAddress || !products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Shipping address and products are required" },
        { status: 400 }
      );
    }

    const { fullName, phone, street, city } = shippingAddress;
    const rawEmail = shippingAddress.email || directEmail || body.customerEmail;

    if (!fullName || !phone || !street || !city) {
      return NextResponse.json(
        { success: false, message: "Full name, phone, address, and city are required" },
        { status: 400 }
      );
    }

    if (!rawEmail || !/^\S+@\S+\.\S+$/.test(rawEmail.trim())) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid phone number" },
        { status: 400 }
      );
    }

    const cleanEmail = rawEmail.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // ── User Auto-Creation / Association ─────────────────
    let finalUser = null;
    let isNewUser = false;

    // First check if an existing user matches this email
    finalUser = await User.findOne({ email: cleanEmail });

    if (!finalUser) {
      // If user provided a userId in body (e.g. logged in), try finding by ID
      if (userId) {
        finalUser = await User.findById(userId);
      }
    }

    if (!finalUser) {
      // Create new user automatically with a secure temporary password
      const tempPassword = crypto.randomBytes(12).toString("hex") + "Aa1!";
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      finalUser = await User.create({
        name: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedTempPassword,
        isTemporaryPassword: true,
        role: "user",
      });
      isNewUser = true;
    } else {
      // If user exists and doesn't have phone set, update it
      if (!finalUser.phone && cleanPhone) {
        finalUser.phone = cleanPhone;
        await finalUser.save();
      }
    }

    // ── Server-side total calculation ───────────────────
    const calculatedSubtotal = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const isInsideDhaka = city === "Dhaka" || shippingAddress.district === "Dhaka";
    const calculatedDelivery =
      calculatedSubtotal >= 1000 ? 0 : isInsideDhaka ? 60 : 120;
    const calculatedTotal = calculatedSubtotal + calculatedDelivery;

    // ── Create order in MongoDB ─────────────────────────
    const order = await Order.create({
      userId: finalUser ? finalUser._id : undefined,
      customerEmail: cleanEmail,
      shippingAddress: {
        fullName:   fullName.trim(),
        email:      cleanEmail,
        phone:      cleanPhone,
        street:     street.trim(),
        city:       city || shippingAddress.district,
        state:      shippingAddress.state || shippingAddress.division || shippingAddress.district || "",
        division:   shippingAddress.division || "",
        district:   shippingAddress.district || city || "",
        upazila:    shippingAddress.upazila || "",
        postalCode: shippingAddress.postalCode || "N/A",
        country:    shippingAddress.country || "Bangladesh",
      },
      products: products.map((item) => ({
        productId: item.productId || item._id || undefined,
        title:     item.title,
        price:     item.price,
        quantity:  item.quantity,
      })),
      subtotal:       calculatedSubtotal,
      deliveryCharge: calculatedDelivery,
      totalPrice:     calculatedTotal,
      paymentMethod:  paymentMethod || "cod",
      notes:          notes || "",
      status:         "Pending",
    });

    // ── Create Admin Notification ───────────────────────
    try {
      await Notification.create({
        title: "New Order Placed",
        message: `Customer ${fullName.trim()} placed order #${order._id.toString().slice(-6).toUpperCase()} for ৳${calculatedTotal}`,
        type: "order",
        link: "/Manage_Admin?tab=orders",
        isRead: false,
        createdAt: new Date(),
      });
    } catch (notifErr) {
      console.error("Failed to create order notification:", notifErr);
    }

    // ── Generate NextAuth JWT Session Cookie if New User ─
    let sessionToken = null;
    const isSecure =
      process.env.NODE_ENV === "production" &&
      (process.env.NEXTAUTH_URL?.startsWith("https") || false);
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    const secret =
      process.env.NEXTAUTH_SECRET ||
      "greenleaf_nursery_secret_key_super_secure_2026_jwt_token";

    if (isNewUser && finalUser) {
      sessionToken = await encode({
        token: {
          id: finalUser._id.toString(),
          name: finalUser.name,
          email: finalUser.email,
          role: finalUser.role || "user",
        },
        secret,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "✅ Order placed successfully!",
        isNewUser,
        userEmail: cleanEmail,
        userId: finalUser?._id?.toString(),
        data: {
          _id:            order._id,
          orderId:        order._id,
          status:         order.status,
          totalPrice:     order.totalPrice,
          deliveryCharge: order.deliveryCharge,
          paymentMethod:  order.paymentMethod,
          createdAt:      order.createdAt,
          isNewUser,
        },
      },
      { status: 201 }
    );

    // Auto-login new user by setting NextAuth session cookie
    if (isNewUser && sessionToken) {
      response.cookies.set({
        name: cookieName,
        value: sessionToken,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecure,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/orders error:", error);

    if (error.name === "ValidationError") {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: msgs.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to place order", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  (Admin: list all orders)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, count: orders.length, data: orders },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}
