import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminModel } from "@/models/Admin";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

// ─────────────────────────────────────────────
// POST /api/admin-auth/login
// Dedicated admin authentication with separate session
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const Admin = await getAdminModel();
    const cleanEmail = email.toLowerCase().trim();

    // Find admin by email
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check approval status
    if (admin.status === "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is pending approval by the Super Admin.",
          status: "pending",
        },
        { status: 403 }
      );
    }

    if (admin.status === "rejected") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account registration has been rejected.",
          status: "rejected",
        },
        { status: 403 }
      );
    }

    if (admin.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is not approved to access the Admin Panel.",
        },
        { status: 403 }
      );
    }

    // Generate dedicated JWT token for admin
    const token = await signAdminToken(admin);

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin authenticated successfully.",
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin-auth/login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed", error: error.message },
      { status: 500 }
    );
  }
}
