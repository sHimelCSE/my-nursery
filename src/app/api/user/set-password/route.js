import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";
import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────
// POST /api/user/set-password
// Allows a new customer or existing user to set their password
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { password, email, orderId } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    let user = null;
    let targetUserId = session?.user?.id;
    let targetEmail = session?.user?.email || (email ? email.toLowerCase().trim() : null);

    // If no active session, verify via orderId and email
    if (!targetUserId && orderId && mongoose.isValidObjectId(orderId)) {
      const order = await Order.findById(orderId);
      if (order) {
        let orderEmail = (order.customerEmail || order.shippingAddress?.email || "").toLowerCase().trim();
        let linkedUser = null;
        if (order.userId) {
          linkedUser = await User.findById(order.userId);
          if (linkedUser) {
            orderEmail = orderEmail || linkedUser.email;
          }
        }

        if (targetEmail && orderEmail && orderEmail !== targetEmail) {
          return NextResponse.json(
            { success: false, message: "Email does not match this order" },
            { status: 403 }
          );
        }
        targetUserId = order.userId;
        targetEmail = targetEmail || orderEmail;
        if (linkedUser) user = linkedUser;
      }
    }

    // Find user by ID or email if not already resolved
    if (!user && targetUserId) {
      user = await User.findById(targetUserId);
    }
    if (!user && targetEmail) {
      user = await User.findOne({ email: targetEmail });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    await user.save();

    // Ensure session cookie is set
    const isSecure = process.env.NODE_ENV === "production" && (process.env.NEXTAUTH_URL?.startsWith("https") || false);
    const cookieName = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const secret = process.env.NEXTAUTH_SECRET || "greenleaf_nursery_secret_key_super_secure_2026_jwt_token";

    const sessionToken = await encode({
      token: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
      secret,
      maxAge: 30 * 24 * 60 * 60,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password set successfully! Your account is now fully secured.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set({
      name: cookieName,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("POST /api/user/set-password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set password", error: error.message },
      { status: 500 }
    );
  }
}
