import mongoose, { Schema } from "mongoose";

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 10, min: 0 },
    sku: { type: String, default: "" },
  },
  { _id: true }
);

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
    shortDescription: {
      type: String,
      default: "",
    },
    fullDescriptionHtml: {
      type: String,
      default: "",
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
      trim: true,
      lowercase: true,
    },
    tags: {
      type: [String], // e.g. ["Organic Feed", "Eco Certified", "Air Purifier"]
      default: [],
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
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variantGroupTitle: {
      type: String,
      default: "Select Option",
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    showCareGuideBadges: {
      type: Boolean,
      default: true,
    },
    careBadges: {
      sunlight: { type: String, default: "Medium Indirect" },
      water: { type: String, default: "Once a week" },
      petSafe: { type: String, default: "Non-Toxic" },
      difficulty: { type: String, default: "Beginner" },
    },
    customTabTitle: {
      type: String,
      default: "Botanical Background & Characteristics",
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
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
