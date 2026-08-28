'use client';

import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DEC9] space-y-4">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Shipping & Delivery Policy</h1>
        <p className="text-xs text-gray-600 leading-relaxed">
          We ship pan-India. Standard delivery takes 3-7 business days depending on your location. Tracking information is sent via SMS and WhatsApp upon courier dispatch.
        </p>
      </div>
    </div>
  );
}
