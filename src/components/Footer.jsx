"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  HeartFilled,
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
  WhatsAppOutlined,
} from "@ant-design/icons";

const DEFAULT_FOOTER_LINKS = [
  { label: "All Botanical Products", url: "/products" },
  { label: "Indoor & Balcony Plants", url: "/products?category=plant" },
  { label: "100% Organic Fertilizers", url: "/products?category=fertilizer" },
  { label: "Ceramic Pots & Garden Tools", url: "/products?category=tool" },
  { label: "Track My Orders", url: "/dashboard" },
];

export default function Footer() {
  const pathname = usePathname();
  const [footerLinks, setFooterLinks] = useState(DEFAULT_FOOTER_LINKS);

  useEffect(() => {
    fetch("/api/admin/menu?location=footer")
      .then((res) => res.json())
      .then((data) => {
        const items = data.menus || data.data;
        if (data.success && Array.isArray(items) && items.length > 0) {
          setFooterLinks(
            items.map((m) => ({
              label: m.label,
              url: m.url,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Hide customer store Footer on /Manage_Admin pages
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-emerald-100/80 text-slate-800 mt-auto">
      {/* ─── Top Trust Banner ─────────────────────────────────────────────── */}
      <div className="border-b border-emerald-100/60 bg-[#FAFBF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/50 flex items-center justify-center text-xl shrink-0">
                🌿
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Fresh & Healthy Plants</h4>
                <p className="text-[11px] text-slate-500">Nursery grown & quality inspected</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/50 flex items-center justify-center text-xl shrink-0">
                🚚
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Nationwide Safe Delivery</h4>
                <p className="text-[11px] text-slate-500">Fast doorstep service across BD</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/50 flex items-center justify-center text-xl shrink-0">
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">48h Plant Replacement</h4>
                <p className="text-[11px] text-slate-500">100% guarantee on damaged arrivals</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/50 flex items-center justify-center text-xl shrink-0">
                💵
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Cash on Delivery (COD)</h4>
                <p className="text-[11px] text-slate-500">Pay safely after receiving goods</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Bio (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/50 flex items-center justify-center text-lg shadow-xs font-bold">
                🌿
              </div>
              <span className="font-bold text-lg tracking-tight text-emerald-950">
                GreenLeaf <span className="text-[#2D6A4F]">Nursery</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              Bangladesh&apos;s premier botanical haven. We deliver handpicked, healthy indoor plants, flowering varieties, 100% organic compost fertilizers, and gardening tools directly to your doorstep.
            </p>

            <div className="space-y-2 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <EnvironmentOutlined className="text-[#2D6A4F]" />
                <span>Sector 7, Uttara, Dhaka-1230, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneOutlined className="text-[#2D6A4F]" />
                <a href="tel:+8801712345678" className="hover:text-emerald-700 font-semibold transition-colors">
                  +880 1712-345678 (9 AM – 9 PM)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MailOutlined className="text-[#2D6A4F]" />
                <a href="mailto:support@greenleafnursery.com" className="hover:text-emerald-700 transition-colors">
                  support@greenleafnursery.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center text-sm transition-all"
                title="Facebook"
              >
                <FacebookFilled />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-pink-600 hover:border-pink-200 flex items-center justify-center text-sm transition-all"
                title="Instagram"
              >
                <InstagramFilled />
              </a>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 flex items-center justify-center text-sm transition-all"
                title="WhatsApp Support"
              >
                <WhatsAppOutlined />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center text-sm transition-all"
                title="YouTube"
              >
                <YoutubeFilled />
              </a>
            </div>
          </div>

          {/* Quick Links (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Quick Links (এক্সপ্লোর করুন)
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {footerLinks.map((item, idx) => (
                <li key={`${item.url}-${idx}`}>
                  <Link href={item.url} className="text-gray-600 hover:text-emerald-700 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Company
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  About Us (আমাদের সম্পর্কে)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Contact Us (যোগাযোগ)
                </Link>
              </li>
              <li>
                <Link href="/Manage_Admin" className="text-gray-500 hover:text-emerald-700 transition-colors">
                  Executive Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Legal & Customer Care
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Privacy Policy (গোপনীয়তা নীতি)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Terms & Conditions (শর্তাবলী)
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Return & Refund Policy (ফেরত নীতি)
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400">
                  Government Registered Agricultural Supplier
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ─── Bottom Copyright Bar ────────────────────────────────────────── */}
      <div className="border-t border-emerald-100/60 bg-[#FAFBF9] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {currentYear} GreenLeaf Nursery BD. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-emerald-700 transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-emerald-700 transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/refund" className="hover:text-emerald-700 transition-colors">
              Refunds
            </Link>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              Made with <HeartFilled className="text-red-500 text-[10px]" /> in Bangladesh
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
