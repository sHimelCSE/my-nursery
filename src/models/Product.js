import mongoose, { Schema } from "mongoose";
import { slugify } from "@/lib/slugify";

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
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    category: {
      type: String,
      trim: true,
      default: "plant",
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
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    hasCareGuide: {
      type: Boolean,
      default: true,
    },
    careGuide: {
      lightLocation: { type: String, default: "" },
      hydrationWatering: { type: String, default: "" },
      safetyDifficulty: { type: String, default: "" },
      horticulturistNote: { type: String, default: "" },
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

/**
 * Clean slug generator from text
 */
export function generateSlug(text) {
  return slugify(text);
}

/**
 * Guarantees a 100% unique slug with duplicate protection (-1, -2, etc.)
 */
export async function getUniqueSlug(ProductModel, title, excludeId = null) {
  let baseSlug = slugify(title) || "product";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await ProductModel.findOne(query).select("_id").lean();
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Pre-save hook: auto-generate unique slug if title modified or slug is missing
ProductSchema.pre("save", async function () {
  if (!this.slug || this.isModified("title")) {
    const ProductModel = this.constructor;
    this.slug = await getUniqueSlug(ProductModel, this.title, this._id);
  }
});

// Prevent Next.js hot-reload from recompiling the model
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Product;
}
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

let isMigratingSlugs = false;

/**
 * Auto-migration: assign unique slugs to all existing products in MongoDB lacking a slug
 */
export async function ensureProductSlugs() {
  if (isMigratingSlugs) return;
  isMigratingSlugs = true;
  try {
    const productsWithoutSlug = await Product.find(
      {
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
      },
      "_id title"
    ).lean();

    if (productsWithoutSlug.length > 0) {
      console.log(`[Auto-Migration] Found ${productsWithoutSlug.length} products without slug. Assigning unique slugs...`);
      for (const prod of productsWithoutSlug) {
        const uniqueSlug = await getUniqueSlug(Product, prod.title, prod._id);
        await Product.updateOne(
          {
            _id: prod._id,
            $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
          },
          { $set: { slug: uniqueSlug } }
        );
      }
      console.log(`[Auto-Migration] Successfully assigned unique slugs to all products.`);
    }
  } catch (err) {
    console.error("[Auto-Migration] Error ensuring product slugs:", err);
  } finally {
    isMigratingSlugs = false;
  }
}

export default Product;
