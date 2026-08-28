'use client';

import React from 'react';

const faqs = [
  {
    q: 'How long does it take to dispatch my order?',
    a: 'Ready to Ship items are dispatched within 24-48 hours. Made to Order items typically take 3-5 crafting days before courier dispatch.',
  },
  {
    q: 'Do you deliver across India?',
    a: 'Yes! We ship to 28,000+ PIN codes across India via premium courier partners like BlueDart, Delhivery, and DTDC.',
  },
  {
    q: 'Can I request custom flower colors or designs?',
    a: 'Absolutely! Visit our Custom Order page or send us a DM on Instagram @loopsoflove_co with your color preferences.',
  },
  {
    q: 'How do I care for my crochet flowers and plushies?',
    a: 'Crochet flowers can be gently dusted using a soft brush or hair dryer on cool setting. Spot clean with mild soap if needed.',
  },
];

export default function FAQPage() {
  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] text-center mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-[#E8DEC9] shadow-sm space-y-2">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{faq.q}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
