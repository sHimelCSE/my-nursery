import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "GreenLeaf | Premium Online Plant Nursery in Bangladesh",
  description:
    "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
  openGraph: {
    title: "GreenLeaf | Premium Online Plant Nursery in Bangladesh",
    description:
      "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
    type: "website",
    locale: "en_US",
    siteName: "GreenLeaf Botanical Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenLeaf | Premium Online Plant Nursery in Bangladesh",
    description:
      "Discover premium indoor plants, organic fertilizers, and professional gardening tools delivered fresh across Bangladesh.",
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
