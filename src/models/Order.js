import mongoose, { Schema } from "mongoose";

// ── Snapshot of item at purchase time ─────────────────────────────────────────
const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName:   { type: String, required: true },
    email:      { type: String, default: "" },
    phone:      { type: String, required: true },
    street:     { type: String, required: true },
    city:       { type: String, required: true },
    state:      { type: String, default: "" },
    postalCode: { type: String, default: "N/A" },
    division:   { type: String, default: "" },
    district:   { type: String, default: "" },
    upazila:    { type: String, default: "" },
    country:    { type: String, default: "Bangladesh" },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional: supports guest checkout before auth is added
    },
    customerEmail: {
      type: String,
      default: "",
    },
    products: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one product",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash"],
      default: "cod",
    },
    notes: {
      type: String,
      default: "",
    },
    appliedCouponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Order;
}

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
