import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import Category from "@/models/Category";
import Product from "@/models/Product";

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

    // Auto-seed initial coupons if none exist
    const count = await Discount.countDocuments();
    if (count === 0) {
      const defaultDiscounts = [
        {
          code: "WELCOME10",
          type: "percentage",
          value: 10,
          appliesTo: "all_products",
          minOrderAmount: 500,
          isAutomatic: false,
          autoTrigger: "none",
          allowStacking: false,
          maxUses: 1000,
          usedCount: 0,
          isActive: true,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        {
          code: "FREESHIP",
          type: "free_shipping",
          value: 0,
          appliesTo: "all_products",
          minOrderAmount: 1000,
          isAutomatic: false,
          autoTrigger: "none",
          allowStacking: false,
          maxUses: 500,
          usedCount: 0,
          isActive: true,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
        {
          code: "SUBSCRIBER15",
          type: "percentage",
          value: 15,
          appliesTo: "all_products",
          minOrderAmount: 800,
          isAutomatic: true,
          autoTrigger: "new_subscriber_first_order",
          allowStacking: false,
          maxUses: 2000,
          usedCount: 0,
          isActive: true,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        },
      ];
      await Discount.insertMany(defaultDiscounts);
    }

    const discounts = await Discount.find()
      .populate("collectionIds", "name slug")
      .populate("productIds", "title price images")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, discounts });
  } catch (error) {
    console.error("GET /api/admin/discounts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch discounts" },
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
      code,
      type,
      value = 0,
      appliesTo = "all_products",
      collectionIds = [],
      productIds = [],
      minOrderAmount = 0,
      isAutomatic = false,
      autoTrigger = "none",
      allowStacking = false,
      maxUses = null,
      isActive = true,
      expiryDate = null,
    } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed_amount", "free_shipping"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid discount type" },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Discount.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Coupon code "${cleanCode}" already exists` },
        { status: 400 }
      );
    }

    const newDiscount = await Discount.create({
      code: cleanCode,
      type,
      value: type === "free_shipping" ? 0 : Number(value) || 0,
      appliesTo,
      collectionIds: appliesTo === "specific_collections" ? collectionIds : [],
      productIds: appliesTo === "specific_products" ? productIds : [],
      minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
      isAutomatic: Boolean(isAutomatic),
      autoTrigger: isAutomatic ? autoTrigger : "none",
      allowStacking: Boolean(allowStacking),
      maxUses: maxUses ? Number(maxUses) : null,
      isActive: Boolean(isActive),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    const populatedDiscount = await Discount.findById(newDiscount._id)
      .populate("collectionIds", "name slug")
      .populate("productIds", "title price images")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Discount coupon created successfully",
        discount: populatedDiscount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/discounts error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create discount" },
      { status: 500 }
    );
  }
}
