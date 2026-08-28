'use client';

import React, { useState, useEffect } from 'react';
import { getCustomOrders } from '@/lib/data-service';
import { CustomOrder } from '@/types';
import { Phone, RefreshCw } from 'lucide-react';

export default function AdminCustomOrdersPage() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCustomOrders();
      setCustomOrders(data);
    } catch (err) {
      console.error('Failed to load custom orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener('custom-order-created', loadData);
    return () => window.removeEventListener('custom-order-created', loadData);
  }, []);

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Custom Order Requests</h1>
            <p className="text-xs text-gray-500">Inquiries submitted via the Made-to-Order Custom Portal</p>
          </div>
          <button onClick={loadData} className="px-3 py-1.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl text-xs font-semibold hover:bg-[#E8DEC9] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Requests
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading custom requests...</div>
        ) : customOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E8DEC9] text-center text-gray-500 text-sm">
            No custom order requests submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {customOrders.map((co: CustomOrder) => (
              <div key={co.id} className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{co.customer_name}</h3>
                    <span className="text-xs text-gray-400">Budget: ₹{co.target_budget || 1000} | Submitted: {new Date(co.created_at).toLocaleDateString()}</span>
                  </div>
                  {co.customer_phone && (
                    <a
                      href={`https://wa.me/${co.customer_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#20ba5a]"
                    >
                      <Phone className="w-3.5 h-3.5" /> WhatsApp Customer
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{co.idea_description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
