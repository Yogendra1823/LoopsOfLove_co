'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useAppStore();
  const isSaved = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage = product.images.find((img) => img.is_primary)?.url || product.images[0]?.url || '';
  const secondaryImage = product.images.length > 1 ? product.images[1].url : primaryImage;

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const handleQuickAdd = () => {
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="group relative bg-white rounded-3xl border border-[#E8DEC9] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square w-full bg-[#FAF4E8] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.made_to_order ? (
            <Badge variant="sage">Made to Order ({product.crafting_days || 3}d)</Badge>
          ) : (
            <Badge variant="rose">⚡ Ready in 24h</Badge>
          )}
          {hasDiscount && <Badge variant="charcoal">-{discountPercent}% OFF</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
            isSaved
              ? 'bg-rose-50 text-rose-600 shadow'
              : 'bg-white/80 text-gray-700 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-md hover:bg-white text-[#1A1A1A] font-semibold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 transition-colors border border-[#E8DEC9]"
          >
            <Eye className="w-3.5 h-3.5 text-[#C86D51]" /> Quick View
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-gray-700">{product.rating || 5.0}</span>
            <span className="text-[10px] text-gray-400">({product.review_count || 12})</span>
            {product.variants && product.variants.length > 0 && (
              <span className="text-[10px] text-[#C86D51] font-medium ml-auto">
                {product.variants.length} styles
              </span>
            )}
          </div>

          <Link href={`/products/${product.slug}`} className="block group-hover:text-[#C86D51] transition-colors">
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1A1A] line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.short_description || product.description}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F4EFE6]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm sm:text-base text-[#1A1A1A]">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compare_at_price!)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-2xl transition-all shadow-sm flex items-center gap-1 text-xs font-semibold ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#C86D51] hover:bg-[#B0583E] text-white hover:scale-105 active:scale-95'
            }`}
            title="Add to Cart"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
