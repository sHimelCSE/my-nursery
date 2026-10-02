import mongoose, { Schema } from "mongoose";

const NavigationMenuSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "Menu label is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL path is required"],
      trim: true,
    },
    location: {
      type: String,
      required: true,
      enum: ["navbar", "footer"],
      default: "navbar",
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
  delete mongoose.models.NavigationMenu;
}

const NavigationMenu =
  mongoose.models.NavigationMenu ||
  mongoose.model("NavigationMenu", NavigationMenuSchema);

export default NavigationMenu;
