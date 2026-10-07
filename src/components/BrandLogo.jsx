"use client";

import Image from "next/image";
import { Sprout } from "lucide-react";

export default function BrandLogo({
  logoType = "logo_only",
  logoUrl = "",
  siteName = "",
  tagline = "",
  isFooter = false,
  className = "",
}) {
  const currentLogoType = logoType || "logo_only";
  const name = siteName;
  const sub = tagline;
  const hasImage = Boolean(logoUrl && logoUrl.trim());

  // 1. Logo Only Mode
  if (currentLogoType === "logo_only") {
    if (hasImage) {
      return (
        <div className={`inline-flex items-center ${className}`}>
          <Image
            src={logoUrl}
            alt={name}
            width={160}
            height={48}
            priority={!isFooter}
            className="h-9 sm:h-16 w-auto max-w-[190px] object-contain transition-transform group-hover:scale-102"
          />
        </div>
      );
    }
    // Graceful fallback to Text Only if no logoUrl is uploaded
  }

  // 2. Logo With Text Mode
  if (currentLogoType === "logo_with_text") {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {hasImage ? (
          <Image
            src={logoUrl}
            alt={name}
            width={40}
            height={40}
            priority={!isFooter}
            className={`h-10 w-10 object-contain p-0.5 transition-transform group-hover:scale-105 ${isFooter
              ? "rounded-full bg-white border border-gray-200"
              : "rounded-2xl border border-emerald-100/80 bg-white"
              }`}
          />
        ) : isFooter ? (
          <span className="w-10 h-10 rounded-full bg-[#1E3F20] flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </span>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E7D3E] to-[#1E3F20] flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-300 shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
        )}

        <div className="leading-tight">
          <span
            className={`font-bold tracking-tight font-serif block ${isFooter ? "text-xl text-[#1C2B1E]" : "text-2xl text-gray-900"
              }`}
          >
            {name}
          </span>
          {sub ? (
            <span
              className={`block tracking-widest uppercase font-semibold text-[#2D5A27] ${isFooter ? "text-[9px]" : "text-[10px]"
                }`}
            >
              {sub}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  // 3. Text Only Mode (Clean botanical leaf SVG + styled brand text)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {isFooter ? (
        <span className="w-10 h-10 rounded-full bg-[#1E3F20] flex items-center justify-center shrink-0">
          <Sprout className="w-5 h-5 text-white" />
        </span>
      ) : (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E7D3E] to-[#1E3F20] flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-300 shrink-0">
          <Sprout className="w-5 h-5 text-white" />
        </div>
      )}

      <div className="leading-tight">
        <span
          className={`font-bold tracking-tight font-serif block ${isFooter ? "text-xl text-[#1C2B1E]" : "text-2xl text-gray-900"
            }`}
        >
          {name}
        </span>
        {sub ? (
          <span
            className={`block tracking-widest uppercase font-semibold text-[#2D5A27] ${isFooter ? "text-[9px]" : "text-[10px]"
              }`}
          >
            {sub}
          </span>
        ) : null}
      </div>
    </div>
  );
}
