import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PageThemeConfig, { DEFAULT_PAGE_THEME_CONFIG } from "@/models/PageThemeConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const config = await PageThemeConfig.getConfig();

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/page-theme-config error:", error);
    return NextResponse.json(
      {
        success: true,
        data: DEFAULT_PAGE_THEME_CONFIG,
        fallback: true,
      },
      { status: 200 }
    );
  }
}
