'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Copy, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getOrderById } from '@/lib/data-service';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { addToast } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      if (orderId) {
        const found = await getOrderById(orderId);
        if (found) setOrder(found);
      }
    }
    load();
  }, [orderId]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    addToast('success', `Order ID "${orderId}" copied to clipboard!`);
  };

  return (
    <div className="py-16 bg-[#FAF4E8] min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 w-full">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DEC9] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#C86D51]">Order Placed Successfully</span>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">Thank You for Your Order! ❤️</h1>
            <p className="text-xs text-gray-500 mt-2">
              Your handmade crochet creations are now registered with our artisan studio.
            </p>
          </div>

          {/* Prominent Order ID Card */}
          <div className="p-4 sm:p-5 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Your Unique Order ID:</span>
              <button
                onClick={copyOrderId}
                className="text-xs text-[#C86D51] font-semibold hover:underline flex items-center gap-1"
                title="Copy Order ID"
              >
                <Copy className="w-3.5 h-3.5" /> Copy ID
              </button>
            </div>

            <div className="font-mono font-bold text-base sm:text-lg text-[#1A1A1A] bg-white px-3.5 py-2 rounded-xl border border-[#E8DEC9] flex items-center justify-between">
              <span>{orderId}</span>
              <span className="text-[10px] uppercase font-sans font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {order?.payment_status === 'pending' ? 'COD Pending' : 'Paid'}
              </span>
            </div>

            <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-[#E8DEC9]/60">
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span className="font-semibold text-[#1A1A1A]">{order?.shipping_address?.full_name || order?.customer_name || 'Customer'}</span>
              </div>
              {order && (
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold text-[#C86D51]">{formatCurrency(order.total_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-medium text-[#1A1A1A]">{order?.shipping_address?.city || 'India'} (PIN: {order?.shipping_address?.pincode || '400001'})</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/track-order?id=${encodeURIComponent(orderId)}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto text-xs py-3.5 px-6 shadow-md flex items-center justify-center gap-2">
                <Package className="w-4 h-4" /> Track Order Status Live
              </Button>
            </Link>

            <Link href="/account" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-xs py-3.5 px-6 flex items-center justify-center gap-2">
                View in My Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-gray-400">
            You can always track your package anytime from the <Link href="/track-order" className="text-[#C86D51] font-semibold underline">Track Order</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
}
