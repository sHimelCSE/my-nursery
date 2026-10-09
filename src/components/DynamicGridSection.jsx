"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowRight, ShoppingBag, Plus, Star, Sprout, CheckCircle2 } from "lucide-react";
import useCartStore from "@/lib/cartStore";
import { App } from "antd";
import ProductCard from "@/components/ProductCard";

export default function DynamicGridSection({ section }) {
  const {
    title,
    subtitle,
    layout = "2-column",
    backgroundColor = "#F8FAF8",
    textColor = "#1F2937",
    blocks = [],
  } = section;

  return (
    <section
      className="py-16 md:py-20 border-b border-gray-100 transition-colors"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-sans">
                {subtitle}
              </p>
            )}
            <div className="w-12 h-1 bg-[#2D5A27] mx-auto rounded-full mt-3 opacity-60" />
          </div>
        )}

        {/* Dynamic Grid Layout */}
        <div className={getGridClasses(layout)}>
          {blocks.map((block, idx) => (
            <div
              key={block._id || `block-${idx}`}
              className={getBlockSpanClasses(layout, idx, blocks.length)}
            >
              <BlockRenderer block={block} textColor={textColor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getGridClasses(layout) {
  switch (layout) {
    case "1-column":
      return "grid grid-cols-1 max-w-3xl mx-auto gap-8";
    case "2-column":
      return "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center";
    case "3-column":
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start";
    case "4-column":
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start";
    case "split-banner":
      return "grid grid-cols-1 lg:grid-cols-12 gap-8 items-center";
    default:
      return "grid grid-cols-1 md:grid-cols-2 gap-8 items-center";
  }
}

function getBlockSpanClasses(layout, idx, total) {
  if (layout === "split-banner") {
    if (idx === 0) return "lg:col-span-5 space-y-4";
    if (idx === 1) return "lg:col-span-7";
  }
  return "space-y-4";
}

function BlockRenderer({ block, textColor }) {
  const { type, data = {} } = block;

  switch (type) {
    case "text":
      return <TextBlock data={data} textColor={textColor} />;
    case "image":
      return <ImageBlock data={data} />;
    case "accordion":
      return <AccordionBlock data={data} />;
    case "button":
      return <ButtonBlock data={data} />;
    case "products":
      return <ProductsBlock data={data} />;
    default:
      return null;
  }
}

function TextBlock({ data }) {
  return (
    <div className="space-y-3">
      {data.badge && (
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E8F5E9] text-[#2D5A27]">
          {data.badge}
        </span>
      )}
      {data.title && (
        <h3 className="text-xl sm:text-2xl font-bold font-serif leading-snug">
          {data.title}
        </h3>
      )}
      {data.subtitle && (
        <h4 className="text-xs sm:text-sm font-semibold opacity-75">
          {data.subtitle}
        </h4>
      )}
      {data.body && (
        <p className="text-xs sm:text-sm leading-relaxed opacity-85 whitespace-pre-line">
          {data.body}
        </p>
      )}
    </div>
  );
}

function ImageBlock({ data }) {
  const imageUrl =
    data.imageUrl ||
    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
        <Image
          src={imageUrl}
          alt={data.alt || data.title || "Botanical photo"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      {data.caption && (
        <p className="text-[11px] text-center opacity-65 italic">
          {data.caption}
        </p>
      )}
    </div>
  );
}

function AccordionBlock({ data }) {
  const items = Array.isArray(data.accordionItems)
    ? data.accordionItems
    : Array.isArray(data.items)
    ? data.items
    : [];

  const [openIndex, setOpenIndex] = useState(0);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const q = item.title || item.q || `Question ${idx + 1}`;
        const a = item.content || item.a || "";

        return (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200/80 bg-white/90 shadow-2xs overflow-hidden transition-all text-gray-800"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm hover:text-[#2D5A27] transition-colors cursor-pointer"
            >
              <span>{q}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
                  isOpen ? "rotate-180 text-[#2D5A27]" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ButtonBlock({ data }) {
  const text = data.buttonText || data.text || "Explore Collection";
  const link = data.buttonLink || data.link || "/#products";

  return (
    <div className="pt-2">
      <Link
        href={link}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#7BAE37] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all group"
      >
        <span>{text}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function ProductsBlock({ data }) {
  const { message } = App.useApp();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = data.categoryId || data.categorySlug || data.category || "";
  const limit = Number(data.limit) || 4;

  useEffect(() => {
    let isSubscribed = true;
    async function fetchCategoryProducts() {
      try {
        setLoading(true);
        const url = category && category !== "all"
          ? `/api/products?category=${encodeURIComponent(category)}`
          : "/api/products";
        const res = await fetch(url);
        const json = await res.json();
        if (isSubscribed && json.success && Array.isArray(json.data)) {
          setProducts(json.data.slice(0, limit));
        }
      } catch (err) {
        console.error("Failed to load section products:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }
    fetchCategoryProducts();
    return () => {
      isSubscribed = false;
    };
  }, [category, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-2">
            <div className="aspect-square bg-gray-100 rounded-xl" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 bg-white/70 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
        <Sprout className="w-8 h-8 mx-auto mb-2 text-[#7BAE37]" />
        <span>No products in this category yet.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((prod) => (
        <ProductCard key={prod._id} product={prod} />
      ))}
    </div>
  );
}
