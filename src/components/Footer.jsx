"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";
import { DEFAULT_FOOTER_MENUS } from "@/constants/defaultNavigation";
import BrandLogo from "@/components/BrandLogo";

const SERVICE_BADGES = [
  { icon: ShieldCheck, title: "Botanical Guarantee", desc: "100% healthy, nursery-grown plants" },
  { icon: Truck, title: "Express Delivery", desc: "Fast shipping across all 64 districts" },
  { icon: RotateCcw, title: "48-Hour Replacement", desc: "Instant transit claim protection" },
  { icon: CreditCard, title: "Secure Checkout", desc: "Cash on delivery or digital payment" },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [footerLinks, setFooterLinks] = useState(DEFAULT_FOOTER_MENUS);

  const loadFooterMenus = () => {
    fetch("/api/menu?location=footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.menus) && data.menus.length > 0) {
          setFooterLinks(data.menus);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    loadFooterMenus();

    const loadSettings = () => {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSiteSettings(data.data);
          }
        })
        .catch(() => { });
    };
    loadSettings();

    window.addEventListener("siteSettingsUpdated", loadSettings);
    window.addEventListener("navigationMenusUpdated", loadFooterMenus);

    return () => {
      window.removeEventListener("siteSettingsUpdated", loadSettings);
      window.removeEventListener("navigationMenusUpdated", loadFooterMenus);
    };
  }, []);

  // Hide customer store Footer on /Manage_Admin pages
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }

  const phone = siteSettings.general?.hotlinePhone || "+880 1712-345678";
  const email = siteSettings.general?.contactEmail || "support@greenleafnursery.com";
  const social = [
    { label: "Facebook", href: siteSettings.socialLinks?.facebook || "https://facebook.com", Icon: FacebookIcon },
    { label: "Twitter", href: siteSettings.socialLinks?.twitter || "https://twitter.com", Icon: TwitterIcon },
    { label: "Instagram", href: siteSettings.socialLinks?.instagram || "https://instagram.com", Icon: InstagramIcon },
    { label: "YouTube", href: siteSettings.socialLinks?.youtube || "https://youtube.com", Icon: YoutubeIcon },
  ];

  // Group dynamic links by `footerColumn`
  const groupedColumns = footerLinks.reduce((acc, item) => {
    const colName = item.footerColumn || "Shop";
    if (!acc[colName]) acc[colName] = [];
    acc[colName].push(item);
    return acc;
  }, {});

  const columnNames = Object.keys(groupedColumns);

  return (
    <footer id="main-footer" className="site-footer bg-[#F7F8F4] text-[#5A6B5C] mt-auto">
      {/* ─── Pre-footer guarantee strip ─────────────────────────────────── */}
      <section id="trust-guarantee" className="section-trust-guarantee max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#EBF0E6] rounded-3xl p-3">
          {SERVICE_BADGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5">
              <span className="w-11 h-11 rounded-full bg-[#EBF0E6] text-[#1E3F20] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[#1C2B1E] leading-tight">{title}</h4>
                <p className="text-xs text-[#5A6B5C] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Main Dynamic Footer Grid ───────────────────────────────────────── */}
      <div className="border-t border-[#E3E8DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-[250px_repeat(auto-fit,minmax(140px,1fr))] gap-x-8 gap-y-10">
            {/* 1: Brand bio & Social Icons */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 space-y-5 lg:pr-4">
              <Link
                href="/"
                className="inline-flex items-center group"
                aria-label={siteSettings.general?.siteName || "GreenLeaf"}
              >
                <BrandLogo
                  isFooter
                  logoType={siteSettings.general?.logoType}
                  logoUrl={siteSettings.general?.logoUrl}
                  siteName={siteSettings.general?.siteName}
                  tagline={siteSettings.general?.tagline}
                />
              </Link>

              <p className="text-sm leading-relaxed max-w-sm">
                {siteSettings.footer?.bioText ||
                  "Premium botanical sanctuary providing healthy acclimatized house plants, organic potting mediums, and ceramic vessels crafted for enduring living spaces."}
              </p>

              <div className="flex items-center gap-2.5">
                {social.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white border border-gray-200 text-[#5A6B5C] hover:text-white hover:bg-[#1E3F20] hover:border-[#1E3F20] flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* 2+: Dynamic Columns Grouped from MongoDB */}
            {columnNames.map((colTitle) => (
              <div key={colTitle}>
                <h3 className="text-sm font-extrabold text-[#1C2B1E] mb-4">
                  {colTitle}
                </h3>
                <ul className="space-y-2.5">
                  {groupedColumns[colTitle].map((item) => (
                    <li key={item._id || `${item.label}-${item.url}`}>
                      <Link
                        href={item.url}
                        className="text-sm text-[#5A6B5C] hover:text-[#1E3F20] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Final Column: Contact Info */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
              <h3 className="text-sm font-extrabold text-[#1C2B1E] mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1E3F20] shrink-0 mt-0.5" />
                  <span>{siteSettings.general?.storeAddress || "Sector 7, Uttara, Dhaka-1230, Bangladesh"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#1E3F20] shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-[#1E3F20] font-medium transition-colors">
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#1E3F20] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-[#1E3F20] transition-colors break-all">
                    {email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#1E3F20] shrink-0" />
                  <span>{siteSettings.general?.businessHours || "Sun – Sat, 9 AM – 9 PM"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Copyright ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#E3E8DD] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A6B5C]">
          <p>
            © {currentYear}{" "}
            {siteSettings.footer?.copyrightText || "GreenLeaf Botanical Nursery BD. All rights reserved."}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5">
            {Array.isArray(siteSettings.footer?.copyrightLinks) &&
            siteSettings.footer.copyrightLinks.length > 0 ? (
              siteSettings.footer.copyrightLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || "#"}
                  className="hover:text-[#1E3F20] transition-colors"
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/privacy" className="hover:text-[#1E3F20] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-[#1E3F20] transition-colors">
                  Terms of Service
                </Link>
                <Link href="/refund" className="hover:text-[#1E3F20] transition-colors">
                  Return &amp; Refund
                </Link>
              </>
            )}
            <Link
              href="/Manage_Admin"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin Portal <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
