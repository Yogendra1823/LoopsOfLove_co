'use client';

import React from 'react';
import { Hero } from '@/components/home/Hero';
import { TrustSection } from '@/components/home/TrustSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { StorySection } from '@/components/home/StorySection';
import { InstagramFeed } from '@/components/home/InstagramFeed';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TrustSection />
      <CategoryGrid />
      <FeaturedSection />
      <StorySection />
      <InstagramFeed />
    </div>
  );
}
