"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), {
  ssr: false,
});

const WishlistNotifier = dynamic(
  () => import("@/components/WishlistNotifier"),
  { ssr: false }
);

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), {
  ssr: false,
});

export default function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <WishlistNotifier />
      <WhatsAppButton />
    </>
  );
}
