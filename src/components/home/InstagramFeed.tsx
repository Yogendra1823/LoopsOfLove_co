'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const instaPosts = [
  'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
];

export function InstagramFeed() {
  const { settings } = useAppStore();

  return (
    <section className="py-16 bg-[#FAF4E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C86D51] uppercase tracking-wider mb-2">
          <Instagram className="w-4 h-4" /> Follow Our Journey
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-3">Join Us on Instagram</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8">
          Follow <strong className="text-[#1A1A1A]">@{settings.instagram_handle}</strong> for daily behind-the-scenes crafting reels, customer unboxings, and fresh custom designs.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {instaPosts.map((url, idx) => (
            <a
              key={idx}
              href={`https://instagram.com/${settings.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden border border-[#E8DEC9] bg-white shadow-sm"
            >
              <Image
                src={url}
                alt={`Loops of Love Handmade Crochet Craft ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-8 h-8" />
              </div>
            </a>
          ))}
        </div>

        <a
          href={`https://instagram.com/${settings.instagram_handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C86D51] text-white text-xs font-semibold rounded-full shadow transition-colors"
        >
          <Instagram className="w-4 h-4" /> Follow @{settings.instagram_handle}
        </a>
      </div>
    </section>
  );
}
