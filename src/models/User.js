import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: false, // Optional for Google OAuth users
      minlength: [6, "Password must be at least 6 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isTemporaryPassword: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure schema changes take effect in development
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.User;
}
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
