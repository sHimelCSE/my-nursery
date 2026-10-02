import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "greenleaf_admin_secret_key_super_secure_isolated_2026"
);

/**
 * Next.js Middleware Auth Guard
 * Protects customer routes, NextAuth admin routes,
 * and the isolated /Manage_Admin executive portal.
 */
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ISOLATED ADMIN PORTAL GUARD (/Manage_Admin)
  // ═══════════════════════════════════════════════════════════════════════════
  if (pathname === "/Manage_Admin" || pathname.startsWith("/Manage_Admin/")) {
    const isAdminAuthPage =
      pathname === "/Manage_Admin/login" || pathname === "/Manage_Admin/register";

    const adminToken = req.cookies.get("admin_token")?.value;
    let isValidAdmin = false;

    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, ADMIN_JWT_SECRET);
        if (payload?.id && payload?.status === "approved") {
          isValidAdmin = true;
        }
      } catch (err) {
        isValidAdmin = false;
      }
    }

    // If already logged in as approved admin and visits login/register, redirect to dashboard
    if (isAdminAuthPage && isValidAdmin) {
      return NextResponse.redirect(new URL("/Manage_Admin", req.url));
    }

    // If not logged in and visits protected /Manage_Admin pages, redirect to login
    if (!isAdminAuthPage && !isValidAdmin) {
      const loginUrl = new URL("/Manage_Admin/login", req.url);
      if (pathname !== "/Manage_Admin") {
        loginUrl.searchParams.set("callbackUrl", pathname + search);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CUSTOMER / NEXTAUTH GUARD (/dashboard, /login, etc.)
  // ═══════════════════════════════════════════════════════════════════════════
  const secret =
    process.env.NEXTAUTH_SECRET ||
    "greenleaf_nursery_secret_key_super_secure_2026_jwt_token";

  const token = await getToken({ req, secret });

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/my-orders" ||
    pathname.startsWith("/my-orders/");
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  // Rule A: Prevent authenticated customer from visiting login/register
  if (isAuthPage && token) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const targetUrl =
      callbackUrl &&
      !callbackUrl.startsWith("/login") &&
      !callbackUrl.startsWith("/register")
        ? callbackUrl
        : "/dashboard";

    return NextResponse.redirect(new URL(targetUrl, req.url));
  }

  // Rule B: Protect Dashboard from guests
  if (isDashboardPage && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Rule C: Legacy /admin protection
  if (isAdminPage) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Manage_Admin",
    "/Manage_Admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/my-orders",
    "/my-orders/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
