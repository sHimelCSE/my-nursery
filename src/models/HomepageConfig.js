import mongoose, { Schema } from "mongoose";

const SlideSchema = new Schema(
  {
    badge: { type: String, default: "# AIR PURIFIER COLLECTION" },
    title: { type: String, default: "Breathe Cleaner Air With Living Foliage" },
    subtitle: {
      type: String,
      default:
        "NASA-recommended indoor plants that naturally purify benzene, formaldehyde, and airborne toxins in living spaces.",
    },
    buttonText: { type: String, default: "Shop Air Purifiers" },
    buttonUrl: { type: String, default: "/collections" },
    imageUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1400&q=85",
    },
    floatingCard: {
      title: { type: String, default: "Peace Lily (Spathiphyllum)" },
      price: { type: String, default: "৳380" },
      link: { type: String, default: "/products" },
    },
  },
  { _id: true }
);

import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";
export { DEFAULT_HOMEPAGE_CONFIG };

const PerkSchema = new Schema(
  {
    icon: { type: String, default: "Headphones" },
    title: { type: String, default: "Expert Guidance" },
    description: { type: String, default: "Once-care support 24/7" },
  },
  { _id: false }
);

const HomepageConfigSchema = new Schema(
  {
    heroSlider: {
      isEnabled: { type: Boolean, default: true },
      slides: {
        type: [SlideSchema],
        default: DEFAULT_HOMEPAGE_CONFIG.heroSlider.slides,
      },
    },
    categoriesSection: {
      isEnabled: { type: Boolean, default: true },
      title: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.categoriesSection.title,
      },
      subtitle: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.categoriesSection.subtitle,
      },
      viewAllText: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllText,
      },
      viewAllUrl: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.categoriesSection.viewAllUrl,
      },
      perks: {
        type: [PerkSchema],
        default: DEFAULT_HOMEPAGE_CONFIG.categoriesSection.perks,
      },
    },
    dealsSection: {
      isEnabled: { type: Boolean, default: true },
      badge: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.dealsSection.badge,
      },
      title: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.dealsSection.title,
      },
      subtitle: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.dealsSection.subtitle,
      },
      countdownEndDate: {
        type: Date,
        default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      displayType: {
        type: String,
        enum: ["slider", "grid_load_more"],
        default: "slider",
      },
      dealProductIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      discountPercentage: {
        type: Number,
        default: 15,
      },
    },
    promoBanners: {
      isEnabled: { type: Boolean, default: true },
      banner1: {
        badge: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner1.badge,
        },
        title: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner1.title,
        },
        buttonText: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner1.buttonText,
        },
        buttonUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner1.buttonUrl,
        },
        imageUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner1.imageUrl,
        },
      },
      banner2: {
        badge: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner2.badge,
        },
        title: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner2.title,
        },
        buttonText: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner2.buttonText,
        },
        buttonUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner2.buttonUrl,
        },
        imageUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.promoBanners.banner2.imageUrl,
        },
      },
    },
    newArrivals: {
      isEnabled: { type: Boolean, default: true },
      badge: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.badge,
      },
      title: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.title,
      },
      spotlightBanner: {
        badge: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.badge,
        },
        title: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.title,
        },
        subtitle: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.subtitle,
        },
        price: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.price,
        },
        buttonText: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.buttonText,
        },
        buttonUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.buttonUrl,
        },
        imageUrl: {
          type: String,
          default: DEFAULT_HOMEPAGE_CONFIG.newArrivals.spotlightBanner.imageUrl,
        },
      },
    },
    topRankings: {
      isEnabled: { type: Boolean, default: true },
    },
    newsletter: {
      isEnabled: { type: Boolean, default: true },
      title: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newsletter.title,
      },
      subtitle: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newsletter.subtitle,
      },
      buttonText: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newsletter.buttonText,
      },
      plantImageUrl: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.newsletter.plantImageUrl,
      },
    },
    blogSection: {
      isEnabled: { type: Boolean, default: true },
      title: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.blogSection.title,
      },
      subtitle: {
        type: String,
        default: DEFAULT_HOMEPAGE_CONFIG.blogSection.subtitle,
      },
    },
    guaranteeStrip: {
      isEnabled: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.HomepageConfig;
}

const HomepageConfig =
  mongoose.models.HomepageConfig ||
  mongoose.model("HomepageConfig", HomepageConfigSchema);

export default HomepageConfig;
