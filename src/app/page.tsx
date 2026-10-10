import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import dbConnect from "@/lib/dbConnect";
import SiteSetting, { DEFAULT_SITE_SETTINGS } from "@/models/SiteSetting";

import {
  getCachedAllProducts,
  getCachedAllCategories,
  getCachedHomepageConfig,
  getCachedRecentBlogs,
} from "@/lib/cachedProducts";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = DEFAULT_SITE_SETTINGS.general.siteName || "MSH BloomCraft";

  try {
    await dbConnect();
    const settings = await (SiteSetting as any).getSettings();
    if (settings?.general?.siteName) {
      siteName = settings.general.siteName;
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${siteName} | Premium Online Plant Nursery in Bangladesh`,
    description:
      "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
    openGraph: {
      title: `${siteName} | Premium Online Plant Nursery in Bangladesh`,
      description:
        "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
      type: "website",
      locale: "en_US",
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Premium Online Plant Nursery in Bangladesh`,
      description:
        "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
    },
  };
}

export default async function HomePage() {
  const [products, categories, config, blogs] = await Promise.all([
    getCachedAllProducts().catch(() => []),
    getCachedAllCategories().catch(() => []),
    getCachedHomepageConfig().catch(() => null),
    getCachedRecentBlogs().catch(() => []),
  ]);

  return (
    <Suspense fallback={null}>
      <HomeClient
        initialProducts={products}
        initialCategories={categories}
        initialConfig={config}
        initialBlogs={blogs}
      />
    </Suspense>
  );
}

