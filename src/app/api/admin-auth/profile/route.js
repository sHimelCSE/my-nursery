import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthenticatedAdmin, signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { getAdminModel } from "@/models/Admin";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// GET /api/admin-auth/profile
// Validate session, return current admin's profile data
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

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id || admin._id?.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          createdAt: admin.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin-auth/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve admin profile", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT /api/admin-auth/profile
// Update name, email, and password
// ─────────────────────────────────────────────
export async function PUT(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, newPassword } = body;

    const Admin = await getAdminModel();
    const adminId = admin.id || admin._id;

    const updateData = {};

    // Validate and update name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Admin name cannot be empty." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Validate and update email
    if (email !== undefined) {
      const trimmedEmail = email.toLowerCase().trim();
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      // Check if another admin already uses this email
      const existing = await Admin.findOne({
        email: trimmedEmail,
        _id: { $ne: adminId },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Email is already in use by another administrator." },
          { status: 400 }
        );
      }
      updateData.email = trimmedEmail;
    }

    // Validate and update password
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No profile updates provided." },
        { status: 400 }
      );
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin account not found." },
        { status: 404 }
      );
    }

    // Re-sign admin token so cookie stays updated with latest name/email
    const token = await signAdminToken(updatedAdmin);

    const resAdmin = {
      id: updatedAdmin._id?.toString() || updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      status: updatedAdmin.status,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin profile updated successfully!",
        admin: resAdmin,
      },
      { status: 200 }
    );

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("PUT /api/admin-auth/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update admin profile", error: error.message },
      { status: 500 }
    );
  }
}
