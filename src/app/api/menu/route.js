import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NavigationMenu from "@/models/NavigationMenu";
import {
  DEFAULT_NAVBAR_MENUS,
  DEFAULT_FOOTER_MENUS,
  DEFAULT_ALL_MENUS,
} from "@/constants/defaultNavigation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    // Auto-seed if completely empty or if database only contains legacy schema entries
    const totalCount = await NavigationMenu.countDocuments();
    const hasMega = await NavigationMenu.findOne({ menuType: "mega_menu" });
    if (totalCount === 0 || !hasMega) {
      await NavigationMenu.deleteMany({});
      await NavigationMenu.insertMany(DEFAULT_ALL_MENUS);
    } else if (location === "navbar") {
      const navbarCount = await NavigationMenu.countDocuments({ location: "navbar" });
      if (navbarCount === 0) {
        await NavigationMenu.insertMany(DEFAULT_NAVBAR_MENUS);
      }
    } else if (location === "footer") {
      const footerCount = await NavigationMenu.countDocuments({ location: "footer" });
      if (footerCount === 0) {
        await NavigationMenu.insertMany(DEFAULT_FOOTER_MENUS);
      }
    }

    const query = { isActive: true };
    if (location && ["navbar", "footer"].includes(location)) {
      query.location = location;
    }

    const menus = await NavigationMenu.find(query).sort({ order: 1 }).lean();

    return NextResponse.json({
      success: true,
      menus,
      count: menus.length,
    });
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch navigation menu items",
        menus: [],
      },
      { status: 500 }
    );
  }
}
