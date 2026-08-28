'use client';

import React from 'react';
import { Heart, ShieldCheck, Truck, Sparkles, MessageCircle } from 'lucide-react';

const trustItems = [
  {
    icon: Heart,
    title: '100% Handcrafted',
    desc: 'Each piece is individually crocheted by skilled Indian artisans with love and care.',
  },
  {
    icon: Sparkles,
    title: 'Everlasting Quality',
    desc: 'Premium soft cotton yarn that remains vibrant and soft for years to come.',
  },
  {
    icon: Truck,
    title: 'Pan-India Safe Delivery',
    desc: 'Carefully bubble-wrapped in eco-conscious packaging for flawless arrival.',
  },
  {
    icon: MessageCircle,
    title: 'Custom Personalization',
    desc: 'Add custom colors, names, and personal gift notes for your loved ones.',
  },
];

export function TrustSection() {
  return (
    <section className="py-12 bg-[#FAF4E8] border-b border-[#E8DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#C86D51]/10 flex items-center justify-center text-[#C86D51]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
