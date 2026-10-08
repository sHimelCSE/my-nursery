import mongoose, { Schema } from "mongoose";

const BlogAuthorSchema = new Schema(
  {
    name: {
      type: String,
      default: "BloomCraft Botanist",
      trim: true,
    },
    role: {
      type: String,
      default: "Horticulture Specialist",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Blog slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image URL is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "Plant Care",
      trim: true,
    },
    author: {
      type: BlogAuthorSchema,
      default: () => ({
        name: "BloomCraft Botanist",
        role: "Horticulture Specialist",
        avatar: "",
      }),
    },
    readTime: {
      type: String,
      default: "5 min read",
      trim: true,
    },
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Blog;
}

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

export default Blog;
