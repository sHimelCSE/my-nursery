import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function PUT(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog article not found" },
        { status: 404 }
      );
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt.trim();
    if (body.content !== undefined) updateData.content = body.content;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.readTime !== undefined) updateData.readTime = body.readTime.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.relatedProducts !== undefined) {
      updateData.relatedProducts = Array.isArray(body.relatedProducts)
        ? body.relatedProducts
        : [];
    }

    if (body.author) {
      updateData.author = {
        name: body.author.name?.trim() || blog.author?.name || "BloomCraft Botanist",
        role: body.author.role?.trim() || blog.author?.role || "Horticulture Specialist",
        avatar: body.author.avatar?.trim() || blog.author?.avatar || "",
      };
    }

    // Slug update if provided
    if (body.slug && body.slug.trim()) {
      const sanitized = slugify(body.slug);
      if (sanitized !== blog.slug) {
        const conflict = await Blog.findOne({ slug: sanitized, _id: { $ne: id } });
        if (conflict) {
          updateData.slug = `${sanitized}-${Date.now().toString().slice(-4)}`;
        } else {
          updateData.slug = sanitized;
        }
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("relatedProducts", "title price images category");

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("PUT /api/admin/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Blog article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
