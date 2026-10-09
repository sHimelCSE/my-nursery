import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import Subscriber from "@/models/Subscriber";
import Order from "@/models/Order";
import Category from "@/models/Category";
import Product from "@/models/Product";

/**
 * Validates and evaluates a discount rule against a cart and customer.
 * 
 * @param {Object} discount - Mongoose discount document or plain object
 * @param {Array} cartItems - Array of cart item objects [{ _id, productId, price, quantity, category }]
 * @param {string} customerEmail - Customer's email
 * @param {number} subtotal - Current subtotal before discount
 * @returns {Promise<Object>} { valid: boolean, message?: string, discountAmount: number, isFreeShipping: boolean, discountDetails: Object }
 */
export async function evaluateDiscountRule(discount, cartItems = [], customerEmail = "", subtotal = 0) {
  if (!discount || !discount.isActive) {
    return { valid: false, message: "This coupon is currently inactive or invalid." };
  }

  // 1. Expiration Date Check
  if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
    return { valid: false, message: "This coupon has expired." };
  }

  // 2. Maximum Usage Limit Check
  if (
    discount.maxUses !== null &&
    discount.maxUses !== undefined &&
    discount.maxUses > 0 &&
    discount.usedCount >= discount.maxUses
  ) {
    return { valid: false, message: "This coupon has reached its maximum usage limit." };
  }

  // 3. Minimum Order Subtotal Check
  const minRequired = Number(discount.minOrderAmount) || 0;
  if (subtotal < minRequired) {
    return {
      valid: false,
      message: `Minimum order amount of ৳${minRequired} is required to apply this coupon.`,
    };
  }

  // 4. Auto-trigger / Special rule validation
  const cleanEmail = (customerEmail || "").trim().toLowerCase();
  if (discount.autoTrigger === "new_subscriber_first_order") {
    if (!cleanEmail) {
      return {
        valid: false,
        message: "Email address is required for first-order subscriber discounts.",
      };
    }
    const subscriber = await Subscriber.findOne({ email: cleanEmail, isActive: true });
    if (!subscriber) {
      return {
        valid: false,
        message: "This exclusive offer is reserved for newsletter subscribers.",
      };
    }
    const previousOrdersCount = await Order.countDocuments({ customerEmail: cleanEmail });
    if (previousOrdersCount > 0) {
      return {
        valid: false,
        message: "This exclusive coupon applies only to your first order.",
      };
    }
  }

  // 5. Product & Collection Applicability
  let qualifyingAmount = subtotal;

  if (discount.appliesTo === "specific_products") {
    const allowedIds = new Set(
      (discount.productIds || []).map((id) => (id._id || id).toString())
    );
    const qualifyingItems = (cartItems || []).filter((item) => {
      const pid = (item.productId || item._id || "").toString();
      return allowedIds.has(pid);
    });

    if (qualifyingItems.length === 0) {
      return {
        valid: false,
        message: "This coupon does not apply to any products in your cart.",
      };
    }

    qualifyingAmount = qualifyingItems.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
  } else if (discount.appliesTo === "specific_collections") {
    const collIds = (discount.collectionIds || []).map((id) => id._id || id);
    const categories = await Category.find({ _id: { $in: collIds } }).lean();
    const allowedCategories = new Set(
      categories.flatMap((c) => [c.slug?.toLowerCase(), c.name?.toLowerCase()].filter(Boolean))
    );

    // If items in cart have category, use it; otherwise check Product model
    const productIdsToCheck = (cartItems || []).map((it) => (it.productId || it._id || "").toString());
    const dbProducts = await Product.find({ _id: { $in: productIdsToCheck } }).lean();
    const productCategoryMap = new Map();
    dbProducts.forEach((p) => {
      productCategoryMap.set(p._id.toString(), (p.category || "").toLowerCase());
    });

    const qualifyingItems = (cartItems || []).filter((item) => {
      const pid = (item.productId || item._id || "").toString();
      const itemCat = (item.category || productCategoryMap.get(pid) || "").toLowerCase();
      return allowedCategories.has(itemCat);
    });

    if (qualifyingItems.length === 0) {
      return {
        valid: false,
        message: "This coupon is only valid for selected collections.",
      };
    }

    qualifyingAmount = qualifyingItems.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
  }

  // 6. Calculate Discount Amount & Free Shipping
  let discountAmount = 0;
  let isFreeShipping = false;

  if (discount.type === "percentage") {
    const percent = Math.min(Math.max(Number(discount.value) || 0, 0), 100);
    discountAmount = Math.round((qualifyingAmount * percent) / 100);
    discountAmount = Math.min(discountAmount, qualifyingAmount);
  } else if (discount.type === "fixed_amount") {
    const fixedVal = Number(discount.value) || 0;
    discountAmount = Math.min(fixedVal, qualifyingAmount);
  } else if (discount.type === "free_shipping") {
    discountAmount = 0;
    isFreeShipping = true;
  }

  return {
    valid: true,
    discountAmount,
    isFreeShipping,
    discountDetails: {
      _id: discount._id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minOrderAmount: discount.minOrderAmount,
      allowStacking: Boolean(discount.allowStacking),
      isAutomatic: Boolean(discount.isAutomatic),
      appliesTo: discount.appliesTo,
    },
  };
}
