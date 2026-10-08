"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  User,
  Filter,
  Check,
  ChevronRight,
  Sprout,
  Send,
  Loader2,
} from "lucide-react";
import { App } from "antd";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&q=80";

const CATEGORIES = [
  "All",
  "Plant Care",
  "Urban Gardening",
  "Pest Control",
  "Indoor Care",
  "Fertilization",
  "Soil & Potting",
];

export default function BlogListingPage() {
  const { message } = App.useApp();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail) return;

    try {
      setSubscribing(true);
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, source: "blog" }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.isExisting) {
          message.info(data.message || "You are already a subscriber to our newsletter!");
        } else {
          message.success(data.message || "Welcome! Thank you for subscribing.");
        }
        setNewsletterEmail("");
      } else {
        message.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error("Blog newsletter error:", err);
      message.error("Network error. Please try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "All" ||
        blog.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        blog.title?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.author?.name?.toLowerCase().includes(q) ||
        blog.category?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1C2B1E]">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#E3E8DC] bg-white/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link
              href="/"
              className="hover:text-[#2D5A27] transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#2D5A27] font-semibold">Botanical Journal</span>
          </nav>
        </div>
      </div>

      {/* ─── Hero Header Banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F4F7F0] to-[#F7F8F4] border-b border-[#E3E8DC] py-14 sm:py-18">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-lime-100/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0E6] text-[#2D5A27] border border-[#D5E2CC] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-[#2D5A27]" />
            Botanical Knowledge & Plant Care Journal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1C2B1E] tracking-tight max-w-3xl mx-auto leading-[1.15]">
            Plant Care Guides, Horticulture Secrets & Botanical Insights
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Cultivate your indoor jungle with proven botanical guides, potting recipes, and seasonal plant maintenance tips written by certified specialists.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides by title, plant type, care tip, or keyword..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#D0DBC7] text-sm text-[#1C2B1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#2D5A27] text-white shadow-sm ring-2 ring-[#2D5A27]/30"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-[#2D5A27] hover:bg-[#F2F6EF]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Main Content Grid ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results summary bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E3E8DC] text-xs text-gray-500">
          <span>
            Showing <strong className="text-[#1C2B1E]">{filteredBlogs.length}</strong>{" "}
            {filteredBlogs.length === 1 ? "article" : "articles"}
            {selectedCategory !== "All" && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          {(selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-[#2D5A27] hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-gray-200/70 p-4 animate-pulse flex flex-col gap-4 shadow-xs"
              >
                <div className="w-full aspect-[16/10] bg-gray-200 rounded-2xl" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-gray-200 rounded-md" />
                  <div className="h-4 w-24 bg-gray-200 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-12 w-full bg-gray-100 rounded-md" />
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-5 w-28 bg-gray-200 rounded-md" />
                  <div className="h-5 w-16 bg-gray-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#D5E2CC] p-12 text-center max-w-md mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-xl font-bold text-[#1C2B1E]">No Articles Found</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              We couldn't find any plant care guides matching your search criteria. Try different search terms or clear your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3F20] transition-colors cursor-pointer"
            >
              View All Guides
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredBlogs.map((blog) => {
              const formattedDate = blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <article
                  key={blog._id || blog.slug}
                  className="group bg-white rounded-3xl border border-gray-200/80 p-3.5 hover:shadow-[0_16px_36px_-12px_rgba(28,43,30,0.14)] hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Card Cover Image */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#EBF0E6] block cursor-pointer"
                  >
                    <SafeImage
                      src={blog.coverImage || FALLBACK_IMAGE}
                      fallback={FALLBACK_IMAGE}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Tag Badge */}
                    <div className="absolute top-3 left-3 bg-[#1E3F20]/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {blog.category || "Plant Care"}
                    </div>

                    {/* Tagged Products Badge if any */}
                    {Array.isArray(blog.relatedProducts) && blog.relatedProducts.length > 0 && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#2D5A27] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#2D5A27]" />
                        {blog.relatedProducts.length} Plants Tagged
                      </div>
                    )}
                  </Link>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col flex-1">
                    {/* Meta Info */}
                    <div className="flex items-center gap-3.5 text-xs text-gray-500 mb-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                        {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {blog.readTime || "5 min read"}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-extrabold text-[#1C2B1E] leading-snug group-hover:text-[#2D5A27] transition-colors line-clamp-2 mb-2">
                      <Link href={`/blog/${blog.slug}`} className="hover:underline">
                        {blog.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {blog.excerpt}
                    </p>

                    {/* Card Footer: Author & Read CTA */}
                    <div className="mt-auto pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center text-xs font-bold shrink-0 border border-[#D5E2CC]">
                          {blog.author?.name ? blog.author.name[0] : "G"}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#1C2B1E] leading-tight">
                            {blog.author?.name || "BloomCraft Botanist"}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">
                            {blog.author?.role || "Specialist"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] group-hover:text-[#1E3F20] transition-colors"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── Bottom Newsletter CTA ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#E3E8DC] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-semibold uppercase mb-3">
            <Sprout className="w-3.5 h-3.5" />
            Weekly Botanical Digest
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B1E] tracking-tight">
            Never Miss a Seasonal Plant Care Guide
          </h2>
          <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">
            Get practical advice on seasonal fertilization, repotting calendars, and rooftop horticulture straight to your inbox every Friday.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full sm:w-72 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span>{subscribing ? "Subscribing..." : "Subscribe"}</span>
              {subscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
