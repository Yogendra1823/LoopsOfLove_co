import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store';
import { sampleProducts } from '@/data/sample-data';
import { isValidIndianPhone, isValidIndianPincode, formatCurrency } from '@/lib/utils';

describe('Loops of Love Store & Utility Tests', () => {
  beforeEach(() => {
    useAppStore.setState({
      cart: [],
      wishlist: [],
      appliedCoupon: null,
      toasts: [],
    });
  });

  it('validates Indian phone numbers correctly', () => {
    expect(isValidIndianPhone('9876543210')).toBe(true);
    expect(isValidIndianPhone('6123456789')).toBe(true);
    expect(isValidIndianPhone('1234567890')).toBe(false);
    expect(isValidIndianPhone('987654321')).toBe(false);
  });

  it('validates 6-digit Indian PIN codes correctly', () => {
    expect(isValidIndianPincode('400001')).toBe(true);
    expect(isValidIndianPincode('110001')).toBe(true);
    expect(isValidIndianPincode('000000')).toBe(false);
    expect(isValidIndianPincode('12345')).toBe(false);
  });

  it('formats INR currency with rupee symbol', () => {
    const formatted = formatCurrency(899);
    expect(formatted).toContain('899');
  });

  it('adds product to cart and updates subtotal', () => {
    const store = useAppStore.getState();
    const testProduct = sampleProducts[0];

    store.addToCart(testProduct, 2);

    const updatedStore = useAppStore.getState();
    expect(updatedStore.cart.length).toBe(1);
    expect(updatedStore.cart[0].quantity).toBe(2);
    expect(updatedStore.getSubtotal()).toBe(testProduct.price * 2);
  });

  it('toggles wishlist item', () => {
    const store = useAppStore.getState();
    const testProductId = sampleProducts[0].id;

    store.toggleWishlist(testProductId);
    expect(useAppStore.getState().isInWishlist(testProductId)).toBe(true);

    store.toggleWishlist(testProductId);
    expect(useAppStore.getState().isInWishlist(testProductId)).toBe(false);
  });
});
