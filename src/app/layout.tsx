import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import AntdProvider from "@/components/AntdProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenLeaf Nursery — Plants, Tools & Fertilizers",
  description:
    "Shop premium indoor plants, organic fertilizers, and professional gardening tools at GreenLeaf Nursery. Fast delivery across Bangladesh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBFBFA]">
        {/* AntdProvider enables App.useApp() (message/notification) globally */}
        <AntdProvider>
          <Navbar />
          {/* CartDrawer: fixed slide-over panel, reads isCartOpen from Zustand */}
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </AntdProvider>
      </body>
    </html>
  );
}
