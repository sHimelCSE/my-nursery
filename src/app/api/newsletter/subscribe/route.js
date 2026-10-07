import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Subscriber from "@/models/Subscriber";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, source = "homepage" } = body || {};

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    await dbConnect();

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      // If was previously deactivated, re-activate
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
      }

      return NextResponse.json(
        {
          success: true,
          message: "You are already a subscriber to our newsletter!",
          isExisting: true,
        },
        { status: 200 }
      );
    }

    // Create new subscriber
    await Subscriber.create({
      email: cleanEmail,
      source: typeof source === "string" ? source.slice(0, 50) : "homepage",
      isActive: true,
      subscribedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to our Botanical Society! Thank you for subscribing.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/newsletter/subscribe error:", error);

    // Duplicate key safety
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: true,
          message: "You are already a subscriber to our newsletter!",
          isExisting: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process newsletter subscription. Please try again.",
      },
      { status: 500 }
    );
  }
}
