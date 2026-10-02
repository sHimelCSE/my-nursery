import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import NavigationMenu from "@/models/NavigationMenu";

const DEFAULT_MENUS = [
  // Navbar Links
  { label: "All Products", url: "/products", location: "navbar", order: 0, isActive: true },
  { label: "Plants", url: "/products?category=plant", location: "navbar", order: 1, isActive: true },
  { label: "Fertilizers", url: "/products?category=fertilizer", location: "navbar", order: 2, isActive: true },
  { label: "Tools & Pots", url: "/products?category=tool", location: "navbar", order: 3, isActive: true },
  { label: "About Us", url: "/about", location: "navbar", order: 4, isActive: true },
  { label: "Contact Us", url: "/contact", location: "navbar", order: 5, isActive: true },

  // Footer Links
  { label: "About Us (আমাদের সম্পর্কে)", url: "/about", location: "footer", order: 0, isActive: true },
  { label: "Contact Us (যোগাযোগ)", url: "/contact", location: "footer", order: 1, isActive: true },
  { label: "Privacy Policy (গোপনীয়তা নীতি)", url: "/privacy", location: "footer", order: 2, isActive: true },
  { label: "Terms & Conditions (শর্তাবলী)", url: "/terms", location: "footer", order: 3, isActive: true },
  { label: "Return & Refund Policy (ফেরত নীতি)", url: "/refund", location: "footer", order: 4, isActive: true },
];

export async function GET(request) {
  try {
    await dbConnect();
    const admin = await getAuthenticatedAdmin(request);

    let menus = await NavigationMenu.find().sort({ order: 1 });

    if (!menus || menus.length === 0) {
      await NavigationMenu.insertMany(DEFAULT_MENUS);
      menus = await NavigationMenu.find().sort({ order: 1 });
    }

    if (!admin) {
      const activeMenus = menus.filter((m) => m.isActive);
      return NextResponse.json({ success: true, menus: activeMenus });
    }

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
    const { label, url, location } = body;

    if (!label?.trim() || !url?.trim()) {
      return NextResponse.json(
        { success: false, message: "Label and URL are required" },
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
      url: url.trim(),
      location: loc,
      order: nextOrder,
      isActive: true,
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
