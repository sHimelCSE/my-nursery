"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import useCartStore from "@/lib/cartStore";

const FALLBACK = "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=200&q=70";

function calcDelivery(subtotal, isFreeShipping, city = "Dhaka") {
  if (subtotal >= 1000 || isFreeShipping) return 0;
  return city === "Dhaka" ? 60 : 120;
}

export default function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();

  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);

  // Isolate Admin Portal: Do not render cart drawer on /Manage_Admin routes
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const appliedDiscounts = useCartStore((s) => s.appliedDiscounts || []);
  const discountTotal = useCartStore((s) => s.discountTotal || 0);
  const isFreeShipping = useCartStore((s) => s.isFreeShipping || false);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState({ type: "", message: "" });

  const subtotal = getTotalPrice();
  const deliveryCharge = calcDelivery(subtotal, isFreeShipping, "Dhaka");
  const grandTotal = Math.max(0, subtotal - discountTotal) + deliveryCharge;
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;

    setApplyingPromo(true);
    setPromoFeedback({ type: "", message: "" });

    try {
      const res = await applyCoupon(promoInput.trim());
      if (res.success) {
        setPromoFeedback({ type: "success", message: res.message || "Coupon applied!" });
        setPromoInput("");
      } else {
        setPromoFeedback({ type: "error", message: res.message || "Failed to apply coupon." });
      }
    } catch {
      setPromoFeedback({ type: "error", message: "Network error applying coupon." });
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
          />

          {/* Drawer panel */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.9 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col"
            aria-label="Shopping Cart Drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-bold text-gray-900 font-serif">Your Cart</h2>
                {totalQty > 0 && (
                  <span className="bg-[#E8F5E9] text-[#2D5A27] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {totalQty} {totalQty === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart drawer"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-20 h-20 rounded-full bg-[#F1F8E9] text-[#7BAE37] flex items-center justify-center shadow-inner"
                >
                  <ShoppingBag className="w-9 h-9 stroke-[1.6]" />
                </motion.div>
                <div className="text-center">
                  <p className="text-gray-900 font-bold text-lg mb-1">Your cart is empty</p>
                  <p className="text-gray-500 text-xs max-w-xs">
                    Explore our botanical collection of rare plants, organic feeds, and planters.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#7BAE37] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex gap-3 bg-[#FBFBFA] rounded-2xl p-3 border border-gray-100/90"
                      >
                        {/* Thumbnail */}
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          <img
                            src={item.image || FALLBACK}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK;
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-xs leading-snug line-clamp-2">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#2D5A27]">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </span>

                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order Summary & Promo Code Section */}
                <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                  {/* Promo Code Input Box */}
                  <div className="space-y-1.5">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Enter promo code (e.g. WELCOME10)"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoFeedback({ type: "", message: "" });
                          }}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 uppercase font-mono tracking-wide placeholder:normal-case placeholder:font-sans"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingPromo || !promoInput.trim()}
                        className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                      >
                        {applyingPromo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </form>

                    {promoFeedback.message && (
                      <p
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          promoFeedback.type === "success"
                            ? "text-[#2D6A4F]"
                            : "text-red-500"
                        }`}
                      >
                        {promoFeedback.type === "success" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{promoFeedback.message}</span>
                      </p>
                    )}

                    {/* Applied Coupon Tags */}
                    {appliedDiscounts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {appliedDiscounts.map((disc) => (
                          <div
                            key={disc.code}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EBF0E6] border border-emerald-300 text-[#1E3F20] text-xs font-semibold"
                          >
                            <Tag className="w-3 h-3 text-[#2D6A4F]" />
                            <span className="font-mono font-bold">{disc.code}</span>
                            {disc.discountAmount > 0 && (
                              <span className="text-[11px] text-[#2D6A4F] font-bold">
                                (-৳{disc.discountAmount.toLocaleString()})
                              </span>
                            )}
                            {disc.isFreeShipping && (
                              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1 rounded">
                                Free Delivery
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeCoupon(disc.code)}
                              className="p-0.5 hover:text-red-600 transition-colors cursor-pointer rounded-full hover:bg-white"
                              title="Remove coupon"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal ({totalQty} items)</span>
                      <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
                    </div>

                    {discountTotal > 0 && (
                      <div className="flex justify-between text-[#2D6A4F] font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Discount</span>
                        </span>
                        <span>-৳{discountTotal.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500">
                      <span>Delivery (Dhaka City)</span>
                      <span
                        className={`font-semibold ${
                          deliveryCharge === 0 ? "text-[#2D6A4F] font-bold" : "text-gray-900"
                        }`}
                      >
                        {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                      </span>
                    </div>

                    {deliveryCharge > 0 && !isFreeShipping && subtotal < 1000 && (
                      <p className="text-[11px] bg-[#EBF0E6] text-[#1E3F20] rounded-xl px-2.5 py-1 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3 h-3 text-[#2D6A4F] shrink-0" />
                        Add ৳{(1000 - subtotal).toLocaleString()} more for Free Delivery
                      </p>
                    )}

                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 text-gray-900">
                      <span>Grand Total</span>
                      <span className="text-[#1E3F20] text-base font-black">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    id="proceed-to-checkout"
                    className="w-full py-3.5 rounded-2xl bg-[#1E3F20] hover:bg-[#2D6A4F] text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer tracking-wide"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={clearCart}
                    className="w-full text-center py-0.5 text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
