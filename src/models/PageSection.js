import mongoose, { Schema } from "mongoose";

const BlockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "accordion", "button", "products"],
      default: "text",
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: true }
);

const PageSectionSchema = new Schema(
  {
    sectionType: {
      type: String,
      required: true,
      enum: [
        "hero",
        "categories",
        "products",
        "promo_banner",
        "features",
        "faq",
        "testimonials",
        "custom_banner",
        "custom_grid",
      ],
      default: "custom_grid",
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    layout: {
      type: String,
      default: "vesoz-slider",
    },
    backgroundColor: {
      type: String,
      default: "#F8FAF8",
    },
    textColor: {
      type: String,
      default: "#1F2937",
    },
    blocks: {
      type: [BlockSchema],
      default: [],
    },
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.PageSection;
}

const PageSection =
  mongoose.models.PageSection ||
  mongoose.model("PageSection", PageSectionSchema);

export default PageSection;
