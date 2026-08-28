'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, CartItem, Coupon, SiteSettings } from '@/types';
import { SAMPLE_COUPONS, SAMPLE_SITE_SETTINGS } from '@/data/sample-data';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AuthUser {
  email: string | null;
  name: string | null;
  isAdmin: boolean;
}

interface AppState {
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  settings: SiteSettings;
  toasts: ToastMessage[];
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  authUser: AuthUser | null;

  // Actions
  setAuthUser: (user: AuthUser | null) => void;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  clearSession: () => void;  // clears cart + wishlist + auth on sign-out
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setCartOpen: (isOpen: boolean) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      appliedCoupon: null,
      settings: SAMPLE_SITE_SETTINGS,
      toasts: [],
      quickViewProduct: null,
      isCartOpen: false,
      isMobileMenuOpen: false,
      authUser: null,

      setAuthUser: (user) => set({ authUser: user }),

      addToCart: (product, quantity = 1, variant) => {
        // Enforce user must be logged in to add to cart
        const currentAuth = get().authUser;
        const localEmail = typeof window !== 'undefined' ? (localStorage.getItem('user_email') || localStorage.getItem('admin_email')) : null;
        
        if (!currentAuth?.email && !localEmail) {
          get().addToast('error', 'Please sign in to add items to your cart.');
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
          return;
        }

        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id && item.selectedVariant?.id === variant?.id
          );

          let updatedCart = [...state.cart];

          if (existingIndex > -1) {
            updatedCart[existingIndex].quantity += quantity;
          } else {
            updatedCart.push({
              id: `${product.id}-${variant?.id || 'default'}`,
              product,
              selectedVariant: variant,
              quantity,
            });
          }

          return { cart: updatedCart, isCartOpen: true };
        });

        get().addToast('success', `Added "${product.name}" to cart!`);
      },

      removeFromCart: (productId, variantId) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.product.id === productId && item.selectedVariant?.id === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, variantId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.product.id === productId && item.selectedVariant?.id === variantId) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      clearSession: () => {
        // Wipe in-memory state
        set({ cart: [], wishlist: [], appliedCoupon: null, authUser: null });
        // Also nuke the persisted localStorage entry so badges are 0 after reload
        if (typeof window !== 'undefined') {
          localStorage.removeItem('loops-of-love-storage');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_name');
          localStorage.removeItem('admin_email');
          localStorage.removeItem('admin_authenticated');
          document.cookie = 'admin_session=; path=/; max-age=0';
        }
      },

      toggleWishlist: (productId) => {
        // Enforce user must be logged in to wishlist items
        const currentAuth = get().authUser;
        const localEmail = typeof window !== 'undefined' ? (localStorage.getItem('user_email') || localStorage.getItem('admin_email')) : null;
        
        if (!currentAuth?.email && !localEmail) {
          get().addToast('error', 'Please sign in to save items to your wishlist.');
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
          return;
        }

        const isSaved = get().wishlist.includes(productId);
        set((state) => ({
          wishlist: isSaved
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        }));

        get().addToast('info', isSaved ? 'Removed from wishlist' : 'Saved to wishlist!');
      },

      isInWishlist: (productId) => get().wishlist.includes(productId),

      applyCoupon: (code) => {
        const coupon = SAMPLE_COUPONS.find(
          (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
        );

        if (!coupon) {
          get().addToast('error', 'Invalid or expired coupon code');
          return false;
        }

        const subtotal = get().getSubtotal();
        if (subtotal < coupon.min_order_amount) {
          get().addToast(
            'error',
            `Coupon code requires a minimum order of ?${coupon.min_order_amount}`
          );
          return false;
        }

        set({ appliedCoupon: coupon });
        get().addToast('success', `Coupon "${coupon.code}" applied successfully!`);
        return true;
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      getSubtotal: () => {
        return get().cart.reduce((sum, item) => {
          const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
          return sum + price * item.quantity;
        }, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        const settings = get().settings;
        if (subtotal === 0) return 0;
        if (subtotal >= settings.free_shipping_threshold) return 0;
        return settings.flat_shipping_fee;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const coupon = get().appliedCoupon;

        let discount = 0;
        if (coupon) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
          } else {
            discount = coupon.discount_value;
          }
        }

        return Math.max(0, subtotal - discount + shipping);
      },

      addToast: (type, message) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));

        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      setQuickViewProduct: (product) => set({ quickViewProduct: product }),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    }),
    {
      name: 'loops-of-love-storage',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, authUser: state.authUser }),
    }
  )
);
