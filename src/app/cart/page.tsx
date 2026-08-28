'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Tag } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getSubtotal, getShippingFee, getTotal, appliedCoupon, applyCoupon, removeCoupon } =
    useAppStore();

  const [couponCode, setCouponCode] = useState('');

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 bg-[#FAF4E8] min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4 bg-white p-10 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2">Your Cart is Empty</h1>
          <p className="text-xs text-gray-500 mb-6">
            You haven't added any handmade crochet gifts to your cart yet.
          </p>
          <Link href="/shop">
            <Button className="px-8 py-3 text-sm">Explore Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-8">Shopping Cart ({cart.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemImage = item.product.images.find((img) => img.is_primary)?.url || item.product.images[0]?.url || '';
              const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;

              return (
                <div
                  key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`}
                  className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DEC9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative aspect-square w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF4E8] shrink-0 border border-[#E8DEC9]">
                      <Image src={itemImage} alt={item.product.name} fill className="object-cover object-center" />
                    </div>
                    <div>
                      <Link href={`/products/${item.product.slug}`} className="font-serif font-bold text-base text-[#1A1A1A] hover:text-[#C86D51]">
                        {item.product.name}
                      </Link>
                      {item.selectedVariant && (
                        <p className="text-xs text-[#C86D51] font-semibold">{item.selectedVariant.name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(itemPrice)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F4EFE6]">
                    <div className="flex items-center border border-[#E8DEC9] rounded-xl overflow-hidden bg-[#FAF4E8]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-sm font-semibold text-[#1A1A1A]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-base text-[#1A1A1A]">
                      {formatCurrency(itemPrice * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                      className="text-gray-400 hover:text-rose-600 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-[#C86D51] hover:underline">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm h-fit space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#E8DEC9] pb-4">Order Summary</h3>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code (e.g. LOVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
              <button type="submit" className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#C86D51] transition-colors">
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                </div>
                <button onClick={removeCoupon} className="text-rose-600 hover:underline font-semibold">Remove</button>
              </div>
            )}

            <div className="space-y-3 text-xs text-gray-600 pt-2">
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
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A1A1A] pt-4 border-t border-[#E8DEC9]">
                <span>Total Amount</span>
                <span className="text-[#C86D51]">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full py-3.5 text-sm flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
