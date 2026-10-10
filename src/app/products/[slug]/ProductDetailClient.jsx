"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { App } from "antd";
import { useSession, signIn } from "next-auth/react";
import {
  ChevronRight,
  Sun,
  Droplets,
  PawPrint,
  Sprout,
  ShoppingBag,
  Heart,
  RefreshCw,
  Share2,
  Truck,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  ArrowRight,
  MessageSquare,
  UserCheck,
  Check,
  RotateCcw,
  Loader2,
  LogIn,
  X,
  ExternalLink,
  Sparkles,
  CreditCard,
} from "lucide-react";
import useCartStore from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";
import ProductCard from "@/components/ProductCard";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";

export default function ProductDetailClient({
  params,
  id: directId,
  slug: directSlug,
  initialProduct,
  categoryName: directCategoryName,
  categoryUrl: directCategoryUrl,
}) {
  // Support both direct id, direct slug, direct params, and Promise params safely
  const resolvedParams = typeof params?.then === "function" ? use(params) : params;
  const id = directSlug || directId || resolvedParams?.slug || resolvedParams?.id;

  const router = useRouter();
  const { message } = App.useApp();
  const { data: session, status: authStatus } = useSession();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);

  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description"); // description | care | reviews
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [brandName, setBrandName] = useState("MSH BloomCraft");
  const [pageThemeConfig, setPageThemeConfig] = useState(null);

  // Sync selected variant when product loads
  useEffect(() => {
    if (product?.hasVariants && Array.isArray(product.variants) && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Fetch active discount promotions for promotion banner
  useEffect(() => {
    let isSubscribed = true;
    async function fetchDiscounts() {
      try {
        const res = await fetch("/api/discounts");
        const json = await res.json();
        if (isSubscribed && json.success && Array.isArray(json.discounts)) {
          setActiveDiscounts(json.discounts);
        }
      } catch {}
    }
    fetchDiscounts();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Fetch page theme configuration for product page
  useEffect(() => {
    let isSubscribed = true;
    async function fetchThemeConfig() {
      try {
        const res = await fetch("/api/page-theme-config");
        const json = await res.json();
        if (isSubscribed && json.success && json.data) {
          setPageThemeConfig(json.data);
        }
      } catch {}
    }
    fetchThemeConfig();

    const handleConfigUpdate = () => {
      fetchThemeConfig();
    };
    window.addEventListener("pageThemeConfigUpdated", handleConfigUpdate);
    return () => {
      isSubscribed = false;
      window.removeEventListener("pageThemeConfigUpdated", handleConfigUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("app_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.general?.siteName) setBrandName(parsed.general.siteName);
      }
    } catch {}

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem("app_site_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.general?.siteName) setBrandName(parsed.general.siteName);
        }
      } catch {}
    };
    window.addEventListener("siteSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("siteSettingsUpdated", handleUpdate);
  }, []);

  const isWishlisted = mounted && product ? isInWishlist(product._id) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real persistent reviews
  useEffect(() => {
    let isSubscribed = true;
    async function fetchReviews() {
      if (!id) return;
      try {
        setReviewsLoading(true);
        const res = await fetch(`/api/products/${id}/reviews`);
        const json = await res.json();
        if (isSubscribed && json.success) {
          setReviewsList(json.reviews || []);
          setReviewsStats({
            averageRating: json.averageRating || 0,
            totalReviews: json.totalReviews || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        if (isSubscribed) setReviewsLoading(false);
      }
    }
    fetchReviews();
    return () => {
      isSubscribed = false;
    };
  }, [id]);

  // Fetch product data (only if not provided by server component)
  useEffect(() => {
    let isSubscribed = true;
    async function fetchProduct() {
      if (!id || initialProduct?._id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (!isSubscribed) return;
        if (!json.success || !json.data) {
          throw new Error(json.message || "Product not found");
        }
        setProduct(json.data);
      } catch (err) {
        if (isSubscribed) {
          setError(err.message || "Failed to load product");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }
    fetchProduct();
    return () => {
      isSubscribed = false;
    };
  }, [id, initialProduct]);

  // Fetch related products
  useEffect(() => {
    let isSubscribed = true;
    async function fetchRelated() {
      try {
        const cat = product?.category ? `?category=${product.category}` : "";
        const res = await fetch(`/api/products${cat}`);
        const json = await res.json();
        if (!isSubscribed) return;
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data.filter((p) => p._id !== id).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch {
        // silent fallback
      }
    }
    if (product) fetchRelated();
    return () => {
      isSubscribed = false;
    };
  }, [product, id]);

  // Dynamic Product Page Theme Configuration
  const productPageConfig =
    pageThemeConfig?.productPage || DEFAULT_PAGE_THEME_CONFIG.productPage;

  // Dynamic Variants & Pricing
  const hasDynamicVariants = Boolean(product?.hasVariants && product.variants?.length > 0);

  const currentPrice = hasDynamicVariants && selectedVariant
    ? Number(selectedVariant.price)
    : product
      ? Number(product.price) || 0
      : 0;

  const originalPrice = hasDynamicVariants && selectedVariant && Number(selectedVariant.originalPrice) > Number(selectedVariant.price)
    ? Number(selectedVariant.originalPrice)
    : product?.originalPrice && Number(product.originalPrice) > Number(product.price)
      ? Number(product.originalPrice)
      : null;

  const showDiscount = Boolean(originalPrice && originalPrice > currentPrice);

  const discountPercent = showDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const currentStock = hasDynamicVariants && selectedVariant
    ? Number(selectedVariant.stock ?? 10)
    : Number(product?.stock_quantity ?? 0);

  const inStock = currentStock > 0;

  // Build image list: only use real images from product
  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : product?.image
      ? [product.image]
      : [];

  const handleAddToCart = (openDrawer = true) => {
    if (!product || !inStock) return;

    const variantName = hasDynamicVariants && selectedVariant ? selectedVariant.name : null;
    const cartItemId = variantName
      ? `${product._id}-${variantName.replace(/\s+/g, "-").toLowerCase()}`
      : String(product._id);

    const cartTitle = variantName
      ? `${product.title} (${variantName})`
      : product.title;

    addItem({
      _id: cartItemId,
      productId: product._id,
      title: cartTitle,
      selectedVariant: variantName,
      price: currentPrice,
      images: [images[0] || FALLBACK_IMG],
      image: images[0] || FALLBACK_IMG,
      category: product.category || "",
      quantity,
    });

    message.success({
      content: `Added ${quantity} × ${cartTitle} to your cart!`,
      duration: 2,
    });

    if (openDrawer) {
      openCart();
    }
  };

  const handleBuyNow = () => {
    if (!product || !inStock) return;
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlistStore(product);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      message.success({ content: "Product link copied to clipboard!", duration: 2 });
    }
  };

  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    const isLoggedIn = Boolean(session?.user);
    const finalUserName = isLoggedIn
      ? (session.user.name || "Customer")
      : guestName.trim();

    if (!isLoggedIn && (!finalUserName || finalUserName.length < 2)) {
      message.warning({
        content: "Please enter your name to submit a review.",
        duration: 3,
      });
      return;
    }

    if (!reviewComment || reviewComment.trim().length < 5) {
      message.warning({
        content: "Please write at least 5 characters in your review.",
        duration: 3,
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: finalUserName,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }

      message.success({
        content: data.message || "Thank you! Your review has been published.",
        duration: 3,
      });
      setReviewsList((prev) => [data.review, ...prev]);
      setReviewsStats({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
      });
      setReviewComment("");
      setGuestName("");
      setReviewRating(5);
      setShowReviewModal(false);
    } catch (err) {
      message.error({
        content: err.message || "Failed to submit review",
        duration: 3,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center py-24 px-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center animate-spin mb-4">
          <Sprout className="w-6 h-6 stroke-[1.8]" />
        </div>
        <p className="text-gray-600 text-sm font-medium">Preparing botanical specimen details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Botanical Item Not Found</h1>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          This plant or gardening essential could not be located in our current inventory.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#7BAE37] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
        >
          <span>Return to Nursery Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const categoryLabel =
    product.category === "plant"
      ? "Living Plants"
      : product.category === "fertilizer"
        ? "Organic Fertilizers"
        : "Tools & Ceramic Pots";

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-gray-800 pb-24">
      {/* ─── 1. BREADCRUMB NAVIGATION ───────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#2D5A27] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link
              href={
                directCategoryUrl ||
                (product.category
                  ? `/collections/${product.category.toLowerCase().replace(/[\s_]+/g, "-")}`
                  : "/collections")
              }
              className="hover:text-[#2D5A27] transition-colors capitalize"
            >
              {directCategoryName || categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* ─── 2. TWO-COLUMN PRODUCT SHOWCASE LAYOUT ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ════ LEFT COLUMN: IMAGE GALLERY ════ */}
          <div className="lg:col-span-6 space-y-4">
            {/* Large Main Image Container */}
            <div className="rounded-3xl border border-gray-100 bg-white p-2 sm:p-2 shadow-xs flex items-center justify-center min-h-[420px] relative overflow-hidden group">
              {(showDiscount || product.category) && (
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {showDiscount && discountPercent > 0 && (
                    <span className="bg-[#2D5A27] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.category && (
                    <span className="bg-[#E8F5E9] text-[#2D5A27] text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                      {product.category}
                    </span>
                  )}
                </div>
              )}

              <div className="w-full aspect-square max-h-[460px] relative rounded-2xl overflow-hidden bg-[#FBFBFA]">
                <Image
                  src={images[activeImage] || product.image || FALLBACK_IMG}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            </div>

            {/* Horizontal Thumbnail Carousel (Only if multiple images) */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`rounded-2xl p-1 bg-white border-2 overflow-hidden aspect-square transition-all duration-200 cursor-pointer shadow-2xs ${activeImage === idx
                        ? "border-[#7BAE37] ring-2 ring-[#7BAE37]/20 scale-102"
                        : "border-gray-100 hover:border-gray-300 opacity-80 hover:opacity-100"
                      }`}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={img || FALLBACK_IMG}
                        alt={`${product.title} view ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 25vw, 120px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN: PRODUCT DETAILS & ACTIONS ════ */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tags / Badges above title */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {product.tags.map((tag, tIdx) => (
                  <span
                    key={`pdp-tag-${tIdx}`}
                    className="bg-[#F1F8E9] text-[#2D6A4F] border border-emerald-200/50 text-[11px] font-semibold px-3 py-1 rounded-full shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight font-serif">
                {product.title}
              </h1>

              {/* Star Rating Strip */}
              <div className="flex items-center gap-3 mt-2.5">
                {reviewsStats.totalReviews > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={`hero-star-${i}`}
                          className={`w-4 h-4 ${
                            i < Math.round(reviewsStats.averageRating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {reviewsStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("reviews");
                        const el = document.getElementById("reviews-tab");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs text-gray-500 hover:text-[#2D5A27] underline cursor-pointer"
                    >
                      {reviewsStats.totalReviews} verified {reviewsStats.totalReviews === 1 ? "review" : "reviews"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-gray-300">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={`hero-star-${i}`}
                          className="w-4 h-4 text-gray-300"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">No reviews yet</span>
                    <span className="text-xs text-gray-400">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("reviews");
                        const el = document.getElementById("reviews-tab");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs text-[#2D5A27] hover:underline font-semibold cursor-pointer"
                    >
                      Be the first to review
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#2D6A4F]">
                  ৳{currentPrice.toLocaleString("en-US")}
                </span>
                {showDiscount && originalPrice && (
                  <span className="line-through text-gray-400 text-base font-medium">
                    ৳{originalPrice.toLocaleString("en-US")}
                  </span>
                )}
                {showDiscount && discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline">
                Inclusive of all taxes
              </span>
            </div>

            {/* Dynamic Active Promotion Suggestion Banner */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-emerald-900 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Orders over ৳1000 qualify for FREE doorstep delivery! Use active promo codes in cart.</span>
            </div>

            {/* Meta Info Strip */}
            <div className="grid grid-cols-3 gap-2 py-2 px-1 text-xs border-y border-gray-100 text-gray-600">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Vendor</span>
                <span className="font-bold text-gray-900">{brandName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">SKU</span>
                <span className="font-mono font-medium text-gray-700">
                  {selectedVariant?.sku || `GL-${product._id ? String(product._id).slice(-6).toUpperCase() : "784920"}`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Availability</span>
                {inStock ? (
                  <span className="inline-flex items-center gap-1 text-[#2D5A27] font-bold">
                    <Check className="w-3.5 h-3.5" /> In Stock ({currentStock})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription ? (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>
            ) : null}

            {/* Plant Care Quick-Stats Badges (Conditionally rendered) */}
            {product.showCareGuideBadges && product.careBadges && (product.careBadges.sunlight || product.careBadges.water || product.careBadges.petSafe || product.careBadges.difficulty) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.careBadges.sunlight && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FFF9E6] border border-amber-100/80">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase text-amber-900">Sunlight</span>
                      <span className="block text-[11px] text-gray-600 truncate">
                        {product.careBadges.sunlight}
                      </span>
                    </div>
                  </div>
                )}

                {product.careBadges.water && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#E8F4FD] border border-sky-100/80">
                    <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase text-sky-900">Water</span>
                      <span className="block text-[11px] text-gray-600 truncate">
                        {product.careBadges.water}
                      </span>
                    </div>
                  </div>
                )}

                {product.careBadges.petSafe && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#EAF7EE] border border-emerald-100/80">
                    <PawPrint className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase text-emerald-900">Pet Safe</span>
                      <span className="block text-[11px] text-gray-600 truncate">
                        {product.careBadges.petSafe}
                      </span>
                    </div>
                  </div>
                )}

                {product.careBadges.difficulty && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F1F8E9] border border-green-100/80">
                    <Sprout className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase text-green-900">Difficulty</span>
                      <span className="block text-[11px] text-gray-600 truncate">
                        {product.careBadges.difficulty}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Dynamic Variant Selector (Shopify-Style) */}
            {hasDynamicVariants ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    {product.variantGroupTitle || "Select Option"}:
                  </span>
                  {selectedVariant && (
                    <span className="text-xs text-[#2D5A27] font-semibold">
                      Selected: {selectedVariant.name}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {product.variants.map((variant, idx) => {
                    const isSelected = selectedVariant?.name === variant.name;
                    return (
                      <button
                        key={`variant-${idx}`}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm ring-2 ring-[#7BAE37]/30 scale-102"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#7BAE37] hover:bg-[#FBFBFA]"
                        }`}
                      >
                        <span className="block text-xs font-bold">{variant.name}</span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            isSelected ? "text-emerald-100" : "text-gray-500 font-semibold"
                          }`}
                        >
                          ৳{Number(variant.price).toLocaleString("en-US")}
                        </span>
                        {variant.stock <= 5 && variant.stock > 0 && (
                          <span
                            className={`block text-[9px] ${
                              isSelected ? "text-emerald-200" : "text-amber-600 font-medium"
                            }`}
                          >
                            Only {variant.stock} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-white shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !inStock}
                    aria-label="Decrease quantity"
                    className="w-10 h-11 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 text-sm font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock || 99, q + 1))}
                    disabled={quantity >= currentStock || !inStock}
                    aria-label="Increase quantity"
                    className="w-10 h-11 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddToCart(true)}
                  disabled={!inStock}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#7BAE37] hover:bg-[#2D5A27] text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#7BAE37]/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{inStock ? `Add to Cart · ৳${(currentPrice * quantity).toLocaleString("en-US")}` : "Sold Out"}</span>
                </motion.button>
              </div>

              {/* Secondary Button: Buy It Now */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full py-4 px-6 rounded-2xl bg-[#2D5A27] hover:bg-[#1A2E22] text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span>{inStock ? "Buy It Now" : "Sold Out"}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Quick Utility Links */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isWishlisted ? "text-rose-600 font-semibold" : "hover:text-[#2D5A27]"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                <span>{isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}</span>
              </button>

              <button
                type="button"
                onClick={() => message.info({ content: `${product.title} added to comparison list.`, duration: 2 })}
                className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Compare Product</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Trust & Guarantee Strip */}
            {productPageConfig.trustBadges?.isEnabled !== false && (
              <div className="rounded-3xl bg-white p-5 border border-gray-100 space-y-4 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-gray-900">
                        {productPageConfig.trustBadges?.badge1?.title || "Free Shipping"}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {productPageConfig.trustBadges?.badge1?.subtext || "Over ৳1000 order"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] text-sky-700 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-gray-900">
                        {productPageConfig.trustBadges?.badge2?.title || "24/7 Care Support"}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {productPageConfig.trustBadges?.badge2?.subtext || "Plant care helpline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-gray-900">
                        {productPageConfig.trustBadges?.badge3?.title || "Safe Payment"}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {productPageConfig.trustBadges?.badge3?.subtext || "COD Available"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Badges */}
                {productPageConfig.paymentBadges?.isEnabled !== false && (
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-500">Guaranteed Safe Checkout:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {(productPageConfig.paymentBadges?.methods || [
                        "bKash",
                        "Nagad",
                        "VISA",
                        "Mastercard",
                        "Cash on Delivery",
                      ]).map((method, mIdx) => {
                        const isCOD = method.toLowerCase().includes("cash");
                        const isBkash = method.toLowerCase().includes("bkash");
                        const isNagad = method.toLowerCase().includes("nagad");
                        const isVisa = method.toLowerCase().includes("visa");
                        const isMC = method.toLowerCase().includes("master");

                        return (
                          <span
                            key={`pay-method-${mIdx}`}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-2xs ${
                              isCOD
                                ? "bg-emerald-50 border-emerald-200 text-[#2D5A27]"
                                : isBkash
                                ? "bg-pink-50 border-pink-200 text-pink-600"
                                : isNagad
                                ? "bg-orange-50 border-orange-200 text-orange-600"
                                : isVisa
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : isMC
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                          >
                            {method}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ─── 3. TABBED INFORMATION SECTION ─────────────────────────────────── */}
        {(() => {
          const hasCareGuidePopulated =
            product.hasCareGuide !== false &&
            Boolean(
              product.careGuide?.lightLocation?.trim() ||
              product.careGuide?.hydrationWatering?.trim() ||
              product.careGuide?.safetyDifficulty?.trim() ||
              product.careGuide?.horticulturistNote?.trim() ||
              product.careBadges?.sunlight ||
              product.careBadges?.water ||
              product.careBadges?.petSafe ||
              product.careBadges?.difficulty ||
              product.care_instructions?.trim()
            );

          return (
            <div id="reviews-tab" className="mt-20 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              {/* Tab Navigation Headers */}
              <div className="flex border-b border-gray-100 overflow-x-auto bg-[#FBFBFA]">
                {[
                  { id: "description", label: "Description" },
                  ...(hasCareGuidePopulated ? [{ id: "care", label: "Care Guide" }] : []),
                  { id: "reviews", label: `Customer Reviews (${reviewsStats.totalReviews})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 sm:px-8 text-sm font-bold tracking-tight transition-all border-b-2 cursor-pointer whitespace-nowrap ${activeTab === tab.id
                        ? "border-[#7BAE37] text-[#2D5A27] bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-10">
                {/* Tab 1: Description */}
                {activeTab === "description" && (
                  <div className="space-y-6 max-w-4xl">
                    {(() => {
                      const cleanHtml = (product.fullDescriptionHtml ? product.fullDescriptionHtml : "")
                        .replace(/&nbsp;/g, " ")
                        .trim();

                      return cleanHtml ? (
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-gray-900 font-serif">
                            {product.customTabTitle || productPageConfig.defaultTabTitle || "Description"}
                          </h3>
                          <div
                            className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-sm break-words whitespace-normal overflow-wrap-anywhere my-4 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold"
                            style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal" }}
                            dangerouslySetInnerHTML={{ __html: cleanHtml }}
                          />
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Tab 2: Care Guide */}
                {activeTab === "care" && hasCareGuidePopulated && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 font-serif">
                        Complete Botanical Plant Care Guide
                      </h3>
                      <p className="text-xs text-gray-500">
                        Follow these expert horticultural guidelines to keep your specimen thriving year-round.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(product.careGuide?.lightLocation?.trim() || product.careBadges?.sunlight) && (
                        <div className="p-5 rounded-2xl bg-[#FFF9E6] border border-amber-100 space-y-2">
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs">
                            <Sun className="w-5 h-5 text-amber-500" />
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            LIGHT &amp; LOCATION
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {product.careGuide?.lightLocation || product.careBadges?.sunlight}
                          </p>
                        </div>
                      )}

                      {(product.careGuide?.hydrationWatering?.trim() || product.careBadges?.water) && (
                        <div className="p-5 rounded-2xl bg-[#E8F4FD] border border-sky-100 space-y-2">
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs">
                            <Droplets className="w-5 h-5 text-sky-500" />
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            HYDRATION &amp; WATERING
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {product.careGuide?.hydrationWatering || product.careBadges?.water}
                          </p>
                        </div>
                      )}

                      {(product.careGuide?.safetyDifficulty?.trim() || product.careBadges?.petSafe || product.careBadges?.difficulty) && (
                        <div className="p-5 rounded-2xl bg-[#F1F8E9] border border-green-100 space-y-2">
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            SAFETY &amp; DIFFICULTY
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {product.careGuide?.safetyDifficulty ||
                              [product.careBadges?.petSafe, product.careBadges?.difficulty].filter(Boolean).join(" • ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Note */}
                    {(product.careGuide?.horticulturistNote?.trim() || product.care_instructions?.trim()) && (
                      <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-emerald-200">
                        <div className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>SPECIFIC HORTICULTURIST CARE NOTE:</span>
                        </div>
                        <p className="text-xs text-gray-700 italic leading-relaxed">
                          &quot;{product.careGuide?.horticulturistNote || product.care_instructions}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}

            {/* Tab 3: Customer Reviews */}
            {activeTab === "reviews" && (
              <div className="space-y-8 max-w-4xl">
                {/* Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-[#FBFBFA] border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="text-4xl font-extrabold text-[#1E3F20] font-serif block">
                        {reviewsStats.totalReviews > 0
                          ? reviewsStats.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`score-star-${i}`}
                            className={`w-3.5 h-3.5 ${
                              reviewsStats.totalReviews > 0 &&
                              i < Math.round(reviewsStats.averageRating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {reviewsStats.totalReviews > 0
                          ? `Based on ${reviewsStats.totalReviews} verified ${
                              reviewsStats.totalReviews === 1 ? "review" : "reviews"
                            }`
                          : "No reviews submitted yet"}
                      </span>
                    </div>

                    <div className="h-14 w-px bg-gray-200 hidden sm:block" />

                    <div className="hidden sm:block space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>5 Star</span>
                        <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4E7D3E]"
                            style={{
                              width: `${
                                reviewsStats.totalReviews > 0
                                  ? (reviewsList.filter((r) => r.rating === 5).length /
                                      reviewsStats.totalReviews) *
                                    100
                                  : 100
                              }%`,
                            }}
                          />
                        </div>
                        <span>
                          {reviewsStats.totalReviews > 0
                            ? Math.round(
                                (reviewsList.filter((r) => r.rating === 5).length /
                                  reviewsStats.totalReviews) *
                                  100
                              )
                            : 100}
                          %
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>4 Star</span>
                        <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4E7D3E]"
                            style={{
                              width: `${
                                reviewsStats.totalReviews > 0
                                  ? (reviewsList.filter((r) => r.rating === 4).length /
                                      reviewsStats.totalReviews) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span>
                          {reviewsStats.totalReviews > 0
                            ? Math.round(
                                (reviewsList.filter((r) => r.rating === 4).length /
                                  reviewsStats.totalReviews) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-3 rounded-xl bg-[#1E3F20] hover:bg-[#152D17] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Write a Review</span>
                  </button>
                </div>

                {/* Review Submission Form Area (Open to EVERYONE) */}
                <form
                  onSubmit={handleSubmitReview}
                  className="p-6 rounded-2xl bg-white border border-[#EBF0E6] shadow-2xs space-y-4"
                >
                  {session?.user ? (
                    /* Logged-in User Info */
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "Customer"}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1E3F20] text-white flex items-center justify-center font-bold text-xs">
                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">
                              Reviewing as {session.user.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified Account</span>
                            </span>
                          </div>
                          {session.user.email && (
                            <span className="text-[11px] text-gray-500">
                              {session.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Guest User Fields */
                    <div className="space-y-3 pb-3 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-gray-700">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1.5 text-xs text-[#5A6B5C]">
                          <span>Posting as Guest.</span>
                          <span>(Want a Verified badge?</span>
                          <button
                            type="button"
                            onClick={() => signIn("google")}
                            className="font-semibold text-[#1E3F20] underline hover:text-[#4E7D3E] cursor-pointer"
                          >
                            Sign in with Google - optional
                          </button>
                          <span>)</span>
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4E7D3E] focus:ring-1 focus:ring-[#4E7D3E]"
                      />
                    </div>
                  )}

                  {/* Interactive 5-star Rating Selector */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Your Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating || reviewRating) >= star;
                          return (
                            <button
                              key={`star-selector-${star}`}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                              aria-label={`${star} Stars`}
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  isFilled
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-gray-100 text-gray-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-medium text-gray-600 ml-2">
                        {(hoverRating || reviewRating) === 5 && "5 Stars - Outstanding & Thriving"}
                        {(hoverRating || reviewRating) === 4 && "4 Stars - Healthy & Very Good"}
                        {(hoverRating || reviewRating) === 3 && "3 Stars - Average Quality"}
                        {(hoverRating || reviewRating) === 2 && "2 Stars - Below Expectations"}
                        {(hoverRating || reviewRating) === 1 && "1 Star - Damaged or Poor Arrival"}
                      </span>
                    </div>
                  </div>

                  {/* Textarea for review comment */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Your Botanical Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      minLength={5}
                      placeholder="Share details on plant foliage health, root system, packaging, and delivery..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4E7D3E] focus:ring-1 focus:ring-[#4E7D3E]"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Minimum 5 characters.
                    </span>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      disabled={
                        submittingReview ||
                        reviewComment.trim().length < 5 ||
                        (!session?.user && guestName.trim().length < 2)
                      }
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    [1, 2].map((n) => (
                      <div
                        key={`review-skel-${n}`}
                        className="p-5 rounded-2xl bg-white border border-gray-100 space-y-3 animate-pulse"
                      >
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                      </div>
                    ))
                  ) : reviewsList.length === 0 ? (
                    <div className="p-8 text-center bg-[#FBFBFA] rounded-2xl border border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        No customer reviews yet.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Be the first to share your experience with this botanical specimen!
                      </p>
                    </div>
                  ) : (
                    reviewsList.map((rev, revIdx) => {
                      const revDate = rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : rev.date || "Recent";

                      const isVerifiedUser = Boolean(rev.isVerified || rev.isGoogleVerified);

                      return (
                        <div
                          key={rev._id || rev.id || `rev-${revIdx}`}
                          className="p-5 rounded-2xl bg-white border border-gray-100 space-y-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={`rev-item-star-${i}`}
                                  className={`w-3.5 h-3.5 ${
                                    i < (rev.rating || 5)
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-gray-100 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-gray-400">{revDate}</span>
                          </div>

                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                            {rev.comment}
                          </p>

                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-50 text-[11px]">
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
                                <div className="w-6 h-6 rounded-full bg-[#EBF0E6] text-[#1E3F20] font-bold text-[10px] flex items-center justify-center">
                                  {(rev.userName || "Customer").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-gray-800">
                                {rev.userName || "Customer"}
                              </span>
                            </div>

                            {isVerifiedUser && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified User</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
              </div>
            </div>
          );
        })()}

        {/* ─── 4. RELATED PRODUCTS & CUSTOM COLLECTION ───────────────────────── */}
        {productPageConfig.relatedSection?.isEnabled !== false && (
          <div className="mt-20 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#7BAE37]">
                  {productPageConfig.relatedSection?.badge || "Curated Companions"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mt-1">
                  {productPageConfig.relatedSection?.title || "Related Plants & Gardening Tools"}
                </h2>
              </div>
              <Link
                href={productPageConfig.relatedSection?.viewAllUrl || "/#products"}
                className="text-xs font-semibold text-[#2D5A27] hover:text-[#7BAE37] flex items-center gap-1 transition-colors"
              >
                <span>Explore All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0
                ? relatedProducts.map((rel, idx) => (
                    <ProductCard
                      key={rel._id || `rel-prod-${idx}`}
                      product={rel}
                    />
                  ))
                : [1, 2, 3, 4].map((n) => (
                  <div key={`skeleton-${n}`} className="bg-white rounded-3xl p-4 border border-gray-100 animate-pulse space-y-3">
                    <div className="aspect-square bg-gray-100 rounded-2xl" />
                    <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── REVIEW MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 font-serif mb-1">Write a Botanical Review</h3>
              <p className="text-xs text-gray-500 mb-4">Share your plant growth experience with fellow gardeners.</p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {session?.user ? (
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Customer"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#1E3F20] text-white flex items-center justify-center font-bold text-xs">
                          {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">
                            Reviewing as {session.user.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Account</span>
                          </span>
                        </div>
                        {session.user.email && (
                          <span className="text-[10px] text-gray-500">
                            {session.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pb-3 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <label className="font-semibold text-gray-700">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 text-[11px] text-[#5A6B5C]">
                        <span>Posting as Guest.</span>
                        <button
                          type="button"
                          onClick={() => signIn("google")}
                          className="font-semibold text-[#1E3F20] underline hover:text-[#4E7D3E] cursor-pointer"
                        >
                          Sign in for Verified badge
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4E7D3E] focus:ring-1 focus:ring-[#4E7D3E]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={`modal-star-${star}`}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              (hoverRating || reviewRating) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-100 text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Your Review Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={5}
                    placeholder="Describe the plant's health, packaging condition, and transit experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4E7D3E] focus:ring-1 focus:ring-[#4E7D3E]"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Minimum 5 characters.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submittingReview ||
                      reviewComment.trim().length < 5 ||
                      (!session?.user && guestName.trim().length < 2)
                    }
                    className="px-6 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
