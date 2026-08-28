'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function StorySection() {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#E8DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square max-w-md mx-auto lg:max-w-none w-full rounded-3xl overflow-hidden border-4 border-[#FAF4E8] shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=1000"
              alt="Crafting handmade crochet creations at Loops of Love"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A8B7B]/10 text-[#7A8B7B] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Our Story & Heritage
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Crafted by Hand, Given with <span className="text-[#C86D51]">Love</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Loops of Love started as a passion project on Instagram (<strong>@loopsoflove_co</strong>), creating handcrafted crochet flower bouquets and cute plushies for friends and family. Every single loop of yarn is woven with patience, precision, and heartfelt emotion.
            </p>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Unlike mass-manufactured plastic gifts that end up discarded, our handmade crochet flowers never wilt or fade. They serve as timeless keepsakes celebrating birthdays, anniversaries, graduations, festivals, and quiet everyday gestures of affection.
            </p>

            <div className="pt-2">
              <Link href="/about">
                <Button variant="outline" className="px-6 py-3 text-sm">
                  Read Our Full Story <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
