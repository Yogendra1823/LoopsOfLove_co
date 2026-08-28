'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { WhatsAppButton } from '@/components/home/WhatsAppButton';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // In Admin Studio routes, do not render customer shopping components (cart, wishlist, announcement bar, whatsapp, customer header/footer)
  if (isAdminRoute) {
    return (
      <>
        <main className="flex-1 w-full">{children}</main>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <MobileNav />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <ToastContainer />
      <WhatsAppButton />
    </>
  );
}
