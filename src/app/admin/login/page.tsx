'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ALLOWED_ADMINS: Record<string, string> = {
  'medarametlayogendra@gmail.com': 'Sunny=2305',
  'loopsoflove.co3@gmail.com': 'Loops@Love5656',
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Purge any legacy localStorage admin keys
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_email');

      const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
      const adminEmail = sessionStorage.getItem('admin_email');
      if (isAuth && adminEmail && ALLOWED_ADMINS[adminEmail.toLowerCase()]) {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const expectedPassword = ALLOWED_ADMINS[cleanEmail];

    if (!expectedPassword) {
      setErrorMsg('Access Denied: This email address is not authorized for Admin portal.');
      setLoading(false);
      return;
    }

    if (password !== expectedPassword) {
      setErrorMsg('Invalid admin password. Please verify credentials.');
      setLoading(false);
      return;
    }

    // Set ephemeral admin session flag in sessionStorage (destroyed on tab/browser close)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_email');

      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_email', cleanEmail);
      
      // True session cookie without max-age/expires (destroyed on browser close)
      document.cookie = `admin_session=true; path=/; SameSite=Strict`;
      window.dispatchEvent(new Event('auth-change'));
    }

    router.push('/admin');
  };

  return (
    <div className="py-20 bg-[#FAF4E8] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#1A1A1A] text-[#FAF4E8] rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Admin Portal</h1>
            <p className="text-xs text-gray-500">Loops of Love Studio Management</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medarametlayogendra@gmail.com or loopsoflove.co3@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3 text-xs font-semibold">
            Sign In to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
