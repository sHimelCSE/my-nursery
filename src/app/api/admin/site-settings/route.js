import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import SiteSetting from "@/models/SiteSetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/site-settings
export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const settings = await SiteSetting.getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET /api/admin/site-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site-settings
export async function PUT(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    let settings = await SiteSetting.getSettings();

    // Deep merge updates for each configuration group
    if (body.general) {
      settings.general = { ...settings.general.toObject(), ...body.general };
    }
    if (body.topbar) {
      settings.topbar = { ...settings.topbar.toObject(), ...body.topbar };
    }
    if (body.whatsapp) {
      settings.whatsapp = { ...settings.whatsapp.toObject(), ...body.whatsapp };
    }
    if (body.socialLinks) {
      settings.socialLinks = { ...settings.socialLinks.toObject(), ...body.socialLinks };
    }
    if (body.footer) {
      settings.footer = { ...settings.footer.toObject(), ...body.footer };
    }
    if (body.pagesContent) {
      const existingPages = settings.pagesContent ? settings.pagesContent.toObject() : {};
      settings.pagesContent = {
        aboutUs: { ...existingPages.aboutUs, ...(body.pagesContent.aboutUs || {}) },
        privacyPolicy: { ...existingPages.privacyPolicy, ...(body.pagesContent.privacyPolicy || {}) },
        termsOfService: { ...existingPages.termsOfService, ...(body.pagesContent.termsOfService || {}) },
        refundPolicy: { ...existingPages.refundPolicy, ...(body.pagesContent.refundPolicy || {}) },
      };
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully!",
      data: settings,
    });
  } catch (error) {
    console.error("PUT /api/admin/site-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update site settings", error: error.message },
      { status: 500 }
    );
  }
}
