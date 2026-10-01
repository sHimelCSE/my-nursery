import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

/**
 * GET /api/test-db
 * Health-check route that tests the MongoDB connection
 * and returns a detailed status report.
 */
export async function GET() {
  const uri = process.env.MONGODB_URI;

  // 1. Check if URI is defined
  if (!uri) {
    return NextResponse.json(
      { success: false, error: "MONGODB_URI is not defined in .env.local" },
      { status: 500 }
    );
  }

  // 2. Show a safe (masked) version of the URI for debugging
  const maskedUri = uri.replace(/:\/\/(.+):(.+)@/, "://<username>:<password>@");

  try {
    await dbConnect();
    return NextResponse.json(
      {
        success: true,
        message: "✅ Database Connected Successfully!",
        details: {
          maskedUri,
          readyState: "1 (connected)",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "❌ Database Connection Failed",
        error: error.message,
        errorCode: error.code || null,
        errorName: error.name || null,
        maskedUri,
        tips: [
          "1. Check if your MongoDB Atlas cluster is ACTIVE (not paused)",
          "2. In Atlas → Network Access → add 0.0.0.0/0 to allow all IPs",
          "3. Ensure your URI has the database name: ...mongodb.net/my-nursery?retryWrites=true&w=majority",
          "4. Verify username & password are correct in the URI",
        ],
      },
      { status: 500 }
    );
  }
}
