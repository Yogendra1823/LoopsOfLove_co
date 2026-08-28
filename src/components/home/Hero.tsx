'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Star, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000';

const stats = [
  { value: '100%', label: 'Handcrafted Yarn' },
  { value: '500+', label: 'Happy Customers' },
  { value: 'Pan-India', label: 'Fast Delivery' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF4E8] via-white to-[#FAF4E8] py-16 lg:py-24 border-b border-[#E8DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column ── */}
          <div className="space-y-6 text-center lg:text-left animate-fade-in-up">
            {/* Live Studio Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-emerald-800 text-xs font-semibold tracking-wide border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold">Studio Active</span>
              <span className="text-gray-400">• Accepting Custom Orders Pan-India</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-[1.12] tracking-tight">
              Artisanal Crochet Gifts That{' '}
              <span className="text-[#C86D51] underline decoration-[#DAAF87] decoration-wavy underline-offset-4">
                Last Forever
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore forever-blooming crochet flower bouquets, cuddly amigurumi plushies, aesthetic car mirror charms, and personalized keepsake gifts — hand-stitched with love in India.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform">
                  Shop Handcrafted Catalog <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/custom-order" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white"
                >
                  <Heart className="w-4 h-4 text-[#C86D51]" /> Request Custom Piece
                </Button>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-[#E8DEC9]/70">
              {stats.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                    {s.value}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#FAF4E8]">
              <Image
                src={HERO_IMAGE}
                alt="Loops of Love handcrafted crochet bag – artisanal crochet creations"
                fill
                priority
                className="object-cover object-center hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating badge card */}
            <div className="absolute -bottom-5 left-2 sm:-bottom-6 sm:-left-4 bg-white px-4 py-3 rounded-2xl shadow-xl border border-[#E8DEC9] flex items-center gap-3 z-10 animate-fade-in-up">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="block font-serif text-sm font-bold text-[#1A1A1A]">
                  ⭐ 5.0 · Top Crochet Studio
                </span>
                <span className="text-[11px] text-gray-500">500+ satisfied customers across India</span>
              </div>
            </div>

            {/* Small trust badge top-right */}
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#C86D51] p-3 rounded-2xl shadow-lg flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
