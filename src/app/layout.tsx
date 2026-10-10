import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AntdProvider from "@/components/AntdProvider";
import dbConnect from "@/lib/dbConnect";

import ClientOverlays from "@/components/ClientOverlays";
import SiteSetting, { DEFAULT_SITE_SETTINGS } from "@/models/SiteSetting";

import {
  getOrganizationSchema,
  getWebSiteSchema,
  getStoreSchema,
} from "@/lib/jsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = DEFAULT_SITE_SETTINGS.general.siteName || "MSH BloomCraft";
  let tagline = DEFAULT_SITE_SETTINGS.general.tagline || "PLANT SHOP";
  let faviconUrl = "";

  try {
    await dbConnect();
    const settings = await (SiteSetting as any).getSettings();
    if (settings?.general?.siteName) {
      siteName = settings.general.siteName;
    }
    if (settings?.general?.tagline) {
      tagline = settings.general.tagline;
    }
    if (settings?.general?.faviconUrl) {
      faviconUrl = settings.general.faviconUrl;
    }
  } catch (e) {
    // Graceful fallback to default values
  }

  return {
    metadataBase: new URL("https://my-nursery-flame.vercel.app"),
    title: {
      default: `${siteName} | Premium Online Plant Nursery in Bangladesh`,
      template: `%s | ${siteName}`,
    },
    description:
      "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
    keywords: [
      "nursery bd",
      "buy plants online bangladesh",
      "indoor plants dhaka",
      "organic fertilizer bangladesh",
      "bonsai tree dhaka",
      siteName.toLowerCase(),
    ],
    icons: faviconUrl ? { icon: faviconUrl, shortcut: faviconUrl } : { icon: "/favicon.ico" },
    alternates: {
      canonical: "https://my-nursery-flame.vercel.app",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://my-nursery-flame.vercel.app",
      siteName: siteName,
      title: `${siteName} | Premium Online Plant Nursery in Bangladesh`,
      description:
        "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description:
        "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
    },
    verification: {
      google: "lckpvS4U3i_DIG-uJPzQdq4_oKQgNv_NFgdVfRYhSnk",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();
  const storeSchema = getStoreSchema();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F8F4]" suppressHydrationWarning>
        {/* AntdProvider enables App.useApp() (message/notification) globally */}
        <AntdProvider>
          <Navbar />
          <ClientOverlays />
          <main className="flex-1">{children}</main>
          <Footer />
        </AntdProvider>
      </body>
    </html>
  );
}
