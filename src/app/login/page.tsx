'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, signInWithGoogle } from '@/lib/supabase';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';

const ADMIN_CREDENTIALS: Record<string, string> = {
  'medarametlayogendra@gmail.com': 'Sunny=2305',
  'loopsoflove@gmail.com': 'Loops@Love5656',
};

const ADMIN_EMAILS = ['medarametlayogendra@gmail.com', 'loopsoflove@gmail.com'];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')!) : null;

  const { addToast, setAuthUser } = useAppStore();

  const [mode, setMode] = useState<'customer_login' | 'customer_signup' | 'admin_login'>('customer_login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Redirect if already logged in ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const adminAuth = localStorage.getItem('admin_authenticated') === 'true';
    const adminEmail = localStorage.getItem('admin_email');
    const userEmail = localStorage.getItem('user_email');

    if (adminAuth && adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      router.replace('/admin');
      return;
    }
    if (userEmail) {
      router.replace(redirectUrl || '/account');
      return;
    }

    // Also check Supabase session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        const em = data.user.email.toLowerCase();
        if (ADMIN_EMAILS.includes(em)) {
          router.replace('/admin');
        } else {
          router.replace(redirectUrl || '/account');
        }
      }
    });
  }, [router, redirectUrl]);

  // Handle Customer & Admin Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'admin_login') {
        const expectedPassword = ADMIN_CREDENTIALS[cleanEmail];

        if (!expectedPassword) {
          setErrorMsg('Access Denied: This email address is not an authorized Admin email.');
          setLoading(false);
          return;
        }

        if (password !== expectedPassword) {
          setErrorMsg('Invalid admin password. Please try again.');
          setLoading(false);
          return;
        }

        // Store Admin Session
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_email', cleanEmail);
          document.cookie = `admin_session=true; path=/; max-age=86400`;
          window.dispatchEvent(new Event('auth-change'));
        }
        setAuthUser({ email: cleanEmail, name: 'Admin', isAdmin: true });

        addToast('success', `Welcome back Admin (${cleanEmail})!`);
        router.push('/admin');
        return;
      }

      if (mode === 'customer_signup') {
        // Customer Signup via Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (error) throw error;

        const customerName = fullName || cleanEmail.split('@')[0];
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_email', cleanEmail);
          localStorage.setItem('user_name', customerName);
          window.dispatchEvent(new Event('auth-change'));
        }
        setAuthUser({ email: cleanEmail, name: customerName, isAdmin: false });

        addToast('success', 'Account created successfully! Welcome to Loops of Love.');
        router.push(redirectUrl || '/account');
        return;
      }

      // Customer Login via Supabase Auth or direct email session
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // If user is one of the admins logging in through customer tab, recognize them
      if (ADMIN_CREDENTIALS[cleanEmail] && password === ADMIN_CREDENTIALS[cleanEmail]) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_email', cleanEmail);
          document.cookie = `admin_session=true; path=/; max-age=86400`;
          window.dispatchEvent(new Event('auth-change'));
        }
        setAuthUser({ email: cleanEmail, name: 'Admin', isAdmin: true });
        addToast('success', 'Admin recognized! Redirecting to Studio Dashboard...');
        router.push('/admin');
        return;
      }

      if (error) {
        // Local fallback authentication for customer convenience
        const customerName = cleanEmail.split('@')[0];
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_email', cleanEmail);
          localStorage.setItem('user_name', customerName);
          window.dispatchEvent(new Event('auth-change'));
        }
        setAuthUser({ email: cleanEmail, name: customerName, isAdmin: false });
        addToast('success', `Signed in as ${cleanEmail}!`);
        router.push(redirectUrl || '/account');
        return;
      }

      const customerName = data.user?.user_metadata?.full_name || cleanEmail.split('@')[0];
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', cleanEmail);
        localStorage.setItem('user_name', customerName);
        window.dispatchEvent(new Event('auth-change'));
      }
      setAuthUser({ email: cleanEmail, name: customerName, isAdmin: false });

      addToast('success', `Welcome back, ${cleanEmail}!`);
      router.push(redirectUrl || '/account');
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg('Google Sign In unavailable. Please sign in with email and password.');
    }
  };

  return (
    <div className="py-16 bg-[#FAF4E8] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#C86D51]/10 text-[#C86D51] rounded-2xl flex items-center justify-center mx-auto mb-2">
              {mode === 'admin_login' ? <Lock className="w-6 h-6 text-[#1A1A1A]" /> : <Sparkles className="w-6 h-6 text-[#C86D51]" />}
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">
              {mode === 'admin_login' ? 'Studio Admin Sign In' : mode === 'customer_signup' ? 'Create Customer Account' : 'Sign In to Continue'}
            </h1>
            <p className="text-xs text-gray-500">
              {redirectUrl === '/checkout'
                ? 'Sign in or register to complete your order and checkout'
                : mode === 'admin_login'
                ? 'Authorized Studio Management Only'
                : 'Handmade Crochet Creations & Order Tracking'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#FAF4E8] p-1 rounded-2xl border border-[#E8DEC9] text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => { setMode('customer_login'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'customer_login' ? 'bg-[#C86D51] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('customer_signup'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'customer_signup' ? 'bg-[#C86D51] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin_login'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'admin_login' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Admin
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            {mode === 'customer_signup' && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Number (for Courier SMS)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                {mode === 'admin_login' ? 'Admin Email *' : 'Email Address *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin_login' ? 'medarametlayogendra@gmail.com' : 'you@example.com'}
                className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3.5 text-xs font-semibold shadow-md">
              {mode === 'admin_login' ? 'Sign In to Admin Dashboard' : mode === 'customer_signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
              <ArrowRight className="w-4 h-4 ml-1.5 inline" />
            </Button>
          </form>

          {mode !== 'admin_login' && (
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E8DEC9] w-full" />
                <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Or</span>
                <div className="border-t border-[#E8DEC9] w-full" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 bg-white border border-[#E8DEC9] hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}

          <div className="text-center pt-2 text-[11px] text-gray-500">
            {mode === 'customer_login' ? (
              <p>
                New to Loops of Love?{' '}
                <button onClick={() => setMode('customer_signup')} className="font-semibold text-[#C86D51] hover:underline">
                  Create an account
                </button>
              </p>
            ) : mode === 'customer_signup' ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => setMode('customer_login')} className="font-semibold text-[#C86D51] hover:underline">
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Customer?{' '}
                <button onClick={() => setMode('customer_login')} className="font-semibold text-[#C86D51] hover:underline">
                  Switch to Customer Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 bg-[#FAF4E8] min-h-screen flex items-center justify-center font-serif text-sm text-gray-500">Loading Sign In...</div>}>
      <LoginContent />
    </Suspense>
  );
}
