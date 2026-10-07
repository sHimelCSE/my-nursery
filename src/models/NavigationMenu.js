import mongoose, { Schema } from "mongoose";

const NavigationItemSubSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    group: {
      type: String,
      default: "General",
      trim: true,
    },
  },
  { _id: true }
);

const MegaMenuPromoSchema = new Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: "Featured",
      trim: true,
    },
    title: {
      type: String,
      default: "Trending Indoor Plants",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "Up to 25% Off",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    link: {
      type: String,
      default: "/collections",
      trim: true,
    },
  },
  { _id: false }
);

const NavigationMenuSchema = new Schema(
  {
    location: {
      type: String,
      required: true,
      enum: ["navbar", "footer"],
      default: "navbar",
    },
    label: {
      type: String,
      required: [true, "Menu label is required"],
      trim: true,
    },
    url: {
      type: String,
      default: "#",
      trim: true,
    },
    menuType: {
      type: String,
      enum: ["standard", "dropdown", "mega_menu"],
      default: "standard",
    },
    footerColumn: {
      type: String,
      default: "Shop",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [NavigationItemSubSchema],
      default: [],
    },
    megaMenuPromo: {
      type: MegaMenuPromoSchema,
      default: () => ({
        isEnabled: false,
        badge: "Featured",
        title: "Trending Indoor Plants",
        subtitle: "Up to 25% Off",
        imageUrl: "",
        link: "/collections",
      }),
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.NavigationMenu;
}

const NavigationMenu =
  mongoose.models.NavigationMenu ||
  mongoose.model("NavigationMenu", NavigationMenuSchema);

export default NavigationMenu;
