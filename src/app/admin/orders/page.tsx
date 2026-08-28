'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/data-service';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Search, RefreshCw, Package, Clock, Truck, CheckCircle2, Copy } from 'lucide-react';

export default function AdminOrdersPage() {
  const { addToast } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Listen to real-time local and cross-tab order creations
    const handleOrderEvent = () => loadOrders();
    window.addEventListener('order-created', handleOrderEvent);
    return () => window.removeEventListener('order-created', handleOrderEvent);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    await updateOrderStatus(orderId, newStatus);
    addToast('success', `Order status updated to "${newStatus}".`);
    loadOrders();
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    addToast('success', `Order ID "${id}" copied!`);
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.shipping_address?.phone?.includes(q) ||
      o.shipping_address?.city?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const receivedCount = orders.filter((o) => o.order_status === 'received').length;
  const craftingCount = orders.filter((o) => o.order_status === 'crafting').length;
  const dispatchedCount = orders.filter((o) => o.order_status === 'dispatched').length;
  const deliveredCount = orders.filter((o) => o.order_status === 'delivered').length;

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Customer Orders Management</h1>
            <p className="text-xs text-gray-500 mt-1">Live artisan queue, payment statuses, and pan-India courier updates</p>
          </div>
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-2xl text-xs font-semibold hover:bg-[#E8DEC9] transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium block">Total Revenue</span>
            <span className="font-serif text-lg font-bold text-[#C86D51]">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium block">1. Received</span>
            <span className="font-serif text-lg font-bold text-amber-700">{receivedCount} orders</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium block">2. Crafting</span>
            <span className="font-serif text-lg font-bold text-indigo-700">{craftingCount} in studio</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm">
            <span className="text-[11px] text-gray-400 font-medium block">3. Dispatched</span>
            <span className="font-serif text-lg font-bold text-blue-700">{dispatchedCount} in transit</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8DEC9] shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[11px] text-gray-400 font-medium block">4. Delivered</span>
            <span className="font-serif text-lg font-bold text-emerald-700">{deliveredCount} delivered</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9] shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 bg-white rounded-3xl border border-[#E8DEC9]">
            Loading active orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-[#E8DEC9] text-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No Orders Found</h3>
            <p className="text-xs text-gray-400">
              {searchQuery ? 'No orders match your search criteria.' : 'No customer orders placed yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4E8] text-gray-700 uppercase font-semibold border-b border-[#E8DEC9]">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer & Address</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Update Lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {filteredOrders.map((o: Order) => (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#1A1A1A]">
                          <span>{o.id}</span>
                          <button
                            onClick={() => copyId(o.id)}
                            className="text-gray-400 hover:text-[#C86D51] p-0.5"
                            title="Copy Order ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{formatDate(o.created_at)}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold block text-[#1A1A1A]">
                          {o.shipping_address?.full_name || o.customer_name}
                        </span>
                        <span className="text-[11px] text-gray-500 block">{o.customer_email}</span>
                        <span className="text-[10px] text-gray-400 block">
                          {o.shipping_address?.city || 'India'}, PIN: {o.shipping_address?.pincode || ''} (Ph: {o.shipping_address?.phone || o.customer_phone})
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5 max-w-xs">
                          {o.items && o.items.length > 0 ? (
                            o.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-gray-700 truncate">
                                <strong>{item.quantity}x</strong> {item.product_name}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500">Handmade Creation</span>
                          )}
                          {o.gift_note && (
                            <div className="text-[10px] text-[#C86D51] bg-[#FAF4E8] p-1 rounded mt-1">
                              Note: &quot;{o.gift_note}&quot;
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-sm text-[#1A1A1A] block">{formatCurrency(o.total_amount)}</span>
                        <span className="text-[10px] text-gray-400">
                          {o.shipping_fee === 0 ? 'Free Shipping' : `Shipping: ${formatCurrency(o.shipping_fee)}`}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                            o.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.payment_method?.toUpperCase()} ({o.payment_status?.toUpperCase()})
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl font-bold text-[11px] capitalize inline-flex items-center gap-1 ${
                            o.order_status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.order_status === 'dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : o.order_status === 'crafting'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as Order['order_status'])}
                          className="px-2.5 py-1.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl text-gray-700 font-semibold focus:outline-none focus:border-[#C86D51] cursor-pointer"
                        >
                          <option value="received">1. Received</option>
                          <option value="crafting">2. Crafting in Studio</option>
                          <option value="dispatched">3. Dispatched in Courier</option>
                          <option value="delivered">4. Delivered to Customer</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
