import mongoose, { Schema } from "mongoose";

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
      ],
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
