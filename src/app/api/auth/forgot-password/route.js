import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// Generates a 1-hour secure password reset token
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid registered email address." },
        { status: 400 }
      );
    }

    await dbConnect();

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Security best practice: don't reveal if email does not exist, but provide helpful feedback
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with that email, a password reset link has been generated.",
        },
        { status: 200 }
      );
    }

    // Generate secure crypto token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    console.log(
      `\n========================================\n🌱 [GREENLEAF PASSWORD RESET LINK for ${cleanEmail}]:\n${resetUrl}\n========================================\n`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Password reset link generated successfully.",
        resetUrl, // Provided for direct developer testing and preview
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
