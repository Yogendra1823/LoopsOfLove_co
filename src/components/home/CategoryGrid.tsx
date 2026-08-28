'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/data-service';
import { Category } from '@/types';
import { ArrowRight } from 'lucide-react';

// Skeleton card shown while loading
function CategorySkeleton() {
  return (
    <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-[#E8DEC9] bg-[#F4EFE6] animate-pulse" />
  );
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C86D51]">
              Handmade Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C86D51] hover:underline mt-4 md:mt-0"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            // Show 4 skeleton placeholders while loading
            Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
          ) : categories.length === 0 ? (
            // Empty state
            Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-[#E8DEC9] bg-[#FAF4E8] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Image
                  src={
                    cat.image_url ||
                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="font-serif text-lg font-bold group-hover:text-[#DAAF87] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-200 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
