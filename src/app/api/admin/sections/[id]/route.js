import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import PageSection from "@/models/PageSection";

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

    const updated = await PageSection.findByIdAndUpdate(
      id,
      {
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        order: body.order,
        isActive: body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Section updated successfully",
      section: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/sections/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update section" },
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

    const deleted = await PageSection.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Section removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/sections/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete section" },
      { status: 500 }
    );
  }
}
