import { NextResponse } from "next/server";
import { getAdminModel } from "@/models/Admin";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// ─────────────────────────────────────────────
// GET /api/admin-auth/manage-admin
// Lists all admin members (Accessible to approved admins)
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    const currentAdmin = await getAuthenticatedAdmin(request);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const Admin = await getAdminModel();
    const admins = await Admin.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: admins.length,
        data: admins,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin-auth/manage-admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin list", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin-auth/manage-admin
// Super Admin only: Approves or rejects pending admins
// ─────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const currentAdmin = await getAuthenticatedAdmin(request);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Strict Super Admin permission check
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Only Super Admins can manage team approvals and permissions.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { adminId, status, role, action } = body;

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "adminId is required." },
        { status: 400 }
      );
    }

    const Admin = await getAdminModel();
    const targetAdmin = await Admin.findById(adminId);

    if (!targetAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin account not found." },
        { status: 404 }
      );
    }

    // Prevent modifying self
    if (targetAdmin._id.toString() === currentAdmin.id) {
      return NextResponse.json(
        { success: false, message: "Super Admins cannot modify their own status." },
        { status: 400 }
      );
    }

    // Determine new status based on action or direct status string
    let newStatus = targetAdmin.status;
    if (action === "approve" || status === "approved") {
      newStatus = "approved";
    } else if (action === "reject" || status === "rejected") {
      newStatus = "rejected";
    } else if (status === "pending") {
      newStatus = "pending";
    }

    targetAdmin.status = newStatus;

    if (role && ["admin", "super_admin"].includes(role)) {
      targetAdmin.role = role;
    }

    await targetAdmin.save();

    return NextResponse.json(
      {
        success: true,
        message: `Admin ${targetAdmin.name} has been ${newStatus}.`,
        data: {
          id: targetAdmin._id.toString(),
          name: targetAdmin.name,
          email: targetAdmin.email,
          role: targetAdmin.role,
          status: targetAdmin.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin-auth/manage-admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update admin permissions", error: error.message },
      { status: 500 }
    );
  }
}
