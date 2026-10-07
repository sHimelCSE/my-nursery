import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SiteSetting, { DEFAULT_SITE_SETTINGS } from "@/models/SiteSetting";

export async function GET() {
  try {
    await dbConnect();
    const settings = await SiteSetting.getSettings();

    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/site-settings error:", error);
    // Graceful fallback to default in case of any database latency
    return NextResponse.json(
      {
        success: true,
        data: DEFAULT_SITE_SETTINGS,
        fallback: true,
      },
      { status: 200 }
    );
  }
}
