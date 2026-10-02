import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// ─────────────────────────────────────────────
// GET /api/admin-auth/me
// Returns current authenticated admin profile
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
    console.error("GET /api/admin-auth/me error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve session", error: error.message },
      { status: 500 }
    );
  }
}
