import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// ─────────────────────────────────────────────
// Sample nursery products data
// ─────────────────────────────────────────────
const sampleProducts = [
  // ── PLANTS ──────────────────────────────────
  {
    title: "Monstera Deliciosa",
    description:
      "The iconic Swiss Cheese Plant, loved for its dramatic split leaves and tropical vibe. Perfect for bright, indirect light indoors. A statement piece that elevates any living space.",
    price: 850,
    category: "plant",
    images: [
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80",
      "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&q=80",
    ],
    stock_quantity: 25,
    care_instructions:
      "Water every 1-2 weeks, allow soil to dry between waterings. Keep in bright indirect light. Wipe leaves with a damp cloth monthly.",
  },
  {
    title: "Rose Plant (Red Queen)",
    description:
      "A classic deep-red rose variety with velvety petals and a rich fragrance. Ideal for garden beds, borders, or large pots on balconies. Blooms repeatedly throughout the season.",
    price: 450,
    category: "plant",
    images: [
      "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80",
      "https://images.unsplash.com/photo-1548460848-af7a5e6b6b14?w=600&q=80",
    ],
    stock_quantity: 40,
    care_instructions:
      "Plant in full sun (6+ hours). Water deeply 2-3 times per week at the base. Prune dead blooms to encourage new growth. Apply rose fertilizer monthly.",
  },
  {
    title: "Peace Lily (Spathiphyllum)",
    description:
      "An elegant air-purifying houseplant with glossy green leaves and white spoon-shaped blooms. Extremely low maintenance and thrives in low-light conditions — great for offices and bedrooms.",
    price: 380,
    category: "plant",
    images: [
      "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&q=80",
    ],
    stock_quantity: 35,
    care_instructions:
      "Water once a week, or when the top inch of soil is dry. Tolerates low light but blooms better in indirect bright light. Mist leaves occasionally to increase humidity.",
  },
  {
    title: "Snake Plant (Sansevieria Trifasciata)",
    description:
      "One of the toughest houseplants available. Its upright sword-like leaves with yellow edges add a bold, modern look. Filters indoor air toxins like benzene and formaldehyde.",
    price: 320,
    category: "plant",
    images: [
      "https://images.unsplash.com/photo-1598880940371-c756e015fdef?w=600&q=80",
    ],
    stock_quantity: 50,
    care_instructions:
      "Water every 2-6 weeks — less in winter. Tolerates low light but thrives in indirect sunlight. Avoid overwatering, as root rot is its biggest threat.",
  },

  // ── TOOLS / POTS ────────────────────────────
  {
    title: "Ceramic Tob / Planter (White Matte)",
    description:
      "A beautifully crafted matte-white ceramic planter with a drainage hole and saucer. Available in medium size (6 inch). Perfect for succulents, herbs, or small indoor plants. Adds a minimalist aesthetic to any shelf or windowsill.",
    price: 290,
    category: "tool",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
    ],
    stock_quantity: 60,
    care_instructions:
      "Suitable for indoor use. Ensure drainage hole is not blocked. Clean with mild soap and water. Avoid leaving in standing water to prevent mineral stains.",
  },
  {
    title: "Geo Fabric Grow Bag (12×12 inch)",
    description:
      "High-quality breathable geo-textile fabric grow bag designed for optimal root aeration and drainage. Prevents root circling and promotes healthy root structure. Ideal for tomatoes, peppers, herbs, and flowering plants on rooftops or balconies.",
    price: 120,
    category: "tool",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    ],
    stock_quantity: 100,
    care_instructions:
      "Fill with well-draining potting mix. Water more frequently than traditional pots as fabric bags dry faster. Can be washed and reused for multiple seasons.",
  },

  // ── FERTILIZERS ─────────────────────────────
  {
    title: "Organic Vermicompost (2 KG)",
    description:
      "Premium quality vermicompost produced from organic kitchen waste through controlled earthworm composting. Rich in essential macro and micronutrients. Improves soil structure, water retention, and microbial activity. 100% natural — safe for vegetables, fruits, and flowering plants.",
    price: 180,
    category: "fertilizer",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    ],
    stock_quantity: 80,
    care_instructions:
      "Mix 200-300g per plant into the top layer of soil or potting mix. Apply every 4-6 weeks during the growing season. Store in a cool, dry place away from direct sunlight.",
  },
  {
    title: "NPK Granular Fertilizer 19-19-19 (1 KG)",
    description:
      "A balanced all-purpose granular fertilizer with equal nitrogen (N), phosphorus (P), and potassium (K) — the three essential plant macronutrients. Promotes vigorous vegetative growth, strong root development, and abundant flowering. Suitable for all types of garden plants.",
    price: 220,
    category: "fertilizer",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    ],
    stock_quantity: 70,
    care_instructions:
      "Dissolve 5g per liter of water and apply to soil every 2 weeks. Avoid direct contact with plant stems or leaves. Water thoroughly after application. Keep out of reach of children.",
  },
];

// ─────────────────────────────────────────────
// GET /api/seed
// Inserts sample products only if the collection is empty
// ─────────────────────────────────────────────
export async function GET() {
  try {
    await dbConnect();

    const existingCount = await Product.countDocuments();

    if (existingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Database already has ${existingCount} product(s). Seed skipped to prevent duplicates.`,
          tip: "To re-seed, manually clear the products collection first.",
        },
        { status: 409 } // 409 Conflict
      );
    }

    const inserted = await Product.insertMany(sampleProducts);

    return NextResponse.json(
      {
        success: true,
        message: `✅ Successfully seeded ${inserted.length} products into the database.`,
        count: inserted.length,
        data: inserted.map((p) => ({ id: p._id, title: p.title, category: p.category })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("GET /api/seed error:", error);
    return NextResponse.json(
      { success: false, message: "Seeding failed", error: error.message },
      { status: 500 }
    );
  }
}
