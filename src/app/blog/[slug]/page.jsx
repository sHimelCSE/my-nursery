"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Share2,
  Check,
  Tag,
  Sprout,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";
import { App } from "antd";
import useCartStore from "@/lib/cartStore";
import { getBlogSchema } from "@/lib/jsonLd";

const FALLBACK_BLOG_IMAGE = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80";
const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const sliderRef = useRef(null);

  // Cart integration
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  // Ant Design message
  let message = null;
  try {
    const antdApp = App.useApp();
    message = antdApp.message;
  } catch {
    // fallback safe
  }

  const [siteName, setSiteName] = useState("MSH BloomCraft");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("app_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.general?.siteName) setSiteName(parsed.general.siteName);
      }
    } catch (e) {}

    const handleUpdate = (e) => {
      if (e?.detail?.general?.siteName) setSiteName(e.detail.general.siteName);
    };
    window.addEventListener("siteSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("siteSettingsUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetchBlogDetails();
  }, [slug]);

  const fetchBlogDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${slug}`);
      const data = await res.json();
      if (data.success && data.blog) {
        setBlog(data.blog);
        setRelatedBlogs(Array.isArray(data.relatedBlogs) ? data.relatedBlogs : []);
      } else {
        setBlog(null);
      }
    } catch (err) {
      console.error("Failed to load blog post:", err);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      if (message) {
        message.success({ content: "Guide link copied to clipboard!", duration: 2 });
      }
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddToCart = (product, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const finalPrice = product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

    addItem({
      _id: product._id || product.id,
      title: product.title,
      price: finalPrice,
      images: product.images || (product.image ? [product.image] : []),
      image: product.images?.[0] || product.image || FALLBACK_PRODUCT_IMAGE,
      quantity: 1,
    });

    if (message) {
      message.success({ content: `${product.title} added to cart!`, duration: 2 });
    }
    openCart();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-[#2D5A27] animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600">Loading Botanical Guide...</p>
      </div>
    );
  }

  // Not Found State
  if (!blog) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-black text-[#1C2B1E]">Guide Not Found</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          The requested plant care guide may have been moved or unpublished by our editorial team.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3F20] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Guides
        </Link>
      </div>
    );
  }

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "Recently published";

  const hasRelatedProducts = Array.isArray(blog.relatedProducts) && blog.relatedProducts.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1C2B1E]">
      {/* ─── Structured Data (JSON-LD) ────────────────────────────────────── */}
      {blog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getBlogSchema(blog)) }}
        />
      )}

      {/* ─── Breadcrumb Navigation ────────────────────────────────────────── */}
      <div className="border-b border-[#E3E8DC] bg-white/70 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 flex-wrap">
            <Link
              href="/"
              className="hover:text-[#2D5A27] transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/blog" className="hover:text-[#2D5A27] transition-colors">
              Botanical Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#2D5A27] font-semibold line-clamp-1 max-w-[240px] sm:max-w-md">
              {blog.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ─── Article Container ────────────────────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Article Meta Header */}
        <header className="space-y-5 text-center sm:text-left">
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold border border-[#D5E2CC]">
              <Tag className="w-3 h-3 text-[#2D5A27]" />
              {blog.category || "Plant Care"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-gray-600 text-xs font-medium border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {blog.readTime || "5 min read"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-gray-600 text-xs font-medium border border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1C2B1E] tracking-tight leading-[1.18]">
            {blog.title}
          </h1>

          {/* Excerpt Summary */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {blog.excerpt}
          </p>

          {/* Author Bar & Actions */}
          <div className="pt-4 pb-2 border-y border-[#E3E8DC] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {blog.author?.name ? blog.author.name[0] : "G"}
              </div>
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#1C2B1E] leading-tight">
                  {blog.author?.name || "BloomCraft Botanist"}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {blog.author?.role || "Horticulture Specialist"}
                </p>
              </div>
            </div>

            {/* Share / Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 text-xs font-semibold text-gray-700 hover:text-[#2D5A27] transition-all cursor-pointer shadow-2xs"
                title="Copy Guide Link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Share Guide</span>
                  </>
                )}
              </button>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBF0E6] hover:bg-[#E0E8D9] text-xs font-bold text-[#2D5A27] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Guides</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ─── Hero Cover Image ─────────────────────────────────────────────── */}
        <div className="mt-8 mb-10 relative rounded-3xl overflow-hidden shadow-sm border border-gray-200/80 bg-[#EBF0E6] max-h-[500px]">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full max-h-[500px]">
            <SafeImage
              src={blog.coverImage || FALLBACK_BLOG_IMAGE}
              fallback={FALLBACK_BLOG_IMAGE}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </div>

        {/* ─── Formatted Article Body ───────────────────────────────────────── */}
        <div
          className="botanical-prose text-gray-800 leading-[1.8] text-base sm:text-[17px] space-y-6 max-w-full overflow-hidden break-words [&_img]:rounded-2xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:shadow-sm [&_img]:mx-auto [&_img]:object-cover [&_img]:block"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* ─── Featured & Related Products Slider ───────────────────────────── */}
        {hasRelatedProducts && (
          <section className="mt-16 pt-12 border-t border-[#D5E2CC]">
            {/* Slider Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#2D5A27] text-xs font-bold mb-2">
                  <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Curated Horticulture Collection
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B1E] tracking-tight">
                  Featured Plants & Care Essentials
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
                  Explore and order the exact healthy specimens, organic mediums, and care tools highlighted in this guide.
                </p>
              </div>

              {/* Slider Arrow Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => scrollSlider("left")}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-[#EBF0E6] text-gray-700 hover:text-[#2D5A27] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollSlider("right")}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-[#EBF0E6] text-gray-700 hover:text-[#2D5A27] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slider Track Container */}
            <div
              ref={sliderRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
            >
              {blog.relatedProducts.map((product) => {
                const prodId = product._id || product.id;
                const prodImage = product.images?.[0] || product.image || FALLBACK_PRODUCT_IMAGE;
                const price = Number(product.price) || 0;
                const discountPrice = Number(product.discountPrice) || 0;
                const hasDiscount = discountPrice > 0 && discountPrice < price;
                const displayPrice = hasDiscount ? discountPrice : price;
                const isOutOfStock = product.stock === 0;

                return (
                  <div
                    key={prodId}
                    className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white rounded-3xl border border-gray-200/80 p-3 hover:border-emerald-300 hover:shadow-[0_12px_28px_-8px_rgba(28,43,30,0.12)] transition-all duration-300 flex flex-col group"
                  >
                    {/* Product Image Link */}
                    <Link
                      href={`/products/${prodId}`}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2F5ED] block cursor-pointer"
                    >
                      <SafeImage
                        src={prodImage}
                        fallback={FALLBACK_PRODUCT_IMAGE}
                        alt={product.title}
                        fill
                        sizes="280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          SALE
                        </div>
                      )}

                      {/* Category Tag */}
                      {product.category && (
                        <div className="absolute bottom-2.5 left-2.5 bg-[#1E3F20]/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                          {product.category}
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <h3 className="font-extrabold text-sm text-[#1C2B1E] group-hover:text-[#2D5A27] transition-colors line-clamp-1 mb-1">
                        <Link href={`/products/${prodId}`}>{product.title}</Link>
                      </h3>

                      {/* Price Section */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base font-black text-[#2D5A27]">
                          ৳{displayPrice.toLocaleString("en-BD")}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            ৳{price.toLocaleString("en-BD")}
                          </span>
                        )}
                      </div>

                      {/* Stock & Add to Cart Button */}
                      <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-semibold ${isOutOfStock ? "text-red-500" : "text-emerald-700"
                            }`}
                        >
                          {isOutOfStock ? "Out of Stock" : "In Stock"}
                        </span>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={isOutOfStock}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${isOutOfStock
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#2D5A27] hover:bg-[#1E3F20] text-white hover:shadow-xs active:scale-95"
                            }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Related Articles Suggestions ────────────────────────────────── */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#D5E2CC]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1C2B1E] tracking-tight">
                  More Botanical Care Guides
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Continue your gardening journey with these recommended articles.
                </p>
              </div>

              <Link
                href="/blog"
                className="text-xs font-bold text-[#2D5A27] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedBlogs.map((item) => {
                const itemDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                  : "";

                return (
                  <Link
                    key={item._id || item.slug}
                    href={`/blog/${item.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200/80 p-3 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#EBF0E6] mb-2.5">
                      <SafeImage
                        src={item.coverImage || FALLBACK_BLOG_IMAGE}
                        fallback={FALLBACK_BLOG_IMAGE}
                        alt={item.title}
                        fill
                        sizes="300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-[#1E3F20] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.category || "Plant Care"}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1C2B1E] group-hover:text-[#2D5A27] transition-colors line-clamp-2 mb-1.5 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {item.excerpt}
                    </p>

                    <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>{itemDate}</span>
                      <span className="font-semibold text-[#2D5A27] group-hover:underline flex items-center gap-1">
                        Read Guide <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Back to All Guides Footer ────────────────────────────────────── */}
        <div className="mt-14 pt-8 border-t border-[#E3E8DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-emerald-400 text-xs font-bold text-gray-700 hover:text-[#2D5A27] transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Plant Care Guides</span>
          </Link>

          <p className="text-xs text-gray-400 text-center sm:text-right">
            {siteName} · Horticultural Editorial Desk
          </p>
        </div>
      </article>

      {/* ─── Botanical Prose Custom Styles ──────────────────────────────────── */}
      <style jsx global>{`
        .botanical-prose h2 {
          font-size: 1.65rem;
          font-weight: 800;
          color: #1c2b1e;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          border-bottom: 2px solid #ebf0e6;
          padding-bottom: 0.4rem;
        }
        .botanical-prose h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2d5a27;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .botanical-prose p {
          margin-bottom: 1.25rem;
          color: #374151;
        }
        .botanical-prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .botanical-prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .botanical-prose li {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .botanical-prose blockquote {
          border-left: 4px solid #2d5a27;
          background: #f2f6ef;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: #1e3f20;
        }
        .botanical-prose a {
          color: #2d5a27;
          text-decoration: underline;
          font-weight: 600;
        }
        .botanical-prose a:hover {
          color: #1e3f20;
        }
        .botanical-prose strong {
          color: #1c2b1e;
          font-weight: 700;
        }
        .botanical-prose img {
          border-radius: 1rem;
          margin: 1.5rem auto;
          max-width: 100%;
          width: auto;
          height: auto;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          object-fit: cover;
          display: block;
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .botanical-prose img {
            border-radius: 0.875rem;
            margin: 1.25rem auto;
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
