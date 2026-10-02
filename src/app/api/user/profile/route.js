import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// ─────────────────────────────────────────────
// GET /api/user/profile
// Retrieves profile & security status for the logged-in user
// ─────────────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await dbConnect();

    let user = null;
    if (session.user.id) {
      user = await User.findById(session.user.id).select("+password");
    }
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() }).select("+password");
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    const hasPassword = Boolean(user.password && user.password.length > 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          postalCode: user.postalCode || "",
          image: user.image || user.avatar || "",
          role: user.role || "user",
          hasPassword,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PATCH /api/user/profile
// Updates personal info and/or changes password
// ─────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await dbConnect();

    let user = null;
    if (session.user.id) {
      user = await User.findById(session.user.id).select("+password");
    }
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() }).select("+password");
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      postalCode,
      currentPassword,
      newPassword,
      action, // 'profile' or 'password' or null
    } = body;

    let responseMessage = "Profile updated successfully!";

    // 1. Password change requested
    if (action === "password" || newPassword) {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      // Directly hash and store new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.isTemporaryPassword = false;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      responseMessage = "Password updated successfully!";
    }

    // 2. Personal info update
    if (action !== "password") {
      if (name !== undefined) {
        if (!name.trim()) {
          return NextResponse.json(
            { success: false, message: "Name cannot be empty." },
            { status: 400 }
          );
        }
        user.name = name.trim();
      }

      if (phone !== undefined) {
        user.phone = phone.trim();
      }

      if (address !== undefined) {
        user.address = address.trim();
      }

      if (postalCode !== undefined) {
        user.postalCode = postalCode.trim();
      }
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          postalCode: user.postalCode || "",
          hasPassword: Boolean(user.password && user.password.length > 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile", error: error.message },
      { status: 500 }
    );
  }
}
