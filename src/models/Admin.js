import mongoose, { Schema } from "mongoose";
import dbConnect from "@/lib/dbConnect";

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["super_admin", "admin"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "admins", // Isolated collection for administrators
  }
);

// Optional connection to dedicated MONGODB_ADMIN_URI if specified in .env.local
let adminDbConnection = null;

export async function getAdminModel() {
  if (process.env.MONGODB_ADMIN_URI) {
    if (!adminDbConnection) {
      adminDbConnection = mongoose.createConnection(process.env.MONGODB_ADMIN_URI);
    }
    return adminDbConnection.models.Admin || adminDbConnection.model("Admin", AdminSchema);
  }

  await dbConnect();
  if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.Admin;
  }
  return mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
}

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Admin;
}
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
