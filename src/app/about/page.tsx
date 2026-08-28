'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, Instagram, Phone } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AboutPage() {
  const { settings } = useAppStore();

  return (
    <div className="py-16 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Our Story
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#1A1A1A]">About Loops of Love</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to Loops of Love (@{settings.instagram_handle}) ? a home studio dedicated to crafting meaningful handmade crochet gifts, everlasting flowers, and adorable plushies in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Handmade Happiness, One Stitch at a Time</h2>
            <p>
              In a world filled with mass-produced plastic objects, Loops of Love was born out of a passion for tactile craftsmanship and thoughtful gifting. Every flower bouquet, keychain, and plushie is handcrafted loop by loop using non-allergenic, soft cotton yarn.
            </p>
            <p>
              Our signature crochet flowers never wilt or require watering ? making them a permanent reminder of your special moments, anniversaries, birthdays, and celebrations.
            </p>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#E8DEC9] shadow">
            <Image
              src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800"
              alt="Artisan crafting crochet bouquet at Loops of Love"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
