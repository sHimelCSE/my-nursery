import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContactMessage from "@/models/ContactMessage";
import Notification from "@/models/Notification";

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, phone, subject, message, b_hp_field } = body;

    // ── 1. Strict Anti-Spam: Honeypot field check ────────────────────────────
    if (b_hp_field && b_hp_field.trim() !== "") {
      return NextResponse.json(
        { success: false, message: "Spam submission detected." },
        { status: 400 }
      );
    }

    // ── 2. Required Fields Validation ────────────────────────────────────────
    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // ── 3. Email Format Validation ───────────────────────────────────────────
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // ── 4. 11-digit Bangladeshi Phone Format Validation ──────────────────────
    const cleanedPhone = phone.trim().replace(/[\s-]/g, "");
    if (!BD_PHONE_REGEX.test(cleanedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a valid 11-digit Bangladeshi mobile number starting with 01 (e.g., 01712345678).",
        },
        { status: 400 }
      );
    }

    // ── 5. Message Length Validation (min 15 chars) ───────────────────────────
    if (message.trim().length < 15) {
      return NextResponse.json(
        {
          success: false,
          message: "Message must be at least 15 characters long.",
        },
        { status: 400 }
      );
    }

    // ── 6. Save Message to Database ──────────────────────────────────────────
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      subject: subject.trim(),
      message: message.trim(),
      isRead: false,
      createdAt: new Date(),
    });

    // ── 7. Automatically Trigger Admin System Notification ───────────────────
    try {
      await Notification.create({
        type: "system",
        title: "New Customer Inquiry",
        message: `Message from ${name.trim()}: ${subject.trim()}`,
        link: "/Manage_Admin",
      });
    } catch (notifErr) {
      console.error("Failed to generate notification for contact inquiry:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your message has been received. Our plant care team will contact you shortly.",
        id: contactMessage._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to submit message. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(100);
    return NextResponse.json({ success: true, messages });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch contact inquiries." },
      { status: 500 }
    );
  }
}
