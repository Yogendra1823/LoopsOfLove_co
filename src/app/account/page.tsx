'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getProducts, getOrdersByCustomerEmail } from '@/lib/data-service';
import { Product, Order } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User,
  Heart,
  Package,
  LogOut,
  ShieldCheck,
  Lock,
  ArrowRight,
  Copy,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/supabase';

export default function AccountPage() {
  const router = useRouter();
  const { wishlist, addToast, authUser, clearSession } = useAppStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'orders'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Load products for wishlist
    getProducts().then((data) => setProducts(data));

    const loadCustomerOrders = () => {
      const email = authUser?.email || (typeof window !== 'undefined' ? (sessionStorage.getItem('user_email') || sessionStorage.getItem('admin_email')) : '');
      if (email) {
        setLoadingOrders(true);
        getOrdersByCustomerEmail(email)
          .then((orders) => {
            setCustomerOrders(orders);
          })
          .finally(() => setLoadingOrders(false));
      }
    };

    loadCustomerOrders();

    window.addEventListener('order-created', loadCustomerOrders);
    window.addEventListener('auth-change', loadCustomerOrders);
    return () => {
      window.removeEventListener('order-created', loadCustomerOrders);
      window.removeEventListener('auth-change', loadCustomerOrders);
    };
  }, [authUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }
    clearSession();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_name');
      sessionStorage.removeItem('admin_authenticated');
      sessionStorage.removeItem('admin_email');
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      document.cookie = 'admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.dispatchEvent(new Event('auth-change'));
    }
    addToast('info', 'You have been signed out.');
    router.push('/');
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    addToast('success', `Order ID "${orderId}" copied to clipboard!`);
  };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // If user is not logged in, show welcome / login gateway
  if (!authUser?.email) {
    return (
      <div className="py-16 bg-[#FAF4E8] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DEC9] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-[#C86D51]/10 text-[#C86D51] rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">My Account & Orders</h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Sign in to view your real-time Order IDs, track active package progress, or manage your saved wishlist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-xs py-3 px-8 shadow-md">
                  Sign In to View Orders <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Profile Sidebar */}
          <div className="w-full md:w-64 bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm h-fit space-y-4">
            <div className="text-center pb-4 border-b border-[#E8DEC9]">
              <div className="w-16 h-16 bg-[#C86D51]/10 text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2 font-serif text-2xl font-bold">
                {authUser.name ? authUser.name.charAt(0).toUpperCase() : authUser.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{authUser.name || 'Customer'}</h3>
              <p className="text-xs text-gray-400 truncate">{authUser.email}</p>

              {authUser.isAdmin && (
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-[#FAF4E8] text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-[#C86D51]" /> Studio Admin
                </div>
              )}
            </div>

            {authUser.isAdmin && (
              <Link
                href="/admin"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A1A1A] text-white rounded-2xl text-xs font-semibold hover:bg-[#C86D51] transition-colors shadow"
              >
                <Lock className="w-3.5 h-3.5" /> Open Admin Dashboard
              </Link>
            )}

            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                  activeTab === 'orders' ? 'bg-[#C86D51] text-white' : 'text-gray-700 hover:bg-[#FAF4E8]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" /> My Orders & Tracking
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {customerOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                  activeTab === 'wishlist' ? 'bg-[#C86D51] text-white' : 'text-gray-700 hover:bg-[#FAF4E8]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" /> Saved Wishlist
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {wishlist.length}
                </span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {/* Orders & Tracking Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">My Orders & Live Progress</h2>
                    <p className="text-xs text-gray-500">View your unique Order IDs and track crafting and delivery</p>
                  </div>
                  <Link href="/track-order">
                    <Button variant="outline" className="text-xs py-2 px-3 self-start sm:self-auto">
                      <Package className="w-3.5 h-3.5 mr-1.5" /> Order Tracker Tool
                    </Button>
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-gray-500">Loading your orders...</div>
                ) : customerOrders.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-[#E8DEC9] text-center space-y-4 shadow-sm">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No Orders Placed Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      When you order handmade crochet flowers, keychains, or custom creations, your Order IDs and tracking progress will appear here.
                    </p>
                    <Link href="/shop">
                      <Button className="px-6 py-2.5 text-xs font-semibold">Explore Handmade Studio</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-4 transition-all hover:border-[#C86D51]/50"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DEC9] gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium">Order ID:</span>
                              <span className="font-mono font-bold text-sm sm:text-base text-[#1A1A1A] bg-[#FAF4E8] px-2.5 py-0.5 rounded-lg border border-[#E8DEC9]">
                                {order.id}
                              </span>
                              <button
                                onClick={() => copyOrderId(order.id)}
                                className="p-1 text-gray-400 hover:text-[#C86D51] transition-colors"
                                title="Copy Order ID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-1">
                              Placed on: {formatDate(order.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1 ${
                                order.order_status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.order_status === 'dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.order_status === 'received' && <Clock className="w-3 h-3" />}
                              {order.order_status === 'crafting' && <Clock className="w-3 h-3 text-[#C86D51]" />}
                              {order.order_status === 'dispatched' && <Truck className="w-3 h-3" />}
                              {order.order_status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                              Status: {order.order_status}
                            </span>
                            <span className="text-xs font-bold text-[#1A1A1A] bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                              {order.payment_method?.toUpperCase()} ({order.payment_status?.toUpperCase()})
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Package Items ({order.items?.length || 1})
                          </h4>
                          <div className="divide-y divide-[#F4EFE6] bg-[#FAF4E8]/50 p-3 rounded-2xl border border-[#E8DEC9]/60">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
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

                        {/* Order Footer & Actions */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F4EFE6]">
                          <div className="text-xs text-gray-600">
                            <span>Total Amount: </span>
                            <span className="font-bold text-sm text-[#C86D51]">
                              {formatCurrency(order.total_amount)}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-2">
                              (Destination: {order.shipping_address?.city || 'India'} - {order.shipping_address?.pincode || ''})
                            </span>
                          </div>

                          <Link href={`/track-order?id=${encodeURIComponent(order.id)}`}>
                            <Button className="w-full sm:w-auto text-xs py-2 px-4 shadow-sm flex items-center justify-center gap-1.5">
                              <Package className="w-3.5 h-3.5" /> Track Live Progress <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">My Saved Wishlist</h2>
                    <p className="text-xs text-gray-500">Your favorite handcrafted crochet pieces</p>
                  </div>
                  <span className="text-xs text-gray-500">{wishlistedProducts.length} items saved</span>
                </div>

                {wishlistedProducts.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-[#E8DEC9] text-center space-y-4 shadow-sm">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">Your wishlist is currently empty.</p>
                    <Link href="/shop">
                      <Button className="px-6 py-2.5 text-xs">Explore Handmade Catalog</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
