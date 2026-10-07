import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────
      items: [],
      notification: null,

      // ── Actions ───────────────────────────────────
      addToWishlist: (product) => {
        const { items } = get();
        const id = product?._id || product?.id;
        if (!id) return false;

        const exists = items.some((item) => (item._id || item.id) === id);
        if (exists) return false;

        const img =
          product.images?.[0] ||
          product.image ||
          (Array.isArray(product.images) ? product.images[0] : "") ||
          "";

        const normalizedProduct = {
          _id: id,
          id: id,
          title: product.title || "Botanical Plant",
          price: Number(product.price || 0),
          image: img,
          images: product.images || (img ? [img] : []),
          category: product.category || "Indoor Plants",
          stock_quantity:
            product.stock_quantity !== undefined
              ? product.stock_quantity
              : product.stock !== undefined
              ? product.stock
              : 10,
          description: product.description || "",
        };

        set({
          items: [normalizedProduct, ...items],
          notification: {
            type: "added",
            product: normalizedProduct,
            id: Date.now(),
          },
        });
        return true;
      },

      removeFromWishlist: (productId) => {
        set({
          items: get().items.filter(
            (item) => item._id !== productId && item.id !== productId
          ),
          notification: {
            type: "removed",
            id: Date.now(),
          },
        });
      },

      toggleWishlist: (product) => {
        const id = product?._id || product?.id;
        if (!id) return false;
        const exists = get().isInWishlist(id);
        if (exists) {
          get().removeFromWishlist(id);
          return false; // Removed
        } else {
          get().addToWishlist(product);
          return true; // Added
        }
      },

      isInWishlist: (productId) => {
        if (!productId) return false;
        return get().items.some(
          (item) => item._id === productId || item.id === productId
        );
      },

      clearWishlist: () => set({ items: [] }),

      dismissNotification: () => set({ notification: null }),

      // ── Computed ───────────────────────────────────
      getTotalItems: () => get().items.length,
    }),
    {
      name: "greenleaf-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useWishlistStore;
