/**
 * Default Homepage Configuration Constants
 * Safe for both Client Components and Server-side Mongoose models.
 * STRICT REQUIREMENT: NO EMOJIS.
 */

export const DEFAULT_BOTANICAL_CATEGORIES = [
  {
    name: "Living Plants",
    slug: "plant",
    productCount: 4,
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80",
  },
  {
    name: "Organic Fertilizers",
    slug: "fertilizer",
    productCount: 2,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  },
  {
    name: "Tools & Ceramic Pots",
    slug: "tool",
    productCount: 3,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
  },
  {
    name: "Bonsai & Rare Palms",
    slug: "bonsai-plants",
    productCount: 2,
    image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=600&q=80",
  },
];

export const DEFAULT_HOMEPAGE_CONFIG = {
  heroSlider: {
    isEnabled: true,
    slides: [
      {
        badge: "# AIR PURIFIER COLLECTION",
        title: "Breathe Cleaner Air With Living Foliage",
        subtitle:
          "NASA-recommended indoor plants that naturally purify benzene, formaldehyde, and airborne toxins in living spaces.",
        buttonText: "Shop Air Purifiers",
        buttonUrl: "/collections",
        imageUrl:
          "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1400&q=85",
        floatingCard: {
          title: "Peace Lily (Spathiphyllum)",
          price: "৳380",
          link: "/products",
        },
      },
      {
        badge: "# THE BONSAI SERIES",
        title: "Sculpted Bonsai & Ancient Specimen Foliage",
        subtitle:
          "Hand-crafted dwarf trees and living sculptures bringing meditative calm and timeless green art to modern homes.",
        buttonText: "Explore Bonsai",
        buttonUrl: "/collections",
        imageUrl:
          "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1400&q=85",
        floatingCard: {
          title: "Ficus Retusa Bonsai",
          price: "৳1,250",
          link: "/products",
        },
      },
      {
        badge: "# RARE BOTANICALS",
        title: "Exotic Indoor Monstera & Variegated Gems",
        subtitle:
          "Sustainably propagated statement greenery, acclimatized for vigorous indoor growth with minimal watering.",
        buttonText: "Shop Rare Plants",
        buttonUrl: "/collections",
        imageUrl:
          "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1400&q=85",
        floatingCard: {
          title: "Monstera Albo Variegata",
          price: "৳1,850",
          link: "/products",
        },
      },
    ],
  },
  categoriesSection: {
    isEnabled: true,
    title: "Curated Plant Collections",
    subtitle: "EXPLORE BOTANICALS TAILORED FOR YOUR LIFESTYLE AND LIGHTING CONDITIONS",
    viewAllText: "View All",
    viewAllUrl: "/collections",
    perks: [
      {
        icon: "Headphones",
        title: "Expert Guidance",
        description: "Once-care support 24/7",
      },
      {
        icon: "Leaf",
        title: "Sustainable & Safe",
        description: "Eco-friendly & pesticide-free",
      },
      {
        icon: "Package",
        title: "Packed with Care",
        description: "Safe delivery to your door",
      },
      {
        icon: "Gift",
        title: "Loyalty Rewards",
        description: "Earn points & save more",
      },
    ],
  },
  dealsSection: {
    isEnabled: true,
    badge: "LIMITED TIME",
    title: "Botanical Flash Deals",
    subtitle: "Seasonal markdowns on our healthiest, nursery-grown favourites.",
    countdownEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    displayType: "slider",
    dealProductIds: [],
    discountPercentage: 15,
  },
  promoBanners: {
    isEnabled: true,
    banner1: {
      badge: "Indoor Planters",
      title: "Succulent & Cactus Living Arrangement",
      buttonText: "Explore Kits",
      buttonUrl: "/products?category=plant",
      imageUrl:
        "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=700&q=80",
    },
    banner2: {
      badge: "Soil Nutrition",
      title: "100% Organic Soil & Earthworm Compost",
      buttonText: "Shop Soil & Compost",
      buttonUrl: "/products?category=fertilizer",
      imageUrl:
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&q=80",
    },
  },
  newArrivals: {
    isEnabled: true,
    badge: "FRESHLY POTTED",
    title: "New Arrivals & Bestsellers",
    spotlightBanner: {
      badge: "FEATURED SPECIMEN",
      title: "Buy a great Coconut Bonsai",
      subtitle: "Grown for 5+ years with healthy root arches",
      price: "৳1,250",
      buttonText: "Buy Now",
      buttonUrl: "/collections",
      imageUrl:
        "https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000&q=85",
    },
  },
  topRankings: {
    isEnabled: true,
  },
  newsletter: {
    isEnabled: true,
    title: "Join The Botanical Society",
    subtitle:
      "Weekly seasonal plant-care guides, organic gardening tips and subscriber-only flash discounts, straight to your inbox.",
    buttonText: "Subscribe",
    plantImageUrl:
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=85",
  },
  blogSection: {
    isEnabled: true,
    title: "Latest Plant Care Guides",
    subtitle: "Practical advice from our certified botanists and nursery caretakers",
  },
  guaranteeStrip: {
    isEnabled: true,
  },
};
