'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, User, Sparkles, Lock, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { signOut } from '@/lib/supabase';

const ADMIN_EMAILS = ['medarametlayogendra@gmail.com', 'loopsoflove.co3@gmail.com'];

export function Header() {
  const router = useRouter();
  const { cart, wishlist, setCartOpen, setMobileMenuOpen, isMobileMenuOpen, addToast, clearSession, authUser, setAuthUser } = useAppStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Immediate sync with localStorage on mount (0ms lag)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_authenticated') === 'true';
      const adminEmail = localStorage.getItem('admin_email');
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');

      if (adminAuth && adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
        if (!authUser || !authUser.isAdmin || authUser.email !== adminEmail) {
          setAuthUser({ email: adminEmail, name: userName || 'Admin', isAdmin: true });
        }
      } else if (userEmail) {
        if (!authUser || authUser.email !== userEmail) {
          setAuthUser({ email: userEmail, name: userName || userEmail.split('@')[0], isAdmin: false });
        }
      }
    }

    const handleStorageChange = () => {
      const adminAuth = localStorage.getItem('admin_authenticated') === 'true';
      const adminEmail = localStorage.getItem('admin_email');
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');

      if (adminAuth && adminEmail) {
        setAuthUser({ email: adminEmail, name: userName || 'Admin', isAdmin: true });
      } else if (userEmail) {
        setAuthUser({ email: userEmail, name: userName || userEmail.split('@')[0], isAdmin: false });
      } else {
        setAuthUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, [authUser, setAuthUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); } catch (_) { /* ignore */ }
    clearSession();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      document.cookie = 'admin_session=; path=/; max-age=0';
      window.dispatchEvent(new Event('auth-change'));
    }
    addToast('info', 'You have been signed out.');
    router.push('/');
  };

  const userInitial = authUser?.name
    ? authUser.name.charAt(0).toUpperCase()
    : authUser?.email
    ? authUser.email.charAt(0).toUpperCase()
    : null;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled ? 'bg-[#FAF4E8]/95 backdrop-blur-md shadow-sm border-b border-[#E8DEC9]' : 'bg-[#FAF4E8]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#1A1A1A] hover:text-[#C86D51] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col text-left">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#C86D51] transition-colors">
                Loops of Love
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#C86D51] font-semibold -mt-1">
                Handmade Crochet Studio
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 font-medium text-sm text-[#1A1A1A]">
            <Link href="/" className="hover:text-[#C86D51] transition-colors py-1">Home</Link>
            <Link href="/shop" className="hover:text-[#C86D51] transition-colors py-1">Shop All</Link>
            <Link href="/shop?category=flowers-bouquets" className="hover:text-[#C86D51] transition-colors py-1">Bouquets</Link>
            <Link href="/shop?category=keychains" className="hover:text-[#C86D51] transition-colors py-1">Keychains</Link>
            <Link href="/custom-order" className="text-[#C86D51] font-semibold hover:text-[#B0583E] transition-colors py-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Custom Piece
            </Link>
            <Link href="/track-order" className="hover:text-[#C86D51] transition-colors py-1">Track Order</Link>
            <Link href="/about" className="hover:text-[#C86D51] transition-colors py-1">Our Story</Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search keychains, flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 xl:w-56 pl-9 pr-4 py-1.5 text-xs bg-[#F4EFE6] border border-[#E8DEC9] rounded-full focus:outline-none focus:border-[#C86D51] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* ── Auth State — 0ms lag from Zustand store ── */}
            {authUser?.isAdmin ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#FAF4E8] rounded-full text-xs font-bold hover:bg-[#C86D51] transition-colors shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C86D51]" /> Admin Portal
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-full"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : authUser?.email ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8DEC9] hover:border-[#C86D51] rounded-full text-xs font-semibold text-[#1A1A1A] transition-colors shadow-sm"
                  title="My Account"
                >
                  <span className="w-5 h-5 rounded-full bg-[#C86D51] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {userInitial}
                  </span>
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-full"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#E8DEC9] text-[#1A1A1A] hover:border-[#C86D51] hover:text-[#C86D51] rounded-full text-xs font-semibold transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </Link>
            )}

            <Link href="/account" className="p-2 text-[#1A1A1A] hover:text-[#C86D51] transition-colors relative" title="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C86D51] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-[#1A1A1A] hover:text-[#C86D51] transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C86D51] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
