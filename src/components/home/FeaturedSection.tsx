'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/data-service';
import { Product } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ArrowRight, Sparkles, Flame, Heart, Package, Zap } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Favorites', icon: Sparkles },
  { id: 'bouquets', label: '🌸 Bouquets & Flowers', icon: Heart },
  { id: 'plushies', label: '🧸 Plushies & Toys', icon: Package },
  { id: 'accessories', label: '🔑 Charms & Keychains', icon: Flame },
  { id: 'ready-to-ship', label: '⚡ Ready to Ship (24h)', icon: Zap },
];

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ready-to-ship') return !p.made_to_order;
    return p.category?.slug === activeTab || p.tags?.includes(activeTab);
  });

  const displayProducts = filteredProducts.slice(0, 8);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-[#FAF4E8] border-y border-[#E8DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Handcrafted with 100% Love
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Most Loved Crochet Creations
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Explore our best-selling handmade yarn gifts, custom knitted bouquets, and charming keepsakes.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C86D51] hover:underline shrink-0"
          >
            Explore All Creations ({products.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-[#E8DEC9]/50 border border-[#E8DEC9]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-[#E8DEC9] animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DEC9] max-w-md mx-auto space-y-3">
            <p className="text-xs text-gray-500">No items found in this filter right now.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs font-semibold text-[#C86D51] underline"
            >
              View All Creations
            </button>
          </div>
        ) : (
          <ProductGrid products={displayProducts} />
        )}
      </div>
    </section>
  );
}
