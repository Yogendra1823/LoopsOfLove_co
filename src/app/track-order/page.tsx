'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Lock,
  ArrowRight,
  Copy,
  Phone,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { getOrderById, getOrdersByCustomerEmail } from '@/lib/data-service';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const { authUser, addToast } = useAppStore();

  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const sessionEmail = sessionStorage.getItem('user_email') || sessionStorage.getItem('admin_email');
    return !!(sessionEmail || authUser?.email);
  });

  const [orderIdInput, setOrderIdInput] = useState(queryId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync auth & load user orders
  useEffect(() => {
    const loadTrackOrders = () => {
      if (typeof window !== 'undefined') {
        const sessionEmail = sessionStorage.getItem('user_email') || sessionStorage.getItem('admin_email');
        const email = authUser?.email || sessionEmail;
        setIsAuthed(!!email);

        if (email) {
          getOrdersByCustomerEmail(email).then((orders) => {
            setUserOrders(orders);
            // If queryId wasn't provided but user has orders, pre-select the most recent one
            if (!queryId && orders.length > 0) {
              setSearchedOrder(orders[0]);
              setOrderIdInput(orders[0].id);
            }
          });
        }
      }
    };

    loadTrackOrders();
    window.addEventListener('order-created', loadTrackOrders);
    window.addEventListener('auth-change', loadTrackOrders);
    return () => {
      window.removeEventListener('order-created', loadTrackOrders);
      window.removeEventListener('auth-change', loadTrackOrders);
    };
  }, [authUser, queryId]);

  const performSearch = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const found = await getOrderById(id.trim());
      if (found) {
        setSearchedOrder(found);
      } else {
        setSearchedOrder(null);
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching order tracking:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderIdInput);
  };

  const handleSelectOrder = (order: Order) => {
    setOrderIdInput(order.id);
    setSearchedOrder(order);
    setError(false);
  };

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    addToast('success', `Order ID "${id}" copied to clipboard!`);
  };

  useEffect(() => {
    if (queryId) {
      performSearch(queryId);
    }
  }, [queryId]);

  // ── Auth gate render ───────────────────────────────────────────────────────
  if (!isAuthed) {
    return (
      <div className="py-20 bg-[#FAF4E8] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white p-10 rounded-3xl border border-[#E8DEC9] shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#C86D51]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Sign In to Track Your Order</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Order tracking and Order IDs are private to customer accounts. Please sign in with your email address to track package progress.
            </p>
            <Link href="/login?redirect=/track-order">
              <Button className="w-full py-3.5 text-sm font-semibold shadow-md">
                Sign In / Register <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </Button>
            </Link>
            <p className="text-[11px] text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/login" className="text-[#C86D51] font-semibold hover:underline">Create one free →</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C86D51]">Live Courier & Artisan Updates</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Track Your Order</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Enter your Order ID (e.g. LOL-ORD-2026-101) or click one of your recent orders below to view real-time crafting and dispatch updates.
          </p>
        </div>

        {/* User Orders Quick Selector */}
        {userOrders.length > 0 && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#C86D51]" /> Your Orders ({userOrders.length}) — Click to Track:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {userOrders.map((ord) => {
                const isSelected = searchedOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#C86D51] bg-[#C86D51]/10 shadow-sm ring-1 ring-[#C86D51]'
                        : 'border-[#E8DEC9] bg-[#FAF4E8]/50 hover:bg-white hover:border-[#C86D51]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#1A1A1A] truncate">{ord.id}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.order_status === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {formatCurrency(ord.total_amount)} • {ord.items?.length || 1} item(s)
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-white p-3 rounded-2xl border border-[#E8DEC9] shadow-sm">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. LOL-ORD-2026-101)"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
          />
          <Button type="submit" isLoading={loading} className="px-6 py-2.5 text-xs font-semibold">
            <Search className="w-4 h-4 mr-1.5 inline" /> Track Order
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Order ID not found in records. Please check the spelling or select an order from your history.</span>
          </div>
        )}

        {/* Live Order Tracking Card */}
        {searchedOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-lg space-y-6 animate-fade-in-up">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DEC9] pb-4 gap-3">
              <div>
                <span className="text-xs text-gray-400 block">Tracking Order</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-lg sm:text-xl text-[#1A1A1A] bg-[#FAF4E8] px-3 py-1 rounded-xl border border-[#E8DEC9]">
                    {searchedOrder.id}
                  </span>
                  <button
                    onClick={() => copyOrderId(searchedOrder.id)}
                    className="p-1.5 text-gray-400 hover:text-[#C86D51] transition-colors"
                    title="Copy Order ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-gray-400 block">Order Placed On</span>
                <span className="text-xs font-semibold text-gray-700">{formatDate(searchedOrder.created_at)}</span>
              </div>
            </div>

            {/* Visual Progress Stepper */}
            <div className="py-4">
              <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mb-6">Artisan Crafting & Delivery Lifecycle</h3>
              
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-medium relative">
                {/* Step 1 */}
                <div className="space-y-2 text-emerald-700">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold block">1. Received</span>
                  <span className="text-[9px] text-gray-400 hidden sm:block">Payment confirmed</span>
                </div>

                {/* Step 2 */}
                <div
                  className={`space-y-2 ${
                    ['crafting', 'dispatched', 'delivered'].includes(searchedOrder.order_status)
                      ? 'text-emerald-700'
                      : 'text-[#C86D51]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center shadow-sm ${
                      ['crafting', 'dispatched', 'delivered'].includes(searchedOrder.order_status)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#C86D51]/10 text-[#C86D51] ring-2 ring-[#C86D51]'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-bold block">2. Crafting</span>
                  <span className="text-[9px] text-gray-400 hidden sm:block">Artisan hand-making</span>
                </div>

                {/* Step 3 */}
                <div
                  className={`space-y-2 ${
                    ['dispatched', 'delivered'].includes(searchedOrder.order_status)
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center shadow-sm ${
                      ['dispatched', 'delivered'].includes(searchedOrder.order_status)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="font-bold block">3. Dispatched</span>
                  <span className="text-[9px] text-gray-400 hidden sm:block">In courier transit</span>
                </div>

                {/* Step 4 */}
                <div
                  className={`space-y-2 ${
                    searchedOrder.order_status === 'delivered' ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center shadow-sm ${
                      searchedOrder.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="font-bold block">4. Delivered</span>
                  <span className="text-[9px] text-gray-400 hidden sm:block">Package at doorstep</span>
                </div>
              </div>
            </div>

            {/* Current Status Highlight Box */}
            <div className="p-4 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C86D51]" />
                <div>
                  <span className="text-gray-500">Current Status: </span>
                  <strong className="text-[#1A1A1A] capitalize font-bold">{searchedOrder.order_status}</strong>
                </div>
              </div>

              <div className="text-gray-500">
                Payment: <strong className="text-emerald-700 uppercase">{searchedOrder.payment_method} ({searchedOrder.payment_status})</strong>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                Items in This Package
              </h4>
              <div className="divide-y divide-[#F4EFE6] bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                {searchedOrder.items && searchedOrder.items.length > 0 ? (
                  searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#1A1A1A]">{item.product_name}</span>
                        <span className="text-gray-400 ml-2">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-1">Handmade Crochet Creation</div>
                )}
              </div>
            </div>

            {/* Shipping & Delivery Address */}
            <div className="border-t border-[#E8DEC9] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C86D51]" /> Delivery Address
                </span>
                <p className="font-semibold text-[#1A1A1A]">{searchedOrder.shipping_address?.full_name || searchedOrder.customer_name}</p>
                <p className="text-gray-600">{searchedOrder.shipping_address?.address_line1}</p>
                <p className="text-gray-600">
                  {searchedOrder.shipping_address?.city}, {searchedOrder.shipping_address?.state} - {searchedOrder.shipping_address?.pincode}
                </p>
                <p className="text-gray-500 mt-1">Phone: {searchedOrder.shipping_address?.phone || searchedOrder.customer_phone}</p>
              </div>

              <div className="space-y-2 bg-[#FAF4E8]/50 p-4 rounded-2xl border border-[#E8DEC9]/60">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(searchedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="font-semibold">{searchedOrder.shipping_fee === 0 ? 'FREE' : formatCurrency(searchedOrder.shipping_fee)}</span>
                </div>
                <div className="flex justify-between border-t border-[#E8DEC9] pt-2 font-bold text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#C86D51]">{formatCurrency(searchedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Need Help WhatsApp Support */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#F4EFE6]">
              <span className="text-xs text-gray-500">Questions about your order or custom colors?</span>
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Loops of Love! I would like an update on my Order #${searchedOrder.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-serif text-sm text-gray-500">Loading order tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
