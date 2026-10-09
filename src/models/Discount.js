import mongoose, { Schema } from "mongoose";

const DiscountSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      uppercase: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_shipping"],
      required: [true, "Discount type is required"],
    },
    value: {
      type: Number,
      default: 0,
      min: [0, "Discount value cannot be negative"],
    },
    appliesTo: {
      type: String,
      enum: ["all_products", "specific_collections", "specific_products"],
      default: "all_products",
    },
    collectionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    isAutomatic: {
      type: Boolean,
      default: false,
    },
    autoTrigger: {
      type: String,
      enum: ["none", "new_subscriber_first_order", "cart_threshold"],
      default: "none",
    },
    allowStacking: {
      type: Boolean,
      default: false,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Discount;
}

const Discount =
  mongoose.models.Discount || mongoose.model("Discount", DiscountSchema);

export default Discount;
