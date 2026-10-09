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
        featuredProductId: null,
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
        featuredProductId: null,
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
        featuredProductId: null,
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
    featuredCategoryIds: [],
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
    showCountdown: true,
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
    showSpotlightBanner: true,
    tabs: [
      {
        label: "All Plants",
        sourceType: "preset",
        presetFilter: "all",
        categoryId: null,
      },
      {
        label: "New Arrivals",
        sourceType: "preset",
        presetFilter: "new_arrivals",
        categoryId: null,
      },
      {
        label: "Best Sellers",
        sourceType: "preset",
        presetFilter: "best_sellers",
        categoryId: null,
      },
    ],
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
    badge: "CUSTOMER FAVORITES",
    title: "Mini Top Rankings",
    subtitle:
      "Top-rated botanical varieties ranked by gardener reviews and seasonal demand.",
    viewAllText: "View All Rankings",
    viewAllUrl: "/collections",
    columns: [
      {
        title: "Top Air Purifiers",
        browseUrl: "/collections",
        items: [
          { productId: null, badge: "NASA Verified", rank: 1 },
          { productId: null, badge: "Easy Care", rank: 2 },
          { productId: null, badge: "Night Oxygen", rank: 3 },
        ],
      },
      {
        title: "Collector Bonsai & Foliage",
        browseUrl: "/collections",
        items: [
          { productId: null, badge: "Living Art", rank: 1 },
          { productId: null, badge: "Hand-Crafted", rank: 2 },
          { productId: null, badge: "Urban Jungle", rank: 3 },
        ],
      },
      {
        title: "Organic Soils & Planters",
        browseUrl: "/collections",
        items: [
          { productId: null, badge: "100% Bio", rank: 1 },
          { productId: null, badge: "Drainage Hole", rank: 2 },
          { productId: null, badge: "Pest Shield", rank: 3 },
        ],
      },
    ],
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
    badge: "KNOWLEDGE BASE",
    title: "Latest Plant Care Guides",
    subtitle: "Practical advice from our certified botanists and nursery caretakers",
    viewAllText: "All Articles",
    viewAllUrl: "/blog",
    sourceMode: "latest",
    selectedBlogIds: [],
    displayCount: 3,
  },
  guaranteeStrip: {
    isEnabled: true,
    items: [
      {
        icon: "ShieldCheck",
        title: "100% Healthy Plant Guarantee",
        description:
          "Acclimatized for resilience. 48-hour replacement warranty if any plant arrives stressed.",
      },
      {
        icon: "Package",
        title: "Eco-Friendly Bio Packaging",
        description:
          "Biodegradable coco-peat liners & recyclable cushioning to protect tender foliage in transit.",
      },
      {
        icon: "Truck",
        title: "Doorstep Safe Delivery",
        description:
          "Climate-conscious plant couriers delivering fresh greenery across Dhaka & nationwide.",
      },
      {
        icon: "Headphones",
        title: "Lifetime Botanical Advice",
        description:
          "Ongoing watering & repotting guidance from our experienced horticulturists post-purchase.",
      },
    ],
  },
};
