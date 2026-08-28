'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  DollarSign,
  Sparkles,
  Tag,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getOrders, getProducts, getCustomOrders, updateOrderStatus } from '@/lib/data-service';
import { Order, Product, CustomOrder } from '@/types';
import { useAppStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const { addToast } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [o, p, co] = await Promise.all([getOrders(), getProducts(), getCustomOrders()]);
      setOrders(o);
      setProducts(p);
      setCustomOrders(co);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    window.addEventListener('order-created', loadDashboardData);
    return () => window.removeEventListener('order-created', loadDashboardData);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    await updateOrderStatus(orderId, newStatus);
    addToast('success', `Order status updated to "${newStatus}".`);
    loadDashboardData();
  };

  const totalRevenue = orders.reduce(
    (sum: number, o: Order) => sum + (o.payment_status === 'paid' ? o.total_amount : 0),
    0
  );

  const pendingOrders = orders.filter(
    (o) => o.order_status === 'received' || o.order_status === 'confirmed' || o.order_status === 'crafting'
  ).length;

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#C86D51] uppercase tracking-wider">Studio Control Center</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-0.5">Studio Overview</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time performance analytics, order fulfillment, and inventory</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-xl hover:bg-[#B0583E] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" /> Manage Orders
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-400 font-medium block">Total Paid Revenue</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] block">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Processed via Razorpay</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-400 font-medium block">Customer Orders</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] block">{orders.length}</span>
            <span className="text-[10px] text-amber-600 font-semibold">{pendingOrders} pending fulfillment</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-400 font-medium block">Catalog Products</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] block">{products.length}</span>
            <span className="text-[10px] text-gray-500 font-semibold">Active crochet creations</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-400 font-medium block">Custom Inquiries</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] block">{customOrders.length}</span>
            <span className="text-[10px] text-purple-600 font-semibold">Made-to-order leads</span>
          </div>
        </div>

        {/* Quick Management Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/orders"
            className="p-5 bg-white rounded-2xl border border-[#E8DEC9] hover:border-[#C86D51] hover:shadow-md transition-all block text-center shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] text-[#C86D51] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-serif text-sm font-bold text-[#1A1A1A] block">Orders & Shipping</span>
            <span className="text-[10px] text-gray-400">Dispatch & update status</span>
          </Link>

          <Link
            href="/admin/products"
            className="p-5 bg-white rounded-2xl border border-[#E8DEC9] hover:border-[#C86D51] hover:shadow-md transition-all block text-center shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] text-[#C86D51] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-serif text-sm font-bold text-[#1A1A1A] block">Products & Stock</span>
            <span className="text-[10px] text-gray-400">Inventory & pricing</span>
          </Link>

          <Link
            href="/admin/custom-orders"
            className="p-5 bg-white rounded-2xl border border-[#E8DEC9] hover:border-[#C86D51] hover:shadow-md transition-all block text-center shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] text-[#C86D51] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif text-sm font-bold text-[#1A1A1A] block">Custom Pieces</span>
            <span className="text-[10px] text-gray-400">WhatsApp direct replies</span>
          </Link>

          <Link
            href="/admin/coupons"
            className="p-5 bg-white rounded-2xl border border-[#E8DEC9] hover:border-[#C86D51] hover:shadow-md transition-all block text-center shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] text-[#C86D51] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <span className="font-serif text-sm font-bold text-[#1A1A1A] block">Discount Coupons</span>
            <span className="text-[10px] text-gray-400">Promo codes & offers</span>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">Recent Customer Orders</h2>
              <p className="text-xs text-gray-500">Live order status and packaging progress</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#C86D51] hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">No orders received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4E8] text-gray-700 uppercase font-semibold border-b border-[#E8DEC9]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {orders.slice(0, 5).map((o: Order) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-[#1A1A1A]">{o.id}</td>
                      <td className="p-3 font-semibold text-[#1A1A1A]">
                        {o.shipping_address?.full_name || o.customer_name}
                      </td>
                      <td className="p-3 font-bold text-[#1A1A1A]">{formatCurrency(o.total_amount)}</td>
                      <td className="p-3 uppercase text-[11px] font-semibold text-gray-600">
                        {o.payment_method} ({o.payment_status})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            o.order_status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.order_status === 'dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as Order['order_status'])}
                          className="px-2 py-1 bg-[#FAF4E8] border border-[#E8DEC9] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#C86D51]"
                        >
                          <option value="received">Received</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="crafting">Crafting</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
