import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    const discounts = await Discount.find({
      status: "active",
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    })
      .select("code type value minOrderAmount isAutomatic")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      discounts: discounts || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, discounts: [] },
      { status: 500 }
    );
  }
}
