import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import PageSection from "@/models/PageSection";

const DEFAULT_SECTIONS = [
  {
    sectionType: "hero",
    title: "Bring Nature Into Your Living Space",
    subtitle:
      "Handpicked, nursery-grown indoor plants, organic fertilizers, and premium gardening tools delivered directly to your doorstep across Bangladesh.",
    order: 0,
    isActive: true,
    content: {
      badgeText: "🌱 Bangladesh's Premier Online Plant Nursery",
      primaryBtnText: "🛒 Shop Plants",
      primaryBtnLink: "#products",
      secondaryBtnText: "Gardening Tools →",
      secondaryBtnLink: "/products?category=tool",
      trustBadges: ["🔒 Secure Checkout", "🚚 Free Delivery ৳1000+", "🌿 100% Organic"],
    },
  },
  {
    sectionType: "categories",
    title: "GreenLeaf at a Glance",
    subtitle: "Trusted by plant parents in all 64 districts",
    order: 1,
    isActive: true,
    content: {
      stats: [
        { icon: "🌿", value: "500+", label: "Plant Varieties" },
        { icon: "🚚", value: "1–2d", label: "Fast Delivery" },
        { icon: "😊", value: "10K+", label: "Happy Customers" },
        { icon: "♻️", value: "100%", label: "Organic Products" },
      ],
    },
  },
  {
    sectionType: "products",
    title: "Browse Our Products",
    subtitle:
      "Curated plants and gardening essentials for every green thumb — beginner or expert.",
    order: 2,
    isActive: true,
    content: {
      badgeText: "Our Collection",
    },
  },
  {
    sectionType: "features",
    title: "Your Trusted Green Partner",
    subtitle: "Why plant lovers across Bangladesh choose GreenLeaf Nursery",
    order: 3,
    isActive: true,
    content: {
      badgeText: "Why GreenLeaf",
      features: [
        { icon: "🌿", title: "Fresh & Healthy", desc: "Every plant nursery-grown and quality-checked before dispatch." },
        { icon: "🚚", title: "Fast Delivery", desc: "Same-day in Dhaka · Next-day across Bangladesh." },
        { icon: "♻️", title: "Eco-Friendly", desc: "Sustainable packing and organically grown products only." },
        { icon: "💬", title: "Expert Support", desc: "Free care advice from our certified horticulture team." },
      ],
    },
  },
  {
    sectionType: "promo_banner",
    title: "Ready to Go Green?",
    subtitle:
      "Start your plant journey today. Over 500 varieties waiting for a new home.",
    order: 4,
    isActive: true,
    content: {
      badgeText: "🌿 Special Offer",
      buttonText: "🛒 Shop Now",
      buttonLink: "#products",
    },
  },
  {
    sectionType: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about ordering live plants and fertilizers online.",
    order: 5,
    isActive: true,
    content: {
      badgeText: "Got Questions?",
      items: [
        {
          q: "How do you pack live plants for courier delivery?",
          a: "Every plant is secured in custom breathable, shock-absorbing plant cradles with root moisture wraps to ensure it arrives hydrated and stress-free.",
        },
        {
          q: "What happens if a plant arrives damaged or dead?",
          a: "We offer a 100% Free 48-Hour Live Plant Replacement Guarantee. Simply send photos to our WhatsApp (+880 1712-345678) and we dispatch a healthy replacement immediately.",
        },
        {
          q: "Do you deliver all over Bangladesh?",
          a: "Yes, we deliver across Dhaka within 24–48 hours and to all other 63 districts within 48–72 hours via specialized live courier logistics.",
        },
        {
          q: "Can I pay Cash on Delivery (COD)?",
          a: "Yes! Cash on Delivery is available nationwide so you can inspect your parcel and pay upon arrival.",
        },
      ],
    },
  },
];

export async function GET(request) {
  try {
    await dbConnect();
    const admin = await getAuthenticatedAdmin(request);

    let sections = await PageSection.find().sort({ order: 1 });

    // Auto-seed initial default sections if collection is empty
    if (!sections || sections.length === 0) {
      await PageSection.insertMany(DEFAULT_SECTIONS);
      sections = await PageSection.find().sort({ order: 1 });
    }

    // If request is from unauthenticated public visitor, return only active sections
    if (!admin) {
      const activeSections = sections.filter((s) => s.isActive);
      return NextResponse.json({ success: true, sections: activeSections });
    }

    return NextResponse.json({ success: true, sections });
  } catch (error) {
    console.error("GET /api/admin/sections error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch page sections" },
      { status: 500 }
    );
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

    await dbConnect();
    const body = await request.json();
    const { sectionType, title, subtitle, content } = body;

    if (!sectionType) {
      return NextResponse.json(
        { success: false, message: "Section type is required" },
        { status: 400 }
      );
    }

    // Determine next order number
    const highest = await PageSection.findOne().sort({ order: -1 }).select("order");
    const nextOrder = highest ? (highest.order || 0) + 1 : 0;

    const newSection = await PageSection.create({
      sectionType,
      title: title || "New Section",
      subtitle: subtitle || "",
      content: content || {},
      order: nextOrder,
      isActive: true,
    });

    return NextResponse.json(
      { success: true, message: "Section created successfully", section: newSection },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/sections error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create section" },
      { status: 500 }
    );
  }
}

// Bulk reorder or toggle active status
export async function PATCH(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    // Case 1: Array of items to reorder [{ _id, order }]
    if (Array.isArray(body.sections)) {
      const updates = body.sections.map((item, idx) =>
        PageSection.findByIdAndUpdate(item._id, { order: idx })
      );
      await Promise.all(updates);
      const reordered = await PageSection.find().sort({ order: 1 });
      return NextResponse.json({
        success: true,
        message: "Sections reordered successfully",
        sections: reordered,
      });
    }

    // Case 2: Single toggle { id, isActive }
    if (body.id && body.isActive !== undefined) {
      const updated = await PageSection.findByIdAndUpdate(
        body.id,
        { isActive: body.isActive },
        { new: true }
      );
      return NextResponse.json({
        success: true,
        message: `Section ${body.isActive ? "activated" : "hidden"} successfully`,
        section: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/sections error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update sections" },
      { status: 500 }
    );
  }
}
