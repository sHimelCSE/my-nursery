import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";

export const dynamic = "force-dynamic";

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

    const subscribers = await Subscriber.find()
      .sort({ subscribedAt: -1 })
      .lean();

    const totalCount = subscribers.length;
    const activeCount = subscribers.filter((s) => s.isActive !== false).length;

    return NextResponse.json({
      success: true,
      subscribers,
      totalCount,
      activeCount,
    });
  } catch (error) {
    console.error("GET /api/admin/subscribers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscribers list" },
      { status: 500 }
    );
  }
}
