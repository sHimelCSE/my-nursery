import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminModel } from "@/models/Admin";
import Notification from "@/models/Notification";

// ─────────────────────────────────────────────
// POST /api/admin-auth/register
// First admin becomes approved super_admin;
// Subsequent registrations are pending admin accounts.
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Admin name is required." },
        { status: 400 }
      );
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const Admin = await getAdminModel();
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An admin account with this email already exists." },
        { status: 400 }
      );
    }

    // Count existing admins to determine first-admin hierarchy
    const existingCount = await Admin.countDocuments();
    const isFirstAdmin = existingCount === 0;

    const role = isFirstAdmin ? "super_admin" : "admin";
    const status = isFirstAdmin ? "approved" : "pending";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
      status,
    });

    // Create notification if pending approval
    if (!isFirstAdmin) {
      try {
        await Notification.create({
          title: "New Admin Registration Request",
          message: `${name.trim()} (${cleanEmail}) applied for an admin account. Super Admin approval required.`,
          type: "admin_request",
          link: "/Manage_Admin?tab=team",
          isRead: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.error("Failed to create admin_request notification:", notifErr);
      }
    }

    const successMessage = isFirstAdmin
      ? "Super Admin account created and auto-approved! You can now log in."
      : "Registration submitted! Your account is pending approval from the Super Admin.";

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        isFirstAdmin,
        admin: {
          id: newAdmin._id.toString(),
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          status: newAdmin.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin-auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed", error: error.message },
      { status: 500 }
    );
  }
}
