import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";

export const dynamic = "force-dynamic";

export async function PUT(request, context) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    await dbConnect();
    const body = await request.json();

    const existingDiscount = await Discount.findById(id);
    if (!existingDiscount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 }
      );
    }

    const {
      code,
      type,
      value,
      appliesTo,
      collectionIds,
      productIds,
      minOrderAmount,
      isAutomatic,
      autoTrigger,
      allowStacking,
      maxUses,
      isActive,
      expiryDate,
    } = body;

    if (code) {
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode !== existingDiscount.code) {
        const duplicate = await Discount.findOne({
          code: cleanCode,
          _id: { $ne: id },
        });
        if (duplicate) {
          return NextResponse.json(
            { success: false, message: `Coupon code "${cleanCode}" already exists` },
            { status: 400 }
          );
        }
        existingDiscount.code = cleanCode;
      }
    }

    if (type !== undefined) existingDiscount.type = type;
    if (value !== undefined) {
      existingDiscount.value =
        existingDiscount.type === "free_shipping" ? 0 : Number(value) || 0;
    }
    if (appliesTo !== undefined) {
      existingDiscount.appliesTo = appliesTo;
      if (appliesTo === "all_products") {
        existingDiscount.collectionIds = [];
        existingDiscount.productIds = [];
      } else if (appliesTo === "specific_collections") {
        existingDiscount.collectionIds = collectionIds || [];
        existingDiscount.productIds = [];
      } else if (appliesTo === "specific_products") {
        existingDiscount.productIds = productIds || [];
        existingDiscount.collectionIds = [];
      }
    }
    if (minOrderAmount !== undefined) {
      existingDiscount.minOrderAmount = Math.max(0, Number(minOrderAmount) || 0);
    }
    if (isAutomatic !== undefined) existingDiscount.isAutomatic = Boolean(isAutomatic);
    if (autoTrigger !== undefined) {
      existingDiscount.autoTrigger = existingDiscount.isAutomatic ? autoTrigger : "none";
    }
    if (allowStacking !== undefined) existingDiscount.allowStacking = Boolean(allowStacking);
    if (maxUses !== undefined) {
      existingDiscount.maxUses = maxUses ? Number(maxUses) : null;
    }
    if (isActive !== undefined) existingDiscount.isActive = Boolean(isActive);
    if (expiryDate !== undefined) {
      existingDiscount.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    await existingDiscount.save();

    const populatedDiscount = await Discount.findById(id)
      .populate("collectionIds", "name slug")
      .populate("productIds", "title price images")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Discount updated successfully",
      discount: populatedDiscount,
    });
  } catch (error) {
    console.error("PUT /api/admin/discounts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update discount" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    await dbConnect();
    const deleted = await Discount.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Discount coupon deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/discounts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete discount" },
      { status: 500 }
    );
  }
}
