"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  DeleteOutlined, MinusOutlined, PlusOutlined,
  ShoppingOutlined, CloseOutlined,
} from "@ant-design/icons";
import useCartStore from "@/lib/cartStore";

const FALLBACK = "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=200&q=70";

// ─── Delivery charge helper ────────────────────────────────────────────────────
function calcDelivery(subtotal, city = "") {
  if (subtotal >= 1000) return 0;
  return city === "Dhaka" ? 60 : 120;
}

export default function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();

  const isCartOpen    = useCartStore((s) => s.isCartOpen);
  const closeCart     = useCartStore((s) => s.closeCart);

  // Isolate Admin Portal: Do not render cart drawer on /Manage_Admin routes
  if (pathname && pathname.startsWith("/Manage_Admin")) {
    return null;
  }
  const items         = useCartStore((s) => s.items);
  const removeItem    = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart     = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const subtotal      = getTotalPrice();
  const deliveryCharge = calcDelivery(subtotal, "Dhaka"); // default Dhaka
  const total         = subtotal + deliveryCharge;
  const totalQty      = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/25 backdrop-blur-[3px] z-50"
          />

          {/* ── Drawer panel ─────────────────────────── */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.9 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col"
            aria-label="Shopping Cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingOutlined style={{ fontSize: "18px", color: "#2D6A4F" }} />
                <h2 className="text-[16px] font-bold text-[#1A2E22]">Shopping Cart</h2>
                {totalQty > 0 && (
                  <span className="bg-[#D8F3DC] text-[#2D6A4F] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {totalQty} {totalQty === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <CloseOutlined style={{ fontSize: "15px" }} />
              </motion.button>
            </div>

            {/* ── Empty State ──────────────────────────── */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-24 h-24 rounded-full bg-[#F4F7F4] flex items-center justify-center text-5xl"
                >
                  🛒
                </motion.div>
                <div className="text-center">
                  <p className="text-[#1A2E22] font-bold text-lg mb-1.5">Your cart is empty</p>
                  <p className="text-[#6B7280] text-sm">Add some plants to get started! 🌿</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={closeCart}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#40916C] transition-all"
                >
                  Continue Shopping
                </motion.button>
              </div>
            ) : (
              <>
                {/* ── Items List ─────────────────────────── */}
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
                        className="flex gap-3 bg-[#FBFBFA] rounded-2xl p-3 border border-gray-100/80"
                      >
                        {/* Thumbnail */}
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-[#D8F3DC]/30 shrink-0">
                          <img
                            src={item.image || FALLBACK}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = FALLBACK; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <p className="text-[#1A2E22] font-semibold text-[13px] leading-snug line-clamp-2">
                            {item.title}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            {/* Price */}
                            <p className="text-[#2D6A4F] font-extrabold text-[15px]">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </p>

                            {/* Controls */}
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusOutlined style={{ fontSize: "10px" }} />
                                </button>
                                <span className="w-7 text-center text-[13px] font-bold text-[#1A2E22]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <PlusOutlined style={{ fontSize: "10px" }} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item._id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                                aria-label="Remove item"
                              >
                                <DeleteOutlined style={{ fontSize: "13px" }} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                            ৳{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* ── Order Summary Footer ─────────────────── */}
                <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[13px] text-[#6B7280]">
                      <span>Subtotal ({totalQty} items)</span>
                      <span className="font-semibold text-[#1A2E22]">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-[#6B7280]">
                      <span>Delivery (Inside Dhaka)</span>
                      <span className={`font-semibold ${deliveryCharge === 0 ? "text-[#40916C]" : "text-[#1A2E22]"}`}>
                        {deliveryCharge === 0 ? "🎉 Free!" : `৳${deliveryCharge}`}
                      </span>
                    </div>
                    {deliveryCharge > 0 && (
                      <p className="text-[11px] text-[#9CA3AF] bg-[#FBFBFA] rounded-lg px-3 py-1.5">
                        💡 Add ৳{(1000 - subtotal).toLocaleString()} more for free delivery · ৳120 for outside Dhaka
                      </p>
                    )}
                    <div className="flex justify-between text-[15px] font-extrabold border-t border-gray-100 pt-2.5 mt-1">
                      <span className="text-[#1A2E22]">Total</span>
                      <span className="text-[#2D6A4F]">৳{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCheckout}
                    id="proceed-to-checkout"
                    className="w-full py-3.5 rounded-2xl bg-[#2D6A4F] text-white font-bold text-[15px] hover:bg-[#40916C] shadow-md shadow-green-900/15 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Proceed to Checkout →
                  </motion.button>

                  <button
                    onClick={clearCart}
                    className="w-full mt-2.5 py-1.5 text-[12px] text-[#9CA3AF] hover:text-red-400 transition-colors"
                  >
                    Clear all items
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
