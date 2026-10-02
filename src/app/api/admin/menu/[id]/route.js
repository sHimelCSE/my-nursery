import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import NavigationMenu from "@/models/NavigationMenu";

export async function PUT(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const updated = await NavigationMenu.findByIdAndUpdate(
      id,
      {
        label: body.label,
        url: body.url,
        location: body.location,
        order: body.order,
        isActive: body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      menu: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const deleted = await NavigationMenu.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
