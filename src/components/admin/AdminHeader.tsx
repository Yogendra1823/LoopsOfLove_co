'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { signOut } from '@/lib/supabase';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products & Stock', href: '/admin/products', icon: ShoppingBag },
  { name: 'Customer Orders', href: '/admin/orders', icon: Package },
  { name: 'Custom Requests', href: '/admin/custom-orders', icon: Sparkles },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast, clearSession } = useAppStore();
  const [adminEmail, setAdminEmail] = useState<string>('Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('admin_email');
      if (email) setAdminEmail(email);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }

    clearSession();

    if (typeof window !== 'undefined') {
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

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] text-white border-b border-black/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg"
              aria-label="Toggle Admin Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white hover:text-[#DAAF87] transition-colors">
                Loops of Love
              </span>
              <span className="bg-[#C86D51] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0">
                Admin Studio
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/15 text-[#DAAF87] font-bold shadow-inner'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Live Store link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-semibold rounded-full border border-white/10 transition-colors"
              title="Open Live Customer Store in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#DAAF87]" />
              <span>Live Store</span>
            </Link>

            {/* Admin Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[140px] truncate">{adminEmail}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-full text-xs font-semibold transition-colors"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Admin Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#242424] px-4 py-3 space-y-1 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-gray-400">
            <span>Signed in as: <strong className="text-white">{adminEmail}</strong></span>
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#DAAF87] font-semibold flex items-center gap-1"
            >
              View Live Store <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#C86D51] text-white font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
