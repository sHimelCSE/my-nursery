"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  User,
  ShoppingBag,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  ArrowRight,
  Truck,
  Layers,
  Compass,
  MessageCircle,
} from "lucide-react";
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";
import { Badge, Dropdown } from "antd";
import { useSession, signOut } from "next-auth/react";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";
import { DEFAULT_NAVBAR_MENUS } from "@/constants/defaultNavigation";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dynamic Navigation Menus from MongoDB
  const [navMenus, setNavMenus] = useState(DEFAULT_NAVBAR_MENUS);

  // Active desktop hover menu (label or ID)
  const [activeHoverMenu, setActiveHoverMenu] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Mobile menu accordion state
  const [mobileAccordion, setMobileAccordion] = useState(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  // Wishlist & Cart state
  const wishlistItems = useWishlistStore((s) => s.items);
  const totalWishlist = mounted ? wishlistItems.length : 0;
  const totalCount = useCartStore((state) =>
    (state.items || []).reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = mounted ? totalCount : 0;

  // Site settings
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load navigation menus
  const loadMenus = () => {
    fetch("/api/menu?location=navbar")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.menus) && data.menus.length > 0) {
          setNavMenus(data.menus);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    setMounted(true);
    loadMenus();

    // Check localStorage cache first for zero-flicker instant brand rendering
    try {
      const cached = localStorage.getItem("app_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.general) {
          setSiteSettings(parsed);
          setSettingsLoaded(true);
        }
      }
    } catch {}

    // Dynamic Site Settings Integration
    const loadSettings = () => {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSiteSettings(data.data);
            setSettingsLoaded(true);
            try {
              localStorage.setItem("app_site_settings", JSON.stringify(data.data));
            } catch {}
          }
        })
        .catch(() => { });
    };
    loadSettings();

    window.addEventListener("siteSettingsUpdated", loadSettings);
    window.addEventListener("navigationMenusUpdated", loadMenus);

    return () => {
      window.removeEventListener("siteSettingsUpdated", loadSettings);
      window.removeEventListener("navigationMenusUpdated", loadMenus);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setActiveHoverMenu(null);
    setMobileAccordion(null);
  }, [pathname]);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (!mounted) return;
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, mounted]);

  // Isolate Admin Portal: Do not render customer store Navbar on /Manage_Admin routes
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }

  // Hover handlers for Desktop Mega Menu & Dropdown
  const handleMouseEnter = (menuId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveHoverMenu(menuId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHoverMenu(null);
    }, 150);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const productsSection = document.getElementById("new-arrivals") || document.getElementById("products");
    if (productsSection) {
      const searchInput = document.getElementById("product-search-input");
      if (searchInput) {
        searchInput.value = searchQuery;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      productsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}#new-arrivals`;
    }
    setSearchOpen(false);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    setMenuOpen(false);
    const productsSection = document.getElementById("new-arrivals") || document.getElementById("products");
    if (productsSection) {
      const searchInput = document.getElementById("product-search-input");
      if (searchInput) {
        searchInput.value = mobileSearchQuery;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      productsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/?search=${encodeURIComponent(mobileSearchQuery.trim())}#new-arrivals`;
    }
  };

  // Group sub-items by `group` name helper
  const groupSubItems = (items = []) => {
    return items.reduce((acc, item) => {
      const g = item.group || "Explore";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {});
  };

  // My Account dropdown items
  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div className="py-1 px-1 cursor-default">
          <p className="text-[13px] font-bold text-gray-900 truncate max-w-[190px]">
            {session?.user?.name || "Botanical Member"}
          </p>
          <p className="text-[11px] text-gray-500 truncate max-w-[190px]">
            {session?.user?.email}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF0E6] text-[#1E3F20] uppercase tracking-wider">
            {session?.user?.role === "admin" ? "Store Administrator" : "Active Member"}
          </span>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "dashboard",
      icon: <LayoutDashboard className="w-3.5 h-3.5 text-[#4E7D3E]" />,
      label: (
        <Link href="/dashboard" className="text-[13px] font-medium text-gray-700 hover:text-[#1E3F20]">
          My Orders & Dashboard
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogOut className="w-3.5 h-3.5 text-red-500" />,
      danger: true,
      label: <span className="text-[13px] font-medium">Sign Out</span>,
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <header id="main-header" className="site-header sticky top-0 z-50 w-full transition-all duration-300">
      {/* ── Top Mini Bar ───────────────────────────────────── */}
      <div className="bg-[#1E3F20] text-[#EBF0E6] text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Social Media Icons */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-emerald-200/90 hidden sm:inline-block">
              Follow Us:
            </span>
            <div className="flex items-center gap-2.5 text-emerald-100">
              <a
                href={siteSettings.socialLinks?.facebook || "https://facebook.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={siteSettings.socialLinks?.twitter || "https://twitter.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={siteSettings.socialLinks?.instagram || "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={siteSettings.socialLinks?.youtube || "https://youtube.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            {siteSettings.topbar?.isEnabled !== false && (
              <Link
                href={siteSettings.topbar?.announcementLink || "/#products"}
                className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-100/90 ml-4 pl-4 border-l border-emerald-700/60 hover:text-white transition-colors"
              >
                <Sparkles className="w-3 h-3 text-[#4E7D3E]" />
                <span>{siteSettings.topbar?.announcementText || "Free Doorstep Delivery on orders over ৳1000"}</span>
              </Link>
            )}
          </div>

          {/* Right: Hotline, Currency & My Account */}
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`tel:${(siteSettings.general?.hotlinePhone || DEFAULT_SITE_SETTINGS.general.hotlinePhone).replace(/\s+/g, "")}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#4E7D3E]" />
              <span>{siteSettings.general?.hotlinePhone || DEFAULT_SITE_SETTINGS.general.hotlinePhone}</span>
            </a>

            <span className="text-emerald-300/60 hidden sm:inline">|</span>

            <Link
              href="/track-order"
              className="hidden md:inline-flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors"
            >
              <Truck className="w-3 h-3 text-[#4E7D3E]" />
              <span>Track Order</span>
            </Link>

            <span className="text-emerald-300/60 hidden md:inline">|</span>

            <span className="text-emerald-100 font-medium">
              {siteSettings.general?.currency || "BDT (৳)"}
            </span>

            <span className="text-emerald-300/60">|</span>

            {/* My Account Dropdown Trigger */}
            {status === "loading" ? (
              <span className="w-16 h-3 bg-emerald-700/40 rounded animate-pulse" />
            ) : session?.user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
                <button
                  id="top-my-account-btn"
                  className="flex items-center gap-1.5 text-emerald-100 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#4E7D3E]" />
                  <span className="max-w-[100px] truncate">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2 font-medium">
                <Link href="/login" className="text-emerald-100 hover:text-white transition-colors flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#4E7D3E]" />
                  <span>My Account</span>
                </Link>
                <span className="text-emerald-300/40">/</span>
                <Link href="/register" className="text-emerald-100 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ────────────────────────────────────── */}
      <div
        className={`w-full transition-all duration-300 relative ${scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-xs shadow-gray-900/5 border-b border-gray-100"
          : "bg-white/90 backdrop-blur-md border-b border-gray-100/80"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Dynamic botanical brand logo */}
            <Link
              href="/"
              className="flex items-center group shrink-0 min-w-[140px] h-9 sm:h-16"
              aria-label={siteSettings.general?.siteName || "Store Home"}
            >
              {!settingsLoaded && !siteSettings.general?.logoUrl && !siteSettings.general?.siteName ? (
                <div
                  className="min-w-[140px] h-9 sm:h-16 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-28 sm:w-36 h-8 sm:h-10 bg-gray-100/60 rounded-lg animate-pulse" />
                </div>
              ) : (
                <BrandLogo
                  logoType={siteSettings.general?.logoType}
                  logoUrl={siteSettings.general?.logoUrl}
                  siteName={siteSettings.general?.siteName}
                  tagline={siteSettings.general?.tagline}
                  isLoading={!settingsLoaded && !siteSettings.general?.logoUrl && !siteSettings.general?.siteName}
                />
              )}
            </Link>

            {/* Desktop Navigation Menu Bar */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
              {navMenus.map((menu) => {
                const menuKey = menu._id || menu.label;
                const isHome = menu.url === "/";
                const isActive = isHome ? pathname === "/" : pathname === menu.url || (menu.url !== "/" && pathname?.startsWith(menu.url));
                const isHovered = activeHoverMenu === menuKey;

                // ── CASE 1: MEGA MENU ──────────────────────────────
                if (menu.menuType === "mega_menu") {
                  const groupedItems = groupSubItems(menu.items || []);
                  const groupKeys = Object.keys(groupedItems);
                  const promo = menu.megaMenuPromo || {};

                  return (
                    <div
                      key={menuKey}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => handleMouseEnter(menuKey)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={menu.url || "/collections"}
                        className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                          ? "text-[#1E3F20] font-bold"
                          : "text-gray-700 hover:text-[#2D5A27]"
                          }`}
                      >
                        <span>{menu.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isHovered ? "rotate-180 text-[#2D5A27]" : "text-gray-400"
                          }`} />

                        {/* Active indicator dot */}
                        {isActive && (
                          <motion.span
                            layoutId="active-nav-dot"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-[#2D5A27] rounded-full"
                          />
                        )}
                      </Link>

                      {/* Mega Menu Floating Container */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.99 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="fixed left-1/2 -translate-x-1/2 top-[85px] w-[95vw] max-w-6xl z-50 pointer-events-auto"
                          >
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-xl">
                              <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-8">
                                {/* Left & Center: Multi-Column Sub-Links */}
                                <div className={`grid gap-6 ${groupKeys.length >= 3 ? "grid-cols-3" : groupKeys.length === 2 ? "grid-cols-2" : "grid-cols-1"
                                  }`}>
                                  {groupKeys.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-gray-400 col-span-full">
                                      <p>Browse our entire catalog of botanical specimens.</p>
                                      <Link
                                        href="/collections"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2D5A27] hover:underline"
                                      >
                                        <span>View All Collections</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </Link>
                                    </div>
                                  ) : (
                                    groupKeys.map((groupName) => (
                                      <div key={groupName} className="space-y-3">
                                        {/* Column Header */}
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                          {/* <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" /> */}
                                          <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-[#1A2E22]">
                                            {groupName}
                                          </h4>
                                        </div>

                                        {/* Link Items */}
                                        <ul className="space-y-2">
                                          {groupedItems[groupName].map((item) => (
                                            <li key={item._id || `${item.label}-${item.url}`}>
                                              <Link
                                                href={item.url}
                                                className="group/item flex items-center gap-2 text-xs text-gray-700 hover:text-[#2D5A27] transition-all hover:translate-x-1"
                                              >
                                                {/* <span className="w-1 h-1 rounded-full bg-gray-300 group-hover/item:bg-[#2D5A27] group-hover/item:scale-125 transition-all" /> */}
                                                <span className="font-medium group-hover/item:font-bold">
                                                  {item.label}
                                                </span>
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Right: Promotional Featured Card */}
                                <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                                  {promo?.isEnabled !== false && promo?.imageUrl ? (
                                    <div className="bg-[#F7F8F4] rounded-2xl p-4 border border-emerald-100/70 flex flex-col justify-between h-full group/promo">
                                      <div>
                                        {/* Image Container with Badge */}
                                        <div className="relative h-44 rounded-xl overflow-hidden bg-white shadow-2xs">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={promo.imageUrl}
                                            alt={promo.title || "Botanical specimen"}
                                            className="w-full h-full object-cover group-hover/promo:scale-105 transition-transform duration-500"
                                          />
                                          {promo.badge && (
                                            <span className="absolute top-2.5 left-2.5 bg-[#1E3F20]/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                              {promo.badge}
                                            </span>
                                          )}
                                        </div>

                                        {/* Headline & Subtitle */}
                                        <div className="mt-3.5 space-y-1">
                                          <h4 className="font-black text-sm text-[#1A2E22] leading-tight">
                                            {promo.title || "Trending Indoor Plants"}
                                          </h4>
                                          <p className="text-xs text-[#5A6B5C] line-clamp-2">
                                            {promo.subtitle || "Up to 25% Off Nursery Fresh"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* CTA Button */}
                                      <div className="mt-4 pt-3 border-t border-emerald-100/60">
                                        <Link
                                          href={promo.link || "/collections"}
                                          className="w-full py-2 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs group/btn"
                                        >
                                          <span>Shop Collection</span>
                                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-[#F7F8F4] rounded-2xl p-5 border border-emerald-100/70 flex flex-col justify-between h-full">
                                      <div className="space-y-2">
                                        <span className="w-9 h-9 rounded-xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center">
                                          <Compass className="w-5 h-5 stroke-[2]" />
                                        </span>
                                        <h4 className="font-extrabold text-sm text-[#1A2E22]">
                                          Botanical Variety Guarantee
                                        </h4>
                                        <p className="text-xs text-[#5A6B5C] leading-relaxed">
                                          Every specimen is nursery acclimatized, potted in living soil, and backed by our 48-hour healthy delivery pledge.
                                        </p>
                                      </div>
                                      <Link
                                        href="/collections"
                                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2D5A27] hover:underline"
                                      >
                                        <span>Browse All Plants</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // ── CASE 2: SIMPLE DROPDOWN ────────────────────────
                if (menu.menuType === "dropdown") {
                  return (
                    <div
                      key={menuKey}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => handleMouseEnter(menuKey)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={menu.url || "#"}
                        className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                          ? "text-[#1E3F20] font-bold"
                          : "text-gray-700 hover:text-[#2D5A27]"
                          }`}
                      >
                        <span>{menu.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isHovered ? "rotate-180 text-[#2D5A27]" : "text-gray-400"
                          }`} />

                        {isActive && (
                          <motion.span
                            layoutId="active-nav-dot"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-[#2D5A27] rounded-full"
                          />
                        )}
                      </Link>

                      {/* Dropdown Card */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 top-[75px] min-w-[240px] z-50 pointer-events-auto"
                          >
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 backdrop-blur-xl">
                              <div className="space-y-1">
                                {(menu.items || []).map((sub) => (
                                  <Link
                                    key={sub._id || `${sub.label}-${sub.url}`}
                                    href={sub.url}
                                    className="group/sub flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-700 hover:text-[#1E3F20] hover:bg-[#EBF0E6] transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {/* <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] opacity-50 group-hover/sub:opacity-100 group-hover/sub:scale-125 transition-all" /> */}
                                      <span className="font-medium group-hover/sub:font-bold">
                                        {sub.label}
                                      </span>
                                    </div>
                                    {/* <ChevronDown className="w-3 h-3 text-gray-300 -rotate-90 group-hover/sub:text-[#2D5A27] group-hover/sub:translate-x-0.5 transition-all" /> */}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // ── CASE 3: STANDARD LINK ──────────────────────────
                return (
                  <Link
                    key={menuKey}
                    href={menu.url || "/"}
                    className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 group ${isActive
                      ? "text-[#1E3F20] font-bold"
                      : "text-gray-700 hover:text-[#2D5A27]"
                      }`}
                  >
                    <span>{menu.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="active-nav-dot"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-[#2D5A27] rounded-full"
                      />
                    ) : (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2D5A27] rounded-full group-hover:w-4 transition-all duration-200" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Search Icon Trigger */}
              <button
                type="button"
                aria-label="Search Store"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:text-[#1E3F20] hover:bg-[#EBF0E6] transition-all duration-200 cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Wishlist Icon Trigger */}
              <Link
                href="/wishlist"
                aria-label={`Wishlist (${totalWishlist} items)`}
                className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:text-[#1E3F20] hover:bg-[#EBF0E6] transition-all duration-200"
              >
                <Badge
                  count={totalWishlist}
                  size="small"
                  styles={{
                    indicator: {
                      backgroundColor: "#1E3F20",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 6px rgba(30, 63, 32, 0.35)",
                      fontSize: "10px",
                      minWidth: "16px",
                      height: "16px",
                      lineHeight: "16px",
                      fontWeight: "700",
                    },
                  }}
                >
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                </Badge>
              </Link>

              {/* Cart Drawer Trigger */}
              <motion.button
                id="navbar-cart-btn"
                aria-label={`Open Cart (${totalItems} items)`}
                onClick={openCart}
                whileTap={{ scale: 0.94 }}
                className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#F2F5ED] hover:bg-[#EBF0E6] text-gray-800 hover:text-[#1E3F20] border border-gray-200/80 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <Badge
                  count={totalItems}
                  size="small"
                  styles={{
                    indicator: {
                      backgroundColor: "#4E7D3E",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 6px rgba(123, 174, 55, 0.4)",
                      fontSize: "11px",
                      minWidth: "18px",
                      height: "18px",
                      lineHeight: "18px",
                      fontWeight: "700",
                    },
                  }}
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                </Badge>
              </motion.button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                id="mobile-menu-toggle"
                aria-label="Open Navigation Menu"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:text-[#1E3F20] hover:bg-[#EBF0E6] transition-all duration-200 cursor-pointer ml-1"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search Dropdown Bar ────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100 bg-[#F7F8F4] px-4 py-3 shadow-inner"
            >
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search botanical plants, organic fertilizers, tools & ceramic pots..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-full border border-gray-200 focus:outline-none focus:border-[#4E7D3E] focus:ring-2 focus:ring-[#4E7D3E]/20 text-gray-800 placeholder-gray-400 shadow-2xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Dedicated Off-Canvas Mobile Drawer ─────────────────────────── */}
      {mounted && (
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Semi-transparent blurred backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9998] lg:hidden cursor-pointer"
                aria-hidden="true"
              />

              {/* Slide-out Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[9999] shadow-2xl flex flex-col justify-between overflow-hidden lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation Drawer"
              >
                {/* 1. Drawer Header */}
                <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center min-w-[140px] h-9"
                    aria-label={siteSettings.general?.siteName || "Store Home"}
                  >
                    {!settingsLoaded && !siteSettings.general?.logoUrl && !siteSettings.general?.siteName ? (
                      <div className="min-w-[140px] h-9 flex items-center" aria-hidden="true">
                        <div className="w-28 h-7 bg-gray-100/60 rounded-lg animate-pulse" />
                      </div>
                    ) : (
                      <BrandLogo
                        logoType={siteSettings.general?.logoType}
                        logoUrl={siteSettings.general?.logoUrl}
                        siteName={siteSettings.general?.siteName}
                        tagline={siteSettings.general?.tagline}
                        isLoading={!settingsLoaded && !siteSettings.general?.logoUrl && !siteSettings.general?.siteName}
                      />
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Close Mobile Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. Quick In-Drawer Search Input */}
                <div className="p-3.5 px-4 border-b border-gray-100 bg-[#FAFBF9] shrink-0">
                  <form onSubmit={handleMobileSearchSubmit} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search botanical plants, pots, fertilizers..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]/20 text-gray-800 placeholder-gray-400 shadow-2xs"
                    />
                  </form>
                </div>

                {/* 3. Intuitive Accordion Navigation (Middle Body) */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1">
                  {navMenus.map((menu) => {
                    const menuKey = menu._id || menu.label;
                    const hasChildren =
                      (menu.menuType === "mega_menu" || menu.menuType === "dropdown") &&
                      menu.items?.length > 0;
                    const isAccordionOpen = mobileAccordion === menuKey;

                    if (!hasChildren) {
                      return (
                        <Link
                          key={menuKey}
                          href={menu.url || "/"}
                          onClick={() => setMenuOpen(false)}
                          className="border-b border-gray-100/80 last:border-b-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-[#F2F6EF] hover:text-[#1E3F20] transition-colors"
                        >
                          <span>{menu.label}</span>
                          {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
                        </Link>
                      );
                    }

                    const grouped = groupSubItems(menu.items || []);
                    const groupKeys = Object.keys(grouped);

                    return (
                      <div key={menuKey} className="border-b border-gray-100/80 last:border-b-0 py-0.5">
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl hover:bg-[#F2F6EF] transition-colors">
                          <Link
                            href={menu.url && menu.url !== "#" ? menu.url : "#"}
                            onClick={(e) => {
                              if (!menu.url || menu.url === "#") {
                                e.preventDefault();
                                setMobileAccordion(isAccordionOpen ? null : menuKey);
                              } else {
                                setMenuOpen(false);
                              }
                            }}
                            className="flex items-center justify-between  rounded-xl text-sm font-semibold text-gray-800 hover:bg-[#F2F6EF] hover:text-[#1E3F20] transition-colors"
                          >
                            {menu.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setMobileAccordion(isAccordionOpen ? null : menuKey)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D5A27] hover:bg-emerald-50 cursor-pointer transition-colors"
                            aria-label={`Toggle ${menu.label} sub-items`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? "rotate-180 text-[#2D5A27]" : ""
                                }`}
                            />
                          </button>
                        </div>

                        {/* Accordion Sub-items */}
                        <AnimatePresence>
                          {isAccordionOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-4 pr-2 pb-2 pt-1 space-y-2.5"
                            >
                              {groupKeys.map((grp) => (
                                <div key={grp} className="space-y-1">
                                  {groupKeys.length > 1 && (
                                    <p className="text-xs font-extrabold text-[#2D5A27] uppercase tracking-wider pl-2">
                                      {grp}
                                    </p>
                                  )}
                                  <div className="space-y-0.5 border-l-2 border-emerald-100/80 pl-2.5">
                                    {grouped[grp].map((sub, sIdx) => (
                                      <Link
                                        key={sub._id || `${sub.label}-${sIdx}`}
                                        href={sub.url || "#"}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-1.5 text-xs font-medium text-gray-600 hover:text-[#1E3F20] transition-colors"
                                      >
                                        {sub.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Drawer Footer (Quick Utility Strip) */}
                <div className="p-4 border-t border-gray-100 bg-[#FAFBF9] shrink-0 space-y-2.5">
                  {/* Account & Wishlist Rows */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200/80 text-gray-700 hover:text-[#1E3F20] hover:border-emerald-200 transition-colors shadow-2xs"
                    >
                      <User className="w-4 h-4 text-[#2D5A27]" />
                      <span className="font-semibold truncate">My Account</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80 text-gray-700 hover:text-[#1E3F20] hover:border-emerald-200 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Heart className="w-4 h-4 text-[#2D5A27]" />
                        <span className="font-semibold truncate">Wishlist</span>
                      </div>
                      {totalWishlist > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#1E3F20] text-white shrink-0">
                          {totalWishlist}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Track Order & WhatsApp Help */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      href="/track-order"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200/80 text-gray-700 hover:text-[#1E3F20] hover:border-emerald-200 transition-colors shadow-2xs"
                    >
                      <Truck className="w-4 h-4 text-[#2D5A27]" />
                      <span className="font-semibold truncate">Track Order</span>
                    </Link>

                    <a
                      href={`https://wa.me/${(siteSettings.whatsapp?.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsapp.whatsappNumber).replace(/[^\d]/g, "")}?text=${encodeURIComponent(siteSettings.whatsapp?.defaultMessage || DEFAULT_SITE_SETTINGS.whatsapp.defaultMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200/80 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold truncate">WhatsApp</span>
                    </a>
                  </div>

                  {/* Hotline Phone Number */}
                  {siteSettings.general?.hotlinePhone && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-200/80 text-[11px] text-gray-600 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Hotline:</span>
                      </div>
                      <a
                        href={`tel:${siteSettings.general.hotlinePhone}`}
                        className="font-bold text-[#1E3F20] hover:underline"
                      >
                        {siteSettings.general.hotlinePhone}
                      </a>
                    </div>
                  )}

                  {/* Auth Actions: Logged In vs Guest */}
                  {session?.user ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="py-2 rounded-xl text-center text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="py-2 rounded-xl text-center text-xs font-bold text-white bg-[#1E3F20] hover:bg-[#2D5A27] transition-colors shadow-2xs"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
