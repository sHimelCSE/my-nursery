import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, "Cost price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["plant", "tool", "fertilizer"],
        message: "Category must be one of: plant, tool, fertilizer",
      },
    },
    images: {
      type: [String], // Array of image URLs
      default: [],
    },
    stock_quantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    care_instructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent Next.js hot-reload from recompiling the model
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Product;
}
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
