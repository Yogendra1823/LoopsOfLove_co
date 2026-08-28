'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-[#FAF4E8] rounded-3xl border border-[#E8DEC9] flex items-center justify-center text-gray-400 text-sm font-serif">
        No Image Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full bg-[#FAF4E8] rounded-3xl border border-[#E8DEC9] overflow-hidden shadow-sm">
        <Image
          src={images[selectedIndex]?.url || images[0].url}
          alt={images[selectedIndex]?.alt_text || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-square w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx
                  ? 'border-[#C86D51] ring-2 ring-[#C86D51]/20 scale-105'
                  : 'border-[#E8DEC9] hover:border-gray-400'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
