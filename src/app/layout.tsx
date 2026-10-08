import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import AntdProvider from "@/components/AntdProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import WishlistNotifier from "@/components/WishlistNotifier";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://my-nursery-flame.vercel.app"),
  title: {
    default: "GreenLeaf Botanical Studio | Premium Online Plant Nursery in Bangladesh",
    template: "%s | GreenLeaf Botanical Studio",
  },
  description:
    "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
  keywords: [
    "nursery bd",
    "buy plants online bangladesh",
    "indoor plants dhaka",
    "organic fertilizer bangladesh",
    "bonsai tree dhaka",
    "greenleaf botanical studio",
  ],
  alternates: {
    canonical: "https://my-nursery-flame.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://my-nursery-flame.vercel.app",
    siteName: "GreenLeaf Botanical Studio",
    title: "GreenLeaf Botanical Studio | Premium Online Plant Nursery in Bangladesh",
    description:
      "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenLeaf Botanical Studio",
    description:
      "Premium botanical sanctuary providing healthy acclimatized house plants, bonsai specimens, organic potting mediums, and modern planters across Bangladesh.",
  },
  verification: {
    google: "h0iY9eD-3K79mXf6G0HgJAgqtSwrCuweweUOlcthHkg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();
  const storeSchema = getStoreSchema();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
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
          {/* CartDrawer: fixed slide-over panel, reads isCartOpen from Zustand */}
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Wishlist popup toast notification */}
          <WishlistNotifier />
          {/* Floating WhatsApp Support Button */}
          <WhatsAppButton />
        </AntdProvider>
      </body>
    </html>
  );
}
