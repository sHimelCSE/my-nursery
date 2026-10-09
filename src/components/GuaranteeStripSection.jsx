"use client";

import {
  ShieldCheck,
  Package,
  Truck,
  Headphones,
  RotateCcw,
  CreditCard,
  Leaf,
} from "lucide-react";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/constants/defaultHomepageConfig";

const ICON_MAP = {
  ShieldCheck,
  Package,
  Truck,
  Headphones,
  RotateCcw,
  CreditCard,
  Leaf,
};

export default function GuaranteeStripSection({ data }) {
  if (data?.isEnabled === false) {
    return null;
  }

  const items =
    Array.isArray(data?.items) && data.items.length > 0
      ? data.items
      : DEFAULT_HOMEPAGE_CONFIG.guaranteeStrip.items;

  return (
    <section
      id="guarantee-strip"
      className="section-guarantee-strip bg-[#FAFBF9] border-t border-b border-[#E8ECE4] py-10 md:py-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item, idx) => {
            const IconComp = ICON_MAP[item.icon] || ShieldCheck;
            const title = item.title || `Guarantee Pillar #${idx + 1}`;
            const desc = item.description || "";

            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center shrink-0">
                  <IconComp className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#1A2E22]">
                    {title}
                  </h4>
                  <p className="text-xs text-[#5A6B5C] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
