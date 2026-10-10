"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { App } from "antd";
import {
  MessageSquareQuote,
  Star,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  User,
  SlidersHorizontal,
} from "lucide-react";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80";

export default function ReviewsTab({ onReviewsCountChange }) {
  const { message, modal } = App.useApp();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    totalReviews: 0,
    avgRating: 0,
    fiveStarCount: 0,
    verifiedCount: 0,
    approvedCount: 0,
    hiddenCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  // Fetch reviews from API
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        if (data.summary) {
          setSummary(data.summary);
          if (onReviewsCountChange) {
            onReviewsCountChange(data.summary.totalReviews || 0);
          }
        }
      } else {
        message.error(data.message || "Failed to load reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      message.error("Network error while fetching reviews");
    } finally {
      setLoading(false);
    }
  }, [message, onReviewsCountChange]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Toggle Visibility (Approved vs Hidden)
  const handleToggleStatus = async (review) => {
    const currentStatus = review.status || "approved";
    const nextStatus = currentStatus === "hidden" ? "approved" : "hidden";

    try {
      setActionLoadingId(review._id);
      const res = await fetch(`/api/admin/reviews/${review._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (data.success) {
        message.success(
          nextStatus === "approved"
            ? "Review unhidden and published on live store"
            : "Review hidden from public live store"
        );
        // Optimistically update local state
        setReviews((prev) =>
          prev.map((r) =>
            r._id === review._id ? { ...r, status: nextStatus } : r
          )
        );
        // Refresh summary stats
        fetchReviews();
      } else {
        message.error(data.message || "Failed to update review status");
      }
    } catch (err) {
      console.error("Error updating review status:", err);
      message.error("Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanently Delete Review
  const handleDeleteReview = (review) => {
    modal.confirm({
      title: "Permanently Delete Review?",
      icon: <Trash2 className="w-5 h-5 text-red-500 inline-block mr-2" />,
      content: `Are you sure you want to remove the review by "${
        review.userName || "Customer"
      }"? This will permanently delete the review document and recalculate the product average rating.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setActionLoadingId(review._id);
          const res = await fetch(`/api/admin/reviews/${review._id}`, {
            method: "DELETE",
          });
          const data = await res.json();

          if (data.success) {
            message.success("Review deleted successfully");
            setReviews((prev) => prev.filter((r) => r._id !== review._id));
            fetchReviews();
          } else {
            message.error(data.message || "Failed to delete review");
          }
        } catch (err) {
          console.error("Error deleting review:", err);
          message.error("Failed to delete review");
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const toggleCommentExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered Reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // 1. Rating Filter
      if (ratingFilter !== "all") {
        if (rev.rating !== Number(ratingFilter)) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "all") {
        const revStatus = rev.status || "approved";
        if (revStatus !== statusFilter) {
          return false;
        }
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const userNameMatch = (rev.userName || "")
          .toLowerCase()
          .includes(query);
        const commentMatch = (rev.comment || "").toLowerCase().includes(query);
        const productTitle = (rev.productId?.title || "").toLowerCase();
        const productMatch = productTitle.includes(query);
        return userNameMatch || commentMatch || productMatch;
      }

      return true;
    });
  }, [reviews, ratingFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Top Header Action Bar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-1">
            <Star className="w-3.5 h-3.5 fill-[#2D5A27]" />
            <span>Product Reviews Management</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 font-serif">
            Customer Feedback &amp; Ratings Moderation
          </h2>
          <p className="text-xs text-gray-500">
            Moderate customer testimonials, review ratings, verify authentic users, and toggle store visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:bg-gray-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Refreshing..." : "Refresh Reviews"}</span>
        </button>
      </div>

      {/* ─── SECTION A: Summary Stat Cards (4 Cards across the top) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reviews */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D6A4F] border border-emerald-100/80 flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Reviews
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 font-serif leading-tight">
              {summary.totalReviews}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {summary.approvedCount} Approved &bull; {summary.hiddenCount} Hidden
            </p>
          </div>
        </div>

        {/* Card 2: Average Store Rating */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100/80 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400 stroke-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Average Rating
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-extrabold text-gray-900 font-serif leading-tight">
                {summary.avgRating > 0 ? summary.avgRating.toFixed(1) : "0.0"}
              </h3>
              <span className="text-xs font-bold text-gray-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`card-star-${star}`}
                  className={`w-3 h-3 ${
                    star <= Math.round(summary.avgRating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-100 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: 5-Star Reviews Count */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2D5A27] border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              5-Star Ratings
            </p>
            <h3 className="text-2xl font-extrabold text-[#2D6A4F] font-serif leading-tight">
              {summary.fiveStarCount}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {summary.totalReviews > 0
                ? `${Math.round(
                    (summary.fiveStarCount / summary.totalReviews) * 100
                  )}% of customer reviews`
                : "No reviews yet"}
            </p>
          </div>
        </div>

        {/* Card 4: Verified vs Guest ratio */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100/80 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Verified / Guest
            </p>
            <h3 className="text-xl font-extrabold text-gray-900 font-serif leading-tight">
              {summary.verifiedCount} <span className="text-xs font-normal text-gray-400">/</span>{" "}
              {summary.totalReviews - summary.verifiedCount}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {summary.totalReviews > 0
                ? `${Math.round(
                    (summary.verifiedCount / summary.totalReviews) * 100
                  )}% verified accounts`
                : "No reviews yet"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── SECTION B: Reviews Filters & Moderation Table ──────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FBFBFA]">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, comment, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2D6A4F] bg-white transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Rating Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-gray-700 hidden sm:inline">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D6A4F] cursor-pointer"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-gray-700 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D6A4F] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            {(searchQuery || ratingFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter("all");
                  setStatusFilter("all");
                }}
                className="text-xs font-semibold text-[#2D6A4F] hover:underline cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Loading customer reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No Reviews Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {reviews.length === 0
                  ? "Customers haven't submitted any reviews yet."
                  : "No reviews match your current search or filter criteria."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-[#FBFBFA]">
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Comment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredReviews.map((rev) => {
                  const product = rev.productId;
                  const isVerified = Boolean(
                    rev.isVerified || rev.isGoogleVerified
                  );
                  const isHidden = rev.status === "hidden";
                  const productImg =
                    product?.images?.[0] ||
                    product?.image ||
                    FALLBACK_PRODUCT_IMAGE;

                  const revDate = rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent";

                  const isLongComment = (rev.comment || "").length > 120;
                  const isExpanded = expandedComments[rev._id];

                  return (
                    <tr
                      key={rev._id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isHidden ? "bg-gray-50/40 opacity-80" : ""
                      }`}
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-4 px-4 sm:px-6">
                        {product ? (
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 relative">
                              <Image
                                src={productImg}
                                alt={product.title || "Product"}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 max-w-[180px]">
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-gray-900 hover:text-[#2D6A4F] transition-colors truncate block group"
                              >
                                <span>{product.title}</span>
                                <ExternalLink className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#2D6A4F]" />
                              </Link>
                              {product.price !== undefined && (
                                <span className="text-[11px] font-semibold text-[#2D6A4F]">
                                  ৳{product.price.toLocaleString("en-US")}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Archived Product</span>
                        )}
                      </td>

                      {/* Reviewer Details */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {rev.userImage ? (
                              <Image
                                src={rev.userImage}
                                alt={rev.userName || "Customer"}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover border border-emerald-100"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#EBF0E6] text-[#1E3F20] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {(rev.userName || "C").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-gray-900 truncate max-w-[120px]">
                              {rev.userName || "Customer"}
                            </span>
                          </div>

                          <div>
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                <User className="w-3 h-3 text-gray-400" />
                                <span>Guest</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={`star-${rev._id}-${s}`}
                                className={`w-3.5 h-3.5 ${
                                  s <= (rev.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-gray-100 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 block">
                            {rev.rating} of 5 Stars
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-4 px-4">
                        <div className="text-gray-700 leading-relaxed text-xs">
                          <p className="whitespace-pre-line">
                            {isLongComment && !isExpanded
                              ? `${rev.comment.slice(0, 115)}...`
                              : rev.comment}
                          </p>
                          {isLongComment && (
                            <button
                              type="button"
                              onClick={() => toggleCommentExpand(rev._id)}
                              className="text-[11px] font-semibold text-[#2D6A4F] hover:underline mt-1 inline-block cursor-pointer"
                            >
                              {isExpanded ? "Show less" : "Read full review"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-500 font-medium">
                        {revDate}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isHidden ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Hidden</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle Visibility */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(rev)}
                            disabled={actionLoadingId === rev._id}
                            title={
                              isHidden
                                ? "Unhide and publish on live store"
                                : "Hide review from live store"
                            }
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isHidden
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                          >
                            {actionLoadingId === rev._id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isHidden ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Review */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev)}
                            disabled={actionLoadingId === rev._id}
                            title="Delete review permanently"
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
