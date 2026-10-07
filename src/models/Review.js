import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    userImage: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minlength: [5, "Review comment must be at least 5 characters"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isGoogleVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["approved", "hidden"],
      default: "approved",
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
  delete mongoose.models.Review;
}

const Review =
  mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
