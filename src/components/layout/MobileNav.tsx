'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Search, Phone, Sparkles, User, Lock, Heart, Package, LogOut, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { signOut } from '@/lib/supabase';

const ADMIN_EMAILS = ['medarametlayogendra@gmail.com', 'loopsoflove@gmail.com'];

export function MobileNav() {
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen, settings, wishlist, addToast, clearSession, authUser, setAuthUser } = useAppStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_authenticated') === 'true';
      const adminEmail = localStorage.getItem('admin_email');
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');

      if (adminAuth && adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
        if (!authUser || !authUser.isAdmin) {
          setAuthUser({ email: adminEmail, name: userName || 'Admin', isAdmin: true });
        }
      } else if (userEmail) {
        if (!authUser || authUser.email !== userEmail) {
          setAuthUser({ email: userEmail, name: userName || userEmail.split('@')[0], isAdmin: false });
        }
      }
    }
  }, [authUser, setAuthUser]);

  const handleSignOut = async () => {
    try { await signOut(); } catch (_) { /* ignore */ }
    clearSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
    setMobileMenuOpen(false);
    addToast('info', 'You have been signed out.');
    router.push('/');
  };

  const userInitial = authUser?.name
    ? authUser.name.charAt(0).toUpperCase()
    : authUser?.email
    ? authUser.email.charAt(0).toUpperCase()
    : null;

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF4E8] shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DEC9]">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="font-serif text-xl font-bold text-[#1A1A1A]">Loops of Love</span>
            <p className="text-[9px] uppercase tracking-wider text-[#C86D51] font-semibold">Crochet Studio</p>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-black rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#E8DEC9]">
          <form action="/shop" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search keychains, bouquets..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-[#E8DEC9] rounded-full focus:outline-none focus:border-[#C86D51]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* User/Admin Auth Section (0ms instant) */}
        <div className="p-4 border-b border-[#E8DEC9]">
          {authUser?.isAdmin ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#C86D51]" />
                <span className="truncate">{authUser.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#C86D51] text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" /> Admin Portal
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : authUser?.email ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E8DEC9] rounded-xl">
                <span className="w-8 h-8 rounded-full bg-[#C86D51] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1A1A1A] truncate">{authUser.name || 'Customer'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{authUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[#E8DEC9] rounded-xl text-xs font-semibold text-[#1A1A1A]"
                >
                  <User className="w-3.5 h-3.5 text-[#C86D51]" /> My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#C86D51] text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <User className="w-3.5 h-3.5" /> Sign In / Register
              </Link>
              <Link
                href="/login?tab=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1A1A1A] text-[#FAF4E8] rounded-xl text-xs font-semibold shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-[#C86D51]" /> Admin Portal
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 flex flex-col gap-1 text-sm font-medium text-[#1A1A1A]">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Home
          </Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Shop All Catalog
          </Link>
          <Link href="/shop?category=flowers-bouquets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Flowers & Bouquets
          </Link>
          <Link href="/shop?category=keychains" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Crochet Keychains
          </Link>
          <Link href="/shop?category=toys" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Amigurumi Plush Toys
          </Link>
          <Link href="/custom-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#C86D51] font-semibold hover:bg-white transition-colors">
            <Sparkles className="w-4 h-4" /> Request Custom Creation
          </Link>
          <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            <Package className="w-4 h-4 text-gray-400" /> Track Order Status
          </Link>
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            <Heart className="w-4 h-4 text-[#C86D51]" /> Saved Wishlist ({wishlist.length})
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            About Our Studio
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:text-[#C86D51] transition-colors">
            Contact & Support
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DEC9]">
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-full text-xs shadow-sm mb-3"
          >
            <Phone className="w-4 h-4" /> WhatsApp Artisan
          </a>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>@{settings.instagram_handle}</span>
            <span>Handmade in India ❤️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
