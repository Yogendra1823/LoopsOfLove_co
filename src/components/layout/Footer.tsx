'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Phone, Mail, Heart, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Footer() {
  const { settings } = useAppStore();

  return (
    <footer className="bg-[#1A1A1A] text-[#FAF4E8] pt-16 pb-12 border-t border-[#333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          <div className="space-y-4 md:col-span-1">
            <h3 className="font-serif text-2xl font-bold text-white">Loops of Love</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real Indian handmade D2C crochet studio. Crafting everlasting flowers, custom plushies, keychains, and festive home decor.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://instagram.com/${settings.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C86D51] flex items-center justify-center transition-colors text-white"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-colors text-white"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/shop?category=flowers-bouquets" className="hover:text-white transition-colors">Crochet Bouquets</Link></li>
              <li><Link href="/shop?category=keychains" className="hover:text-white transition-colors">Bag Keychains</Link></li>
              <li><Link href="/shop?category=toys" className="hover:text-white transition-colors">Amigurumi Plushies</Link></li>
              <li><Link href="/shop?category=bags" className="hover:text-white transition-colors">Crochet Totes & Bags</Link></li>
              <li><Link href="/shop?category=festival-collection" className="hover:text-white transition-colors">Lotus Door Hangings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link href="/custom-order" className="hover:text-white transition-colors">Custom Order Portal</Link></li>
              <li><Link href="/gift-finder" className="hover:text-white transition-colors">Gift Finder ✨</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs & Care Instructions</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">Store Policies</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-white transition-colors">Return & Refund Policy</Link></li>
              <li><Link href="/admin/login" className="hover:text-[#C86D51] transition-colors font-medium">Studio Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Loops of Love (@{settings.instagram_handle}). All Rights Reserved.</p>
          <div className="flex items-center gap-2 text-[#C86D51] font-semibold">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
