import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";

// ─────────────────────────────────────────────
// GET /api/admin/notifications
// Returns all notifications sorted by createdAt: -1 with unreadCount
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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let query = {};
    if (type && type !== "all") {
      query.type = type;
    }
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ isRead: false }),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin/notifications
// Mark all notifications or a specific notification as isRead: true
// Body: { markAll?: boolean, id?: string, notificationId?: string }
// ─────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { markAll, id, notificationId } = body;

    const targetId = id || notificationId;

    if (markAll) {
      await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    } else if (targetId) {
      await Notification.findByIdAndUpdate(targetId, { $set: { isRead: true } });
    } else {
      return NextResponse.json(
        { success: false, message: "Specify markAll: true or an id to mark as read." },
        { status: 400 }
      );
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return NextResponse.json(
      {
        success: true,
        message: markAll ? "All notifications marked as read." : "Notification marked as read.",
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification(s)", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin/notifications
// Delete a single notification by id or clear all
// Query / Body: { clearAll?: boolean, id?: string }
// ─────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let clearAll = searchParams.get("clearAll") === "true";

    // Fallback to body if provided
    if (!id && !clearAll) {
      try {
        const body = await request.json();
        if (body.id) id = body.id;
        if (body.clearAll) clearAll = true;
      } catch (e) {
        // Body was empty or not JSON, query params were used
      }
    }

    if (clearAll) {
      await Notification.deleteMany({});
      return NextResponse.json(
        { success: true, message: "All notifications cleared.", unreadCount: 0 },
        { status: 200 }
      );
    }

    if (id) {
      await Notification.findByIdAndDelete(id);
      const unreadCount = await Notification.countDocuments({ isRead: false });
      return NextResponse.json(
        { success: true, message: "Notification deleted successfully.", unreadCount },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Please provide an id or clearAll=true." },
      { status: 400 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete notification(s)", error: error.message },
      { status: 500 }
    );
  }
}
