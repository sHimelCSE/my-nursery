"use client";

import { ShieldCheck, Package, Truck, Headphones } from "lucide-react";

const GUARANTEE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Healthy Plant Guarantee",
    desc: "Acclimatized for resilience. 48-hour replacement warranty if any plant arrives stressed.",
  },
  {
    icon: Package,
    title: "Eco-Friendly Bio Packaging",
    desc: "Biodegradable coco-peat liners & recyclable cushioning to protect tender foliage in transit.",
  },
  {
    icon: Truck,
    title: "Doorstep Safe Delivery",
    desc: "Climate-conscious plant couriers delivering fresh greenery across Dhaka & nationwide.",
  },
  {
    icon: Headphones,
    title: "Lifetime Botanical Advice",
    desc: "Ongoing watering & repotting guidance from our experienced horticulturists post-purchase.",
  },
];

export default function GuaranteeStripSection({ data }) {
  return (
    <section
      id="guarantee-strip"
      className="section-guarantee-strip bg-[#FAFBF9] border-t border-b border-[#E8ECE4] py-10 md:py-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {GUARANTEE_PILLARS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 stroke-[2]" />
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
          ))}
        </div>
      </div>
    </section>
  );
}
