'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = 'No handmade treasures found in this category.' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8DEC9]">
        <p className="font-serif text-lg text-gray-600 mb-2">{emptyMessage}</p>
        <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
