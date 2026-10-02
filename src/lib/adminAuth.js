import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAdminModel } from "@/models/Admin";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "greenleaf_admin_secret_key_super_secure_isolated_2026"
);

export const ADMIN_COOKIE_NAME = "admin_token";

/**
 * Sign dedicated Admin JWT token
 */
export async function signAdminToken(admin) {
  const adminId = admin._id ? admin._id.toString() : admin.id;
  return await new SignJWT({
    id: adminId,
    email: admin.email,
    name: admin.name,
    role: admin.role || "admin",
    status: admin.status || "approved",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ADMIN_JWT_SECRET);
}

/**
 * Verify dedicated Admin JWT token
 */
export async function verifyAdminToken(token) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Get authenticated admin from cookies or request
 */
export async function getAuthenticatedAdmin(req = null) {
  try {
    let token = null;

    if (req) {
      // Check cookies from Request object
      if (req.cookies && typeof req.cookies.get === "function") {
        token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      }
      // Check Authorization header fallback
      if (!token && req.headers) {
        const authHeader = req.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    } else {
      // Check Next.js server cookie store
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifyAdminToken(token);
    if (!payload?.id) return null;

    // Verify admin still exists and is approved in DB
    const Admin = await getAdminModel();
    const admin = await Admin.findById(payload.id).select("-password").lean();

    if (!admin || admin.status !== "approved") {
      return null;
    }

    return {
      ...admin,
      id: admin._id.toString(),
    };
  } catch (err) {
    console.error("getAuthenticatedAdmin error:", err);
    return null;
  }
}
