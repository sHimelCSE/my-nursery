import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────
      items: [],
      isCartOpen: false,

      // ── Drawer controls ────────────────────────────
      openCart:   () => set({ isCartOpen: true }),
      closeCart:  () => set({ isCartOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

      // ── Cart item actions ──────────────────────────
      addItem: (product) => {
        const { items } = get();
        const existing = items.find((i) => i._id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                _id:      product._id,
                title:    product.title,
                price:    product.price,
                image:    product.images?.[0] || "",
                quantity: 1,
              },
            ],
          });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set({
          items: get().items.map((i) => (i._id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      // ── Computed ───────────────────────────────────
      getTotalItems:  () => get().items.reduce((s, i) => s + i.quantity, 0),
      getTotalPrice:  () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: "greenleaf-cart",
      // Only persist cart items — not the drawer open state
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
