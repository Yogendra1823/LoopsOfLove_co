'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';

const ADMIN_EMAILS = ['medarametlayogendra@gmail.com', 'loopsoflove@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Instant synchronous initialization (0ms lag)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (pathname === '/admin/login') return true;
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    const email = localStorage.getItem('admin_email');
    return !!(isAuth && email && ADMIN_EMAILS.includes(email.toLowerCase()));
  });

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('admin_authenticated') === 'true';
      const email = localStorage.getItem('admin_email');

      if (!isAuth || !email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] flex flex-col">
      <AdminHeader />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
