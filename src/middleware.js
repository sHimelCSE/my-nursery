import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Middleware Auth Guard
 * Protects customer and admin routes from unauthenticated users,
 * and prevents logged-in users from visiting guest-only auth pages.
 */
export async function middleware(req) {
  const secret = process.env.NEXTAUTH_SECRET || "greenleaf_nursery_secret_key_super_secure_2026_jwt_token";

  // Extract and verify NextAuth JWT token
  const token = await getToken({ req, secret });
  const { pathname, search } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/my-orders" ||
    pathname.startsWith("/my-orders/");
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  // ─── Rule A: Prevent Authenticated Users from visiting Auth pages ───────────
  // If user is ALREADY logged in and tries to access /login or /register, redirect to /dashboard
  if (isAuthPage && token) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    // Only honor callbackUrl if it points to an internal non-auth page
    const targetUrl =
      callbackUrl &&
      !callbackUrl.startsWith("/login") &&
      !callbackUrl.startsWith("/register")
        ? callbackUrl
        : "/dashboard";

    return NextResponse.redirect(new URL(targetUrl, req.url));
  }

  // ─── Rule B: Protect Dashboard & My Orders from Guests ─────────────────────
  // If user is NOT logged in and tries to access /dashboard, /my-orders, etc.
  if (isDashboardPage && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Rule C: Admin Route Protection ────────────────────────────────────────
  // If user accesses /admin or /admin/*
  if (isAdminPage) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only users with role === 'admin' can access admin routes
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
