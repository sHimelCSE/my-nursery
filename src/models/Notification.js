import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["order", "admin_request", "stock_alert", "system"],
      default: "system",
    },
    link: {
      type: String,
      default: "/Manage_Admin",
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
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
  delete mongoose.models.Notification;
}

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
