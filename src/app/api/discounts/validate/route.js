import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import { evaluateDiscountRule } from "@/lib/discountEngine";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { code, cartItems = [], customerEmail = "", subtotal = 0, checkAutoDiscounts = false } = body;

    // Check automatic discounts if requested without a specific manual code
    if (checkAutoDiscounts && !code) {
      const autoDiscounts = await Discount.find({
        isActive: true,
        isAutomatic: true,
      }).sort({ createdAt: -1 });

      let bestResult = null;

      for (const disc of autoDiscounts) {
        const evalRes = await evaluateDiscountRule(disc, cartItems, customerEmail, subtotal);
        if (evalRes.valid) {
          if (
            !bestResult ||
            evalRes.discountAmount > bestResult.discountAmount ||
            (evalRes.isFreeShipping && !bestResult.isFreeShipping)
          ) {
            bestResult = evalRes;
          }
        }
      }

      if (bestResult) {
        return NextResponse.json({
          valid: true,
          autoApplied: true,
          discountAmount: bestResult.discountAmount,
          isFreeShipping: bestResult.isFreeShipping,
          discountDetails: bestResult.discountDetails,
        });
      }

      return NextResponse.json({
        valid: false,
        message: "No automatic promotions currently applicable.",
      });
    }

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { valid: false, message: "Please provide a valid coupon code." },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const discount = await Discount.findOne({ code: cleanCode });

    if (!discount) {
      return NextResponse.json(
        { valid: false, message: `Coupon code "${cleanCode}" does not exist.` },
        { status: 404 }
      );
    }

    const evalResult = await evaluateDiscountRule(discount, cartItems, customerEmail, subtotal);

    if (!evalResult.valid) {
      return NextResponse.json(
        { valid: false, message: evalResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountAmount: evalResult.discountAmount,
      isFreeShipping: evalResult.isFreeShipping,
      discountDetails: evalResult.discountDetails,
    });
  } catch (err) {
    console.error("Discount validate error:", err);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
