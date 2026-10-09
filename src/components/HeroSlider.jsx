"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  Lock,
  Sparkles,
  Leaf,
  BookOpen,
} from "lucide-react";

const TRUST_PERKS = [
  { icon: Truck, label: "Free Shipping in BD" },
  { icon: ShieldCheck, label: "30-Day Health Guarantee" },
  { icon: Lock, label: "100% Secure Payments" },
];

export const HERO_SLIDES = [
  {
    id: "air-purifiers",
    badge: "# AIR PURIFIER COLLECTION",
    heading: "Breathe Cleaner Air With Living Foliage",
    subtitle:
      "NASA-recommended indoor plants that naturally purify benzene, formaldehyde, and airborne toxins in living spaces.",
    primaryBtnText: "Shop Air Purifiers",
    primaryBtnLink: "/collections",
    secondaryBtnText: "Plant Care Guide",
    secondaryBtnLink: "/blog",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=1400&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1400&q=85",
    imageAlt: "Peace Lily Spathiphyllum potted plant in bright living room",
    floatingCard: {
      title: "Peace Lily (Spathiphyllum)",
      price: "৳380",
      avgRating: 0,
      reviewCount: 0,
      link: "/products",
      tag: "Air Cleanser",
    },
    accentColor: "#2D6A4F",
    bgSubtle: "#EBF0E6",
  },
  {
    id: "bonsai-series",
    badge: "# THE BONSAI SERIES",
    heading: "Sculpted Bonsai & Ancient Specimen Foliage",
    subtitle:
      "Hand-crafted dwarf trees and living sculptures bringing meditative calm and timeless green art to modern homes.",
    primaryBtnText: "Explore Bonsai",
    primaryBtnLink: "/collections",
    secondaryBtnText: "Care Tips",
    secondaryBtnLink: "/blog",
    image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1400&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1400&q=85",
    imageAlt: "Ficus Retusa Bonsai specimen in ceramic planter",
    floatingCard: {
      title: "Ficus Retusa Bonsai",
      price: "৳1,250",
      avgRating: 0,
      reviewCount: 0,
      link: "/products",
      tag: "Living Sculpture",
    },
    accentColor: "#1E3F20",
    bgSubtle: "#EBF2E4",
  },
  {
    id: "organic-essentials",
    badge: "# ORGANIC LIVING ESSENTIALS",
    heading: "100% Organic Soils & Handcrafted Planters",
    subtitle:
      "Nutrient-dense worm compost, breathable geo-fabric grow bags, and minimalist ceramic pots tailored for thriving balconies.",
    primaryBtnText: "Shop Soil & Pots",
    primaryBtnLink: "/collections",
    secondaryBtnText: "Explore Kits",
    secondaryBtnLink: "/products",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1400&q=85",
    fallbackImage: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1400&q=85",
    imageAlt: "Minimalist ceramic planters with thriving succulents and rich soil",
    floatingCard: {
      title: "Ceramic Minimalist Planter",
      price: "৳290",
      avgRating: 0,
      reviewCount: 0,
      link: "/products",
      tag: "Handcrafted Ceramic",
    },
    accentColor: "#3F6236",
    bgSubtle: "#EEF3E9",
  },
];

export default function HeroSlider({ section, data }) {
  // Support dynamic slides from HomepageConfig data prop, with section or static fallback
  const dynamicSlides = data?.slides && data.slides.length > 0 ? data.slides : null;
  const cmsContent = section?.content || {};

  const slides = dynamicSlides
    ? dynamicSlides.map((s, idx) => {
        const fallback = HERO_SLIDES[idx % HERO_SLIDES.length] || HERO_SLIDES[0];
        const featProd =
          typeof s.featuredProductId === "object" && s.featuredProductId
            ? s.featuredProductId
            : null;

        let floatingCard = null;
        if (featProd) {
          floatingCard = {
            title: featProd.title || "Botanical Specimen",
            price: `৳${featProd.price}`,
            link: `/products/${featProd._id}`,
            avgRating: Number(featProd.avgRating || featProd.averageRating || 0),
            reviewCount: Number(featProd.reviewCount || 0),
            tag: featProd.category
              ? featProd.category.charAt(0).toUpperCase() + featProd.category.slice(1)
              : (s.floatingCard?.tag || "Featured Specimen"),
          };
        } else if (s.floatingCard?.title) {
          floatingCard = {
            title: s.floatingCard.title,
            price: s.floatingCard.price || "৳380",
            link: s.floatingCard.link || "/products",
            avgRating: 0,
            reviewCount: 0,
            tag: s.floatingCard.tag || fallback.floatingCard.tag,
          };
        } else {
          floatingCard = fallback.floatingCard;
        }

        return {
          id: s._id || `slide-${idx}`,
          badge: s.badge || fallback.badge,
          heading: s.title || s.heading || fallback.heading,
          subtitle: s.subtitle || fallback.subtitle,
          primaryBtnText: s.buttonText || s.primaryBtnText || fallback.primaryBtnText,
          primaryBtnLink: s.buttonUrl || s.primaryBtnLink || fallback.primaryBtnLink,
          secondaryBtnText: s.secondaryBtnText || fallback.secondaryBtnText,
          secondaryBtnLink: s.secondaryBtnLink || fallback.secondaryBtnLink,
          image: s.imageUrl || s.image || fallback.image,
          imageAlt: s.title || fallback.imageAlt,
          floatingCard,
        };
      })
    : [
        {
          ...HERO_SLIDES[0],
          heading: cmsContent.heroTitle || HERO_SLIDES[0].heading,
          subtitle: cmsContent.heroSubtitle || HERO_SLIDES[0].subtitle,
          badge: cmsContent.heroTag ? `# ${cmsContent.heroTag.replace(/^#\s*/, "")}` : HERO_SLIDES[0].badge,
          image: cmsContent.heroImage || HERO_SLIDES[0].image,
          primaryBtnText: cmsContent.primaryBtnText || HERO_SLIDES[0].primaryBtnText,
          primaryBtnLink: cmsContent.primaryBtnLink || HERO_SLIDES[0].primaryBtnLink,
          secondaryBtnText: cmsContent.secondaryBtnText || HERO_SLIDES[0].secondaryBtnText,
          secondaryBtnLink: cmsContent.secondaryBtnLink || HERO_SLIDES[0].secondaryBtnLink,
          floatingCard: {
            ...HERO_SLIDES[0].floatingCard,
            title: cmsContent.cardPlantName || HERO_SLIDES[0].floatingCard.title,
            price: cmsContent.cardPrice || HERO_SLIDES[0].floatingCard.price,
          },
        },
        HERO_SLIDES[1],
        HERO_SLIDES[2],
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Auto-play timer (5 seconds), pauses when hovered
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, handleNext]);

  // Framer Motion slide animation variants
  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.45 },
      },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  return (
    <section
      id="hero-slider-section"
      className="relative bg-[#F7F8F4] overflow-hidden select-none border-b border-[#E8ECE4]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Botanical Collections Hero Slider"
    >
      {/* Decorative ambient botanical gradient */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#EBF0E6]/60 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#E3EBDC]/50 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-18 z-10">
        <div className="relative min-h-[580px] lg:min-h-[520px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* ── Left Content Area (7 cols on lg) ────────────────────────── */}
              <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0E6] border border-[#D8E4D3] text-[#2D5A27]">
                  <Leaf className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em]">
                    {currentSlide.badge}
                  </span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#1C2B1E] leading-[1.1] tracking-tight">
                  {currentSlide.heading}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-[#5A6B5C] leading-relaxed max-w-xl font-normal">
                  {currentSlide.subtitle}
                </p>

                {/* Action Buttons: Strict rounded-full pills */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    href={currentSlide.primaryBtnLink}
                    className="inline-flex items-center justify-center gap-2 bg-[#1E3F20] hover:bg-[#152D17] text-white px-7 py-3.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{currentSlide.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={currentSlide.secondaryBtnLink}
                    className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-[#1C2B1E] hover:bg-gray-50 hover:border-gray-400 px-6 py-3.5 rounded-full text-sm font-bold transition-all shadow-2xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                    <span>{currentSlide.secondaryBtnText}</span>
                  </Link>
                </div>

                {/* Bottom Micro-Trust Strip */}
                <div className="pt-5 border-t border-[#E3E8DD]/90">
                  <ul className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
                    {TRUST_PERKS.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#5A6B5C]"
                      >
                        <Icon className="w-4 h-4 text-[#1E3F20] shrink-0" strokeWidth={2} />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Right Visual Area (5 cols on lg) ───────────────────────── */}
              <div className="lg:col-span-5 relative order-1 lg:order-2">
                {/* Decorative botanical shadow backdrop */}
                <div
                  className="absolute -inset-3 bg-[#EBF0E6] rounded-[2.5rem] -rotate-1 transition-transform duration-500"
                  aria-hidden="true"
                />

                {/* Image Container with smooth Next.js image */}
                <div className="relative aspect-[4/4.2] sm:aspect-[4/3.8] lg:aspect-[4/4.3] rounded-[2rem] overflow-hidden bg-[#EBF0E6] shadow-lg">
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.imageAlt}
                    fill
                    priority={currentIndex === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />

                  {/* Subtle gradient vignette at bottom for card contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Glassmorphic Product Card */}
                {currentSlide.floatingCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 w-[240px] sm:w-[270px] rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_20px_35px_-12px_rgba(28,43,30,0.3)] p-4 hover:-translate-y-1 transition-transform duration-300"
                  >
                    {/* Tag badge */}
                    {currentSlide.floatingCard.tag && (
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#2D5A27] bg-[#EBF0E6] px-2 py-0.5 rounded-full mb-1">
                        {currentSlide.floatingCard.tag}
                      </span>
                    )}

                    <h3 className="text-sm sm:text-base font-bold text-[#1C2B1E] truncate">
                      {currentSlide.floatingCard.title}
                    </h3>

                    {/* Real Database Star Rating */}
                    <div className="flex items-center gap-1 mt-1">
                      {currentSlide.floatingCard.reviewCount > 0 ? (
                        <>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const isFilled =
                                starVal <= Math.round(currentSlide.floatingCard.avgRating || 0);
                              return (
                                <Star
                                  key={starVal}
                                  className={`w-3.5 h-3.5 ${
                                    isFilled
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 ml-1">
                            {Number(currentSlide.floatingCard.avgRating).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            ({currentSlide.floatingCard.reviewCount})
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <Star key={starVal} className="w-3.5 h-3.5 text-gray-300" />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400 ml-1">No reviews yet</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block leading-none">Price</span>
                        <span className="text-sm font-extrabold text-[#1E3F20]">
                          {currentSlide.floatingCard.price}
                        </span>
                      </div>
                      <Link
                        href={currentSlide.floatingCard.link}
                        className="bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Carousel Controls ────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 sm:pt-8 mt-2 border-t border-[#E8ECE4]/70">
          {/* Centered Pagination Indicators */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Hero slider pagination">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${isActive
                    ? "w-8 bg-[#1E3F20] shadow-2xs"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to slide ${idx + 1}: ${slide.heading}`}
                  aria-selected={isActive}
                  role="tab"
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {/* Arrow Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#1E3F20] border border-gray-200 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
              aria-label="Previous botanical slide"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            {/* Arrow Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#1E3F20] border border-gray-200 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
              aria-label="Next botanical slide"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
