import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

// ─────────────────────────────────────────────
// POST /api/admin-auth/logout
// Clears dedicated admin session cookie
// ─────────────────────────────────────────────
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Admin session ended successfully." },
    { status: 200 }
  );

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Immediately invalidate
  });

  return response;
}
