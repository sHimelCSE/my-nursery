import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// Configure Cloudinary backend SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Helper to extract public_id from Cloudinary URL:
 * Example URL:
 * https://res.cloudinary.com/detcxiwed/image/upload/v1743669123/ecommerce_upload/product-xyz.jpg
 * -> public_id: "ecommerce_upload/product-xyz"
 */
function extractPublicId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== "string") return null;

  // If it's already a public_id (no http/https protocol)
  if (!urlOrId.startsWith("http://") && !urlOrId.startsWith("https://")) {
    return urlOrId.trim();
  }

  try {
    const uploadIndex = urlOrId.indexOf("/image/upload/");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = urlOrId.substring(uploadIndex + "/image/upload/".length);

    // If transformation params exist (e.g., .../upload/w_500,c_fill/v1234567/...)
    const versionMatch = pathAfterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    if (versionMatch && versionMatch[1]) {
      pathAfterUpload = versionMatch[1];
    } else {
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");
    }

    // Strip query strings if any
    const queryIndex = pathAfterUpload.indexOf("?");
    if (queryIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, queryIndex);
    }

    // Strip file extension (.jpg, .png, .webp, etc.)
    const dotIndex = pathAfterUpload.lastIndexOf(".");
    if (dotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, dotIndex);
    }

    return pathAfterUpload.trim();
  } catch (err) {
    console.error("Failed to parse public_id from URL:", err);
    return null;
  }
}

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, public_id } = body;

    const targetPublicId = public_id ? public_id.trim() : extractPublicId(imageUrl);

    if (!targetPublicId) {
      return NextResponse.json(
        { success: false, message: "Invalid image URL or public_id provided." },
        { status: 400 }
      );
    }

    console.log("Deleting image from Cloudinary with public_id:", targetPublicId);

    const result = await cloudinary.uploader.destroy(targetPublicId);

    return NextResponse.json(
      {
        success: true,
        message: "Image permanently deleted from Cloudinary.",
        public_id: targetPublicId,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/cloudinary/delete error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete image from Cloudinary",
      },
      { status: 500 }
    );
  }
}
