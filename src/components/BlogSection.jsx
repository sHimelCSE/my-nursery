"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { DEFAULT_BLOGS } from "@/constants/defaultBlogs";

const FALLBACK_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80";

const formatDeterministicDate = (dateStr) => {
  if (!dateStr) return "Botanical Guide";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "Botanical Guide";
  }
};

export default function BlogSection({ data }) {
  if (data?.isEnabled === false) {
    return null;
  }

  const badge = data?.badge || "KNOWLEDGE BASE";
  const title = data?.title || "Latest Plant Care Guides";
  const subtitle =
    data?.subtitle ||
    "Practical advice from our certified botanists and nursery caretakers";
  const viewAllText = data?.viewAllText || "All Articles";
  const viewAllUrl = data?.viewAllUrl || "/blog";

  const blogsList =
    Array.isArray(data?.blogs) && data.blogs.length > 0
      ? data.blogs
      : DEFAULT_BLOGS.slice(0, data?.displayCount || 3);

  return (
    <section
      id="blog-guides"
      className="section-blog-guides max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 scroll-mt-28"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C7F57] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{badge}</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C2B1E] mt-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#5A6B5C] mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>

        <Link
          href={viewAllUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3F20] border border-gray-300 bg-white px-5 py-2.5 rounded-full hover:bg-[#F4F6F4] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-4 h-4 text-[#2D6A4F]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {blogsList.map((post, idx) => {
          const postSlug = post.slug || `guide-${post._id || post.id || idx}`;
          const postDate = formatDeterministicDate(post.createdAt || post.date);
          const authorName =
            post.author?.name ||
            (typeof post.author === "string" ? post.author : "BloomCraft Botanist");
          const postImage =
            post.coverImage || post.image || FALLBACK_BLOG_IMAGE;
          const category = post.category || "Plant Care";

          return (
            <Link
              key={post._id || post.id || postSlug}
              href={`/blog/${postSlug}`}
              className="blog-card group bg-white rounded-2xl border border-gray-200/70 p-3 hover:shadow-[0_12px_32px_-12px_rgba(28,43,30,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#EBF0E6]">
                <SafeImage
                  src={postImage}
                  fallback={FALLBACK_BLOG_IMAGE}
                  alt={post.title || "Plant Care Article"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#1E3F20] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                  {category}
                </span>
              </div>

              <div className="p-3 flex flex-col flex-1 gap-2.5">
                <div className="flex items-center gap-4 text-xs text-[#5A6B5C]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" /> {postDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />{" "}
                    {post.readTime || "5 min read"}
                  </span>
                </div>

                <h3 className="font-semibold text-[15px] text-[#1C2B1E] leading-snug group-hover:text-[#2D6A4F] transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-[#5A6B5C] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-3 flex items-center justify-between text-sm border-t border-gray-100/70">
                  <span className="text-xs font-medium text-[#5A6B5C]">
                    {authorName}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1E3F20] group-hover:gap-1.5 transition-all text-xs">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
