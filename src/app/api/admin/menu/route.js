import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
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
    const admin = await getAuthenticatedAdmin(request);
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

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

    const query = {};
    if (location && ["navbar", "footer"].includes(location)) {
      query.location = location;
    }

    // Only non-admins are restricted to active items
    if (!admin) {
      query.isActive = true;
    }

    const menus = await NavigationMenu.find(query).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, menus });
  } catch (error) {
    console.error("GET /api/admin/menu error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const {
      label,
      url,
      location = "navbar",
      menuType = "standard",
      footerColumn = "Shop",
      items = [],
      megaMenuPromo,
      isActive = true,
    } = body;

    if (!label?.trim()) {
      return NextResponse.json(
        { success: false, message: "Menu label is required" },
        { status: 400 }
      );
    }

    const loc = location === "footer" ? "footer" : "navbar";
    const highest = await NavigationMenu.findOne({ location: loc })
      .sort({ order: -1 })
      .select("order");
    const nextOrder = highest ? (highest.order || 0) + 1 : 0;

    const newMenu = await NavigationMenu.create({
      label: label.trim(),
      url: (url || "#").trim(),
      location: loc,
      menuType: ["standard", "dropdown", "mega_menu"].includes(menuType) ? menuType : "standard",
      footerColumn: footerColumn?.trim() || "Shop",
      order: nextOrder,
      isActive: isActive !== false,
      items: Array.isArray(items) ? items : [],
      megaMenuPromo: megaMenuPromo || {
        isEnabled: false,
        badge: "Featured",
        title: "",
        subtitle: "",
        imageUrl: "",
        link: "/collections",
      },
    });

    return NextResponse.json(
      { success: true, message: "Menu item created successfully", menu: newMenu },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/menu error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create menu item" },
      { status: 500 }
    );
  }
}

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

    // Reset / Seed defaults action
    if (body.action === "seed_default") {
      const loc = body.location;
      if (loc === "navbar") {
        await NavigationMenu.deleteMany({ location: "navbar" });
        await NavigationMenu.insertMany(DEFAULT_NAVBAR_MENUS);
      } else if (loc === "footer") {
        await NavigationMenu.deleteMany({ location: "footer" });
        await NavigationMenu.insertMany(DEFAULT_FOOTER_MENUS);
      } else {
        await NavigationMenu.deleteMany({});
        await NavigationMenu.insertMany(DEFAULT_ALL_MENUS);
      }
      const refreshed = await NavigationMenu.find().sort({ order: 1 });
      return NextResponse.json({
        success: true,
        message: "Menu successfully reset to verified botanical defaults",
        menus: refreshed,
      });
    }

    // Case 1: Reordering array [{ _id, order }]
    if (Array.isArray(body.menus)) {
      const updates = body.menus.map((item, idx) =>
        NavigationMenu.findByIdAndUpdate(item._id, { order: idx })
      );
      await Promise.all(updates);
      const reordered = await NavigationMenu.find().sort({ order: 1 });
      return NextResponse.json({
        success: true,
        message: "Menu items reordered successfully",
        menus: reordered,
      });
    }

    // Case 2: Toggle isActive { id, isActive }
    if (body.id && body.isActive !== undefined) {
      const updated = await NavigationMenu.findByIdAndUpdate(
        body.id,
        { isActive: body.isActive },
        { new: true }
      );
      return NextResponse.json({
        success: true,
        message: `Menu item ${body.isActive ? "activated" : "hidden"} successfully`,
        menu: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/menu error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update menu items" },
      { status: 500 }
    );
  }
}
