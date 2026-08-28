'use client';

import React, { useState, useEffect } from 'react';
import { getCoupons, saveCoupon, deleteCoupon } from '@/lib/data-service';
import { Coupon } from '@/types';
import { Tag, Plus, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function AdminCouponsPage() {
  const { addToast } = useAppStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 499,
    is_active: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code?.trim()) {
      addToast('error', 'Please enter a valid coupon code.');
      return;
    }

    try {
      await saveCoupon(newCoupon);
      addToast('success', `Coupon "${newCoupon.code.toUpperCase()}" created successfully!`);
      setIsModalOpen(false);
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 499,
        is_active: true,
      });
      loadCoupons();
    } catch (err) {
      addToast('error', 'Failed to create coupon.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Delete coupon "${code}"?`)) {
      await deleteCoupon(id);
      addToast('info', `Coupon "${code}" deleted.`);
      loadCoupons();
    }
  };

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Discount Coupons</h1>
            <p className="text-xs text-gray-500">Manage promotional codes, percentage discounts, and minimum order values</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#B0583E] transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E8DEC9] text-center space-y-3">
            <Tag className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-serif text-base text-gray-700 font-semibold">No active discount coupons</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C86D51] text-white text-xs font-semibold rounded-xl"
            >
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-[#C86D51] tracking-wider">{c.code}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                      c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% Discount` : `₹${c.discount_value} Flat Discount`}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Min. Order: ₹{c.min_order_amount} {c.max_discount_amount ? `| Max: ₹${c.max_discount_amount}` : ''}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Used: {c.used_count || 0} times</span>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Coupon Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">Create New Coupon</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CROCHET10, FESTIVE20"
                    value={newCoupon.code || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 uppercase font-mono font-bold bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                    <select
                      value={newCoupon.discount_type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Value ({newCoupon.discount_type === 'percentage' ? '%' : '₹'}) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newCoupon.discount_value || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCoupon.min_order_amount ?? 0}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 py-2.5 text-xs font-semibold">
                    Save Coupon
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
