import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────
      items: [],
      isCartOpen: false,
      appliedDiscounts: [], // [{ code, type, value, discountAmount, isFreeShipping, discountDetails, isAutomatic }]
      discountTotal: 0,
      isFreeShipping: false,
      customerEmail: "",

      // ── Drawer controls ────────────────────────────
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

      setCustomerEmail: (email) => {
        set({ customerEmail: email });
        get().recalculateDiscounts(email);
      },

      // ── Cart item actions ──────────────────────────
      addItem: (product) => {
        const { items } = get();
        const id = product._id || product.id;
        const img = product.images?.[0] || product.image || "";
        const existing = items.find((i) => i._id === id);

        if (existing) {
          set({
            items: items.map((i) =>
              i._id === id ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                _id: id,
                productId: id,
                title: product.title,
                price: Number(product.price) || 0,
                image: img,
                category: product.category || "",
                quantity: product.quantity || 1,
              },
            ],
          });
        }
        get().recalculateDiscounts();
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
        get().recalculateDiscounts();
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i._id === id ? { ...i, quantity } : i)),
        });
        get().recalculateDiscounts();
      },

      clearCart: () => {
        set({
          items: [],
          appliedDiscounts: [],
          discountTotal: 0,
          isFreeShipping: false,
        });
      },

      clearDiscounts: () => {
        set({
          appliedDiscounts: [],
          discountTotal: 0,
          isFreeShipping: false,
        });
      },

      // ── Discounts & Coupon Management ──────────────
      applyCoupon: async (code, email = "") => {
        const cleanCode = (code || "").trim().toUpperCase();
        if (!cleanCode) {
          return { success: false, message: "Please enter a valid coupon code." };
        }

        const { items, appliedDiscounts, customerEmail } = get();
        const activeEmail = email || customerEmail;
        const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

        if (items.length === 0) {
          return { success: false, message: "Your cart is empty." };
        }

        // Already applied check
        if (appliedDiscounts.some((d) => d.code === cleanCode)) {
          return { success: false, message: `Coupon "${cleanCode}" is already applied.` };
        }

        try {
          const res = await fetch("/api/discounts/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: cleanCode,
              cartItems: items,
              customerEmail: activeEmail,
              subtotal,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.valid) {
            return {
              success: false,
              message: data.message || "Invalid coupon code.",
            };
          }

          const newDiscountItem = {
            code: cleanCode,
            discountAmount: data.discountAmount || 0,
            isFreeShipping: Boolean(data.isFreeShipping),
            discountDetails: data.discountDetails || {},
            isAutomatic: false,
          };

          let nextDiscounts = [];

          // Handle stacking logic:
          const allowStacking = Boolean(data.discountDetails?.allowStacking);
          if (!allowStacking) {
            // Replace all existing manual or automatic discounts
            nextDiscounts = [newDiscountItem];
          } else {
            // Filter out existing non-stackable discounts
            const stackableExisting = appliedDiscounts.filter(
              (d) => d.discountDetails?.allowStacking
            );
            nextDiscounts = [...stackableExisting, newDiscountItem];
          }

          const totalDiscount = nextDiscounts.reduce(
            (sum, d) => sum + (Number(d.discountAmount) || 0),
            0
          );
          const hasFreeShip = nextDiscounts.some((d) => d.isFreeShipping);

          set({
            appliedDiscounts: nextDiscounts,
            discountTotal: Math.min(totalDiscount, subtotal),
            isFreeShipping: hasFreeShip,
          });

          return {
            success: true,
            discount: newDiscountItem,
            message: `Coupon "${cleanCode}" applied successfully!`,
          };
        } catch (err) {
          console.error("Apply coupon error:", err);
          return {
            success: false,
            message: "Unable to apply coupon. Please try again.",
          };
        }
      },

      removeCoupon: (code) => {
        const { appliedDiscounts, items } = get();
        const next = appliedDiscounts.filter((d) => d.code !== code);
        const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
        const totalDiscount = next.reduce((sum, d) => sum + (Number(d.discountAmount) || 0), 0);
        const hasFreeShip = next.some((d) => d.isFreeShipping);

        set({
          appliedDiscounts: next,
          discountTotal: Math.min(totalDiscount, subtotal),
          isFreeShipping: hasFreeShip,
        });

        // Re-check auto-discounts in case an auto promo now applies
        get().recalculateDiscounts();
      },

      recalculateDiscounts: async (customEmail = "") => {
        const { items, appliedDiscounts, customerEmail } = get();
        const activeEmail = customEmail || customerEmail;
        const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

        if (items.length === 0) {
          set({ appliedDiscounts: [], discountTotal: 0, isFreeShipping: false });
          return;
        }

        // Revalidate manual applied discounts
        const updatedDiscounts = [];
        for (const disc of appliedDiscounts.filter((d) => !d.isAutomatic)) {
          try {
            const res = await fetch("/api/discounts/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: disc.code,
                cartItems: items,
                customerEmail: activeEmail,
                subtotal,
              }),
            });
            const data = await res.json();
            if (data.valid) {
              updatedDiscounts.push({
                ...disc,
                discountAmount: data.discountAmount || 0,
                isFreeShipping: Boolean(data.isFreeShipping),
                discountDetails: data.discountDetails || disc.discountDetails,
              });
            }
          } catch {
            // Keep if offline or network hiccup
            updatedDiscounts.push(disc);
          }
        }

        // Check Auto-Discounts if no non-stackable manual discounts are present
        const hasExclusiveManual = updatedDiscounts.some(
          (d) => !d.discountDetails?.allowStacking
        );

        if (!hasExclusiveManual) {
          try {
            const autoRes = await fetch("/api/discounts/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkAutoDiscounts: true,
                cartItems: items,
                customerEmail: activeEmail,
                subtotal,
              }),
            });
            const autoData = await autoRes.json();
            if (autoData.valid && autoData.autoApplied) {
              const autoDiscItem = {
                code: autoData.discountDetails?.code || "AUTO_PROMO",
                discountAmount: autoData.discountAmount || 0,
                isFreeShipping: Boolean(autoData.isFreeShipping),
                discountDetails: autoData.discountDetails,
                isAutomatic: true,
              };

              // If already present, update; otherwise push
              const existingIdx = updatedDiscounts.findIndex((d) => d.isAutomatic);
              if (existingIdx >= 0) {
                updatedDiscounts[existingIdx] = autoDiscItem;
              } else {
                updatedDiscounts.push(autoDiscItem);
              }
            }
          } catch {
            // Ignore auto check errors
          }
        }

        const totalDiscount = updatedDiscounts.reduce(
          (sum, d) => sum + (Number(d.discountAmount) || 0),
          0
        );
        const hasFreeShip = updatedDiscounts.some((d) => d.isFreeShipping);

        set({
          appliedDiscounts: updatedDiscounts,
          discountTotal: Math.min(totalDiscount, subtotal),
          isFreeShipping: hasFreeShip,
        });
      },

      // ── Computed ───────────────────────────────────
      getTotalItems: () => get().items.reduce((s, i) => s + (Number(i.quantity) || 1), 0),
      getTotalPrice: () =>
        get().items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0),
    }),
    {
      name: "greenleaf-cart",
      // Persist cart items and discount state across page refreshes
      partialize: (state) => ({
        items: state.items,
        appliedDiscounts: state.appliedDiscounts,
        discountTotal: state.discountTotal,
        isFreeShipping: state.isFreeShipping,
        customerEmail: state.customerEmail,
      }),
    }
  )
);

export default useCartStore;
