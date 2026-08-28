'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Star } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);

  if (!quickViewProduct) return null;

  const isSaved = isInWishlist(quickViewProduct.id);
  const selectedVariant = quickViewProduct.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : quickViewProduct.price;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedVariant);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8DEC9] overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-700 bg-white/80 rounded-full backdrop-blur-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-1/2 p-6 bg-[#FAF4E8] flex items-center justify-center">
          <ProductGallery images={quickViewProduct.images} productName={quickViewProduct.name} />
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {quickViewProduct.made_to_order ? (
                <Badge variant="sage">Made to Order (Crafting: {quickViewProduct.crafting_days} Days)</Badge>
              ) : (
                <Badge variant="rose">Ready to Ship</Badge>
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2">{quickViewProduct.name}</h2>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{quickViewProduct.rating}</span>
              <span className="text-xs text-gray-400">({quickViewProduct.review_count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#1A1A1A]">{formatCurrency(currentPrice)}</span>
              {quickViewProduct.compare_at_price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(quickViewProduct.compare_at_price)}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {quickViewProduct.description}
            </p>

            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Style / Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        selectedVariantId === variant.id
                          ? 'border-[#C86D51] bg-[#C86D51]/10 text-[#C86D51] font-semibold'
                          : 'border-[#E8DEC9] text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {variant.name} (+{formatCurrency(variant.price - quickViewProduct.price)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty:</label>
              <div className="flex items-center border border-[#E8DEC9] rounded-xl overflow-hidden bg-[#FAF4E8]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="px-4 py-1 font-medium text-sm text-[#1A1A1A]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-200">
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#F4EFE6]">
            <div className="flex items-center gap-3">
              <Button onClick={handleAddToCart} className="flex-1 py-3 text-sm flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </Button>
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-3 rounded-2xl border transition-colors ${
                  isSaved ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-[#E8DEC9] text-gray-700 hover:bg-gray-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              href={`/products/${quickViewProduct.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="block text-center text-xs font-semibold text-[#C86D51] hover:underline"
            >
              View Full Product Details & Customer Reviews →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
