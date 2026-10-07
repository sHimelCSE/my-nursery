import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import PageSection from "@/models/PageSection";

const DEFAULT_SECTIONS = [
  {
    sectionType: "hero",
    title: "Bring Nature Into Your Living Space",
    subtitle:
      "Curated house plants, pure organic soil conditioners, and artisanal ceramic planters designed to purify your atmosphere and inspire calm living across Bangladesh.",
    layout: "vesoz-slider", // "vesoz-slider" (Variant A) or "classic-card" (Variant B)
    order: 0,
    isActive: true,
    content: {
      badgeText: "#THE BOTANICAL SERIES",
      primaryBtnText: "Shop Now",
      primaryBtnLink: "#products",
      secondaryBtnText: "Today's Deals",
      secondaryBtnLink: "#deals",
      slides: [
        {
          id: "slide-1",
          tagline: "#THE BOTANICAL SERIES",
          title: "Bring Nature Into Your Living Space",
          subtitle:
            "Curated house plants, pure organic soil conditioners, and artisanal ceramic planters designed to purify your atmosphere and inspire calm living across Bangladesh.",
          buttonText: "Shop Now",
          buttonLink: "#products",
          secondaryBtnText: "Today's Deals",
          secondaryBtnLink: "#deals",
          image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1000&q=85",
          badgePrice: "৳320",
          badgeTitle: "Starting From",
        },
        {
          id: "slide-2",
          tagline: "#AIR PURIFIER COLLECTION",
          title: "Breathe Cleaner Air With Living Foliage",
          subtitle:
            "NASA-recommended indoor plants that naturally filter benzene, formaldehyde, and dust from urban homes and modern workspaces.",
          buttonText: "Explore Foliage",
          buttonLink: "/products?category=plant",
          secondaryBtnText: "Care Guides",
          secondaryBtnLink: "#blog",
          image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1000&q=85",
          badgePrice: "৳450",
          badgeTitle: "Fresh Arrival",
        },
        {
          id: "slide-3",
          tagline: "#ORGANIC SOIL & CARE",
          title: "Nourish Every Root with 100% Organic Mediums",
          subtitle:
            "Enriched vermicompost, slow-release bio-fertilizers, and breathable terracotta pots for flourishing balconies and rooftop gardens.",
          buttonText: "Shop Fertilizers",
          buttonLink: "/products?category=fertilizer",
          secondaryBtnText: "Learn More",
          secondaryBtnLink: "/about",
          image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1000&q=85",
          badgePrice: "৳180",
          badgeTitle: "Best Seller",
        },
      ],
      cardImage: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=85",
      cardPlantName: "Monstera Deliciosa",
      cardStartingPrice: "৳320",
      trustMetrics: [
        { value: "500+", label: "Rare Varieties" },
        { value: "100%", label: "Acclimatized" },
        { value: "48-Hr", label: "Replacement" },
      ],
    },
  },
  {
    sectionType: "categories",
    title: "Shop by Botanical Category",
    subtitle: "Curated Collections",
    layout: "pastel-cards",
    order: 1,
    isActive: true,
    content: {
      categories: [
        {
          id: "top-rated",
          title: "Top-Rated Plants",
          category: "plant",
          count: "120+",
          bgColor: "bg-[#E8F5E9]",
          textColor: "text-[#2D5A27]",
          image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80",
        },
        {
          id: "indoor-foliage",
          title: "Indoor Foliage",
          category: "plant",
          count: "85+",
          bgColor: "bg-[#E3F2FD]",
          textColor: "text-sky-900",
          image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&q=80",
        },
        {
          id: "best-sellers",
          title: "Best-Sellers",
          category: "fertilizer",
          count: "45+",
          bgColor: "bg-[#FFF3E0]",
          textColor: "text-amber-900",
          image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80",
        },
        {
          id: "gardening-tools",
          title: "Gardening Tools",
          category: "tool",
          count: "60+",
          bgColor: "bg-[#F1F8E9]",
          textColor: "text-[#33691E]",
          image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
        },
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
        { icon: "Sprout", title: "Fresh & Healthy", desc: "Every plant nursery-grown and quality-checked before dispatch." },
        { icon: "Truck", title: "Fast Delivery", desc: "Same-day in Dhaka · Next-day across Bangladesh." },
        { icon: "ShieldCheck", title: "Eco-Friendly", desc: "Sustainable packing and organically grown products only." },
        { icon: "Headphones", title: "Expert Support", desc: "Free care advice from our certified horticulture team." },
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
      badgeText: "Special Offer",
      buttonText: "Shop Now",
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
    } else {
      // Seamlessly upgrade existing sections if they lack slides or category items
      const hero = sections.find((s) => s.sectionType === "hero");
      if (hero && (!hero.content?.slides || hero.content.slides.length === 0 || !hero.layout)) {
        hero.layout = hero.layout || "vesoz-slider";
        hero.content = {
          ...(hero.content || {}),
          slides: DEFAULT_SECTIONS[0].content.slides,
          cardImage: DEFAULT_SECTIONS[0].content.cardImage,
          cardPlantName: DEFAULT_SECTIONS[0].content.cardPlantName,
          cardStartingPrice: DEFAULT_SECTIONS[0].content.cardStartingPrice,
          trustMetrics: DEFAULT_SECTIONS[0].content.trustMetrics,
        };
        await hero.save();
      }

      const cats = sections.find((s) => s.sectionType === "categories");
      if (cats && (!cats.content?.categories || cats.content.categories.length === 0)) {
        cats.title = cats.title || DEFAULT_SECTIONS[1].title;
        cats.subtitle = cats.subtitle || DEFAULT_SECTIONS[1].subtitle;
        cats.layout = cats.layout || "pastel-cards";
        cats.content = {
          ...(cats.content || {}),
          categories: DEFAULT_SECTIONS[1].content.categories,
        };
        await cats.save();
      }
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
    const { sectionType, title, subtitle, content, layout, backgroundColor, textColor, blocks } = body;

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
      layout: layout || "2-column",
      backgroundColor: backgroundColor || "#F8FAF8",
      textColor: textColor || "#1F2937",
      blocks: Array.isArray(blocks) ? blocks : [],
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
