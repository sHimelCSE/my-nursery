"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Badge, Dropdown } from "antd";
import { useSession, signOut } from "next-auth/react";
import useCartStore from "@/lib/cartStore";

const NAV_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Plants",       href: "/products?category=plant" },
  { label: "Fertilizers",  href: "/products?category=fertilizer" },
  { label: "Tools & Pots", href: "/products?category=tool" },
  { label: "About Us",     href: "/about" },
  { label: "Contact Us",   href: "/contact" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [navLinks, setNavLinks] = useState(NAV_LINKS);

  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/menu?location=navbar")
      .then((res) => res.json())
      .then((data) => {
        const items = data.menus || data.data;
        if (data.success && Array.isArray(items) && items.length > 0) {
          setNavLinks(
            items.map((m) => ({
              label: m.label,
              href: m.url,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const totalCount = useCartStore((state) =>
    (state.items || []).reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCart   = useCartStore((state) => state.openCart);
  const totalItems = mounted ? totalCount : 0;

  // Isolate Admin Portal: Do not render customer store Navbar on /Manage_Admin routes
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div className="py-1 px-1 cursor-default">
          <p className="text-[13px] font-bold text-[#1A2E22] truncate max-w-[190px]">
            {session?.user?.name || "Customer"}
          </p>
          <p className="text-[11px] text-[#6B7280] truncate max-w-[190px]">
            {session?.user?.email}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D8F3DC] text-[#2D6A4F] uppercase tracking-wider">
            {session?.user?.role === "admin" ? "Store Admin" : "Customer"}
          </span>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "dashboard",
      icon: <ShoppingOutlined style={{ fontSize: "14px", color: "#2D6A4F" }} />,
      label: (
        <Link href="/dashboard" className="text-[13px] font-medium text-[#374151]">
          My Orders & Dashboard
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: "14px" }} />,
      danger: true,
      label: <span className="text-[13px] font-medium">Logout</span>,
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm shadow-black/[0.06] border-b border-gray-100"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ──────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:shadow-green-200/60 transition-all duration-300">
              <span className="text-lg leading-none">🌿</span>
            </div>
            <div className="leading-none">
              <p className="text-[#1A2E22] font-bold text-[15px] tracking-tight">GreenLeaf</p>
              <p className="text-[#40916C] text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">Nursery</p>
            </div>
          </Link>

          {/* ── Desktop Nav ─────────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, href }) => {
              const isActive = href.includes("?")
                ? pathname === "/products"
                : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#2D6A4F] bg-[#D8F3DC]/70"
                      : "text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/40"
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#40916C] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ───────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Cart — opens slide-over drawer */}
            <motion.button
              id="navbar-cart-btn"
              aria-label={`Open cart – ${totalItems} items`}
              onClick={openCart}
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/50 transition-all duration-200"
            >
              <Badge
                count={totalItems}
                size="small"
                styles={{
                  indicator: {
                    backgroundColor: "#40916C",
                    boxShadow: "none",
                    fontSize: "10px",
                    minWidth: "16px",
                    height: "16px",
                    lineHeight: "16px",
                    fontWeight: "700",
                  },
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: "20px" }} />
              </Badge>
            </motion.button>

            {/* Desktop Auth Section */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              {status === "loading" ? (
                <div className="w-20 h-8 rounded-lg bg-gray-100 animate-pulse" />
              ) : session?.user ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button
                    id="user-profile-menu-btn"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/80 bg-white hover:border-[#40916C]/60 hover:bg-[#F4F7F4] transition-all text-left shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-[13px] font-semibold text-[#1A2E22] max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                    <DownOutlined style={{ fontSize: "10px", color: "#6B7280" }} />
                  </button>
                </Dropdown>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/40 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#2D6A4F] hover:bg-[#40916C] shadow-sm hover:shadow-md hover:shadow-green-300/40 transition-all duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((p) => !p)}
              whileTap={{ scale: 0.92 }}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#4A5568] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/40 transition-all duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <CloseOutlined />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MenuOutlined />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown ─────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg shadow-black/[0.04]"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ label, href }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                >
                  <Link
                    href={href}
                    className="flex items-center px-4 py-3 rounded-xl text-[14px] font-medium text-[#374151] hover:text-[#2D6A4F] hover:bg-[#D8F3DC]/50 transition-all duration-200"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              {session?.user ? (
                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                  <div className="px-4 py-2.5 bg-[#F4F7F4] rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-bold text-[#1A2E22] truncate">{session.user.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#2D6A4F] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] transition-all"
                  >
                    <ShoppingOutlined style={{ fontSize: "16px" }} /> My Orders & Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                  >
                    <LogoutOutlined style={{ fontSize: "16px" }} /> Logout
                  </button>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#D8F3DC]/50 transition-all text-center border border-gray-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-white text-center bg-[#2D6A4F] hover:bg-[#40916C] transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
