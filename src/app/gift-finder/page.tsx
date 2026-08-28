'use client';

import React, { useState } from 'react';
import { sampleProducts } from '@/data/sample-data';
import { ProductCard } from '@/components/product/ProductCard';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GiftFinderPage() {
  const [recipient, setRecipient] = useState('friend');
  const [occasion, setOccasion] = useState('birthday');
  const [budget, setBudget] = useState('all');
  const [results, setResults] = useState<any[]>(sampleProducts.slice(0, 4));

  const handleFindGifts = () => {
    let matches = sampleProducts.filter((p) => {
      if (budget === 'under-600') return p.price < 600;
      if (budget === '600-1200') return p.price >= 600 && p.price <= 1200;
      if (budget === 'above-1200') return p.price > 1200;
      return true;
    });

    setResults(matches.length > 0 ? matches : sampleProducts.slice(0, 4));
  };

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Recommendation Engine
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Handmade Gift Finder ??</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Tell us who you are gifting for, and our smart recommendation engine will curates the ideal handcrafted crochet treasure.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gifting To:</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
            >
              <option value="partner">Partner / Spouse ??</option>
              <option value="friend">Best Friend ??</option>
              <option value="mother">Mother / Sister ??</option>
              <option value="myself">Self Care Treat ?</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Occasion:</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
            >
              <option value="birthday">Birthday Celebration ??</option>
              <option value="anniversary">Anniversary / Valentine's ??</option>
              <option value="graduation">Graduation / Achievement ??</option>
              <option value="festival">Festival (Diwali/Rakhi/Christmas) ??</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Budget Preference:</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
            >
              <option value="all">Any Budget</option>
              <option value="under-600">Under ?600</option>
              <option value="600-1200">?600 - ?1,200</option>
              <option value="above-1200">Above ?1,200</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-6">Curated Gift Recommendations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
