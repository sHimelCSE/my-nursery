"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, X, Check } from "lucide-react";
import useWishlistStore from "@/lib/wishlistStore";

export default function WishlistNotifier() {
  const notification = useWishlistStore((s) => s.notification);
  const dismissNotification = useWishlistStore((s) => s.dismissNotification);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      dismissNotification();
    }, notification.type === "added" ? 4500 : 2500);

    return () => clearTimeout(timer);
  }, [notification, dismissNotification]);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence mode="wait">
        {notification?.type === "added" && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#EBF0E6] rounded-2xl p-4 shadow-[0_12px_36px_rgba(30,63,32,0.14)] flex items-start gap-3.5"
          >
            {/* Animated Heart Icon Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-full bg-[#EBF0E6] flex items-center justify-center shrink-0 text-[#1E3F20]"
            >
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </motion.div>

            {/* Notification Text & Actions */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1E3F20] tracking-wide uppercase">
                  Added to Wishlist!
                </span>
                <button
                  type="button"
                  onClick={dismissNotification}
                  aria-label="Dismiss notification"
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-medium text-gray-700 truncate mt-0.5">
                {notification.product?.title || "Botanical specimen"}
              </p>

              <div className="mt-2.5 flex items-center gap-3">
                <Link
                  href="/wishlist"
                  onClick={dismissNotification}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3F20] hover:text-[#4E7D3E] transition-colors group cursor-pointer"
                >
                  <span>View Wishlist</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {notification?.type === "removed" && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto bg-gray-900/90 text-white backdrop-blur-md rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2.5 text-xs font-medium self-end"
          >
            <Heart className="w-4 h-4 text-gray-300 stroke-[1.8]" />
            <span>Removed from Wishlist</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
