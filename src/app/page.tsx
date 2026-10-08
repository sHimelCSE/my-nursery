import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import dbConnect from "@/lib/dbConnect";
import SiteSetting, { DEFAULT_SITE_SETTINGS } from "@/models/SiteSetting";

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

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
