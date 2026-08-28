'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Sparkles, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getShippingFee,
    getTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    authUser,
  } = useAppStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF4E8] shadow-2xl border-l border-[#E8DEC9] flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-[#E8DEC9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C86D51]" />
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Your Shopping Cart</h2>
              <span className="text-xs bg-[#F4EFE6] px-2 py-0.5 rounded-full font-semibold text-[#C86D51]">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Free Shipping Progress Ticker */}
          <div className="px-5 py-3 bg-[#FAF4E8] border-b border-[#E8DEC9] text-xs">
            <div className="flex items-center justify-between font-semibold text-[#1A1A1A] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C86D51]" />
                {remainingForFreeShipping > 0 ? (
                  <>Add <strong className="text-[#C86D51]">{formatCurrency(remainingForFreeShipping)}</strong> for Free Delivery</>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> FREE Pan-India Courier Shipping Unlocked!
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E8DEC9] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C86D51] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-[#C86D51]/10 rounded-full flex items-center justify-center mx-auto text-[#C86D51]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg font-bold text-[#1A1A1A]">Your Cart is Empty</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Add handcrafted crochet flower bouquets, car charms, or cute plushies to get started.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setCartOpen(false)}
                  className="inline-block mt-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-2xl shadow hover:bg-[#C86D51] transition-colors"
                >
                  Explore Studio Catalog
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const itemImage =
                  item.product.images.find((img) => img.is_primary)?.url || item.product.images[0]?.url || '';
                const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;

                return (
                  <div
                    key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`}
                    className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm relative group transition-all hover:border-[#C86D51]/40"
                  >
                    <div className="relative aspect-square w-20 h-20 rounded-xl overflow-hidden bg-[#FAF4E8] shrink-0 border border-[#E8DEC9]">
                      <Image src={itemImage} alt={item.product.name} fill className="object-cover object-center" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-[11px] text-[#C86D51] font-semibold">{item.selectedVariant.name}</p>
                        )}
                        <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                          {formatCurrency(itemPrice)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#E8DEC9] rounded-lg overflow-hidden bg-[#FAF4E8]">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity - 1)
                            }
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-0.5 text-xs font-bold text-[#1A1A1A]">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity + 1)
                            }
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Total */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-[#E8DEC9] space-y-3.5 shadow-lg">
              {/* Quick Coupon in Drawer */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. LOVE10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#C86D51] transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span><strong>{appliedCoupon.code}</strong> applied!</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-600 font-semibold hover:underline text-[11px]">
                    Remove
                  </button>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : formatCurrency(appliedCoupon.discount_value)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pan-India Courier Shipping</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1A1A1A] pt-2 border-t border-[#F4EFE6]">
                  <span>Total Amount</span>
                  <span className="text-[#C86D51]">{formatCurrency(total)}</span>
                </div>
              </div>

              <Link
                href={authUser?.email ? '/checkout' : '/login?redirect=/checkout'}
                onClick={() => setCartOpen(false)}
                className="block w-full py-3.5 bg-[#C86D51] hover:bg-[#B0583E] text-white font-semibold text-center text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {authUser?.email ? 'Proceed to Secure Checkout' : 'Sign In & Checkout'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
