'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, DEMO_USERS } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Heart, Lock, Mail, ChevronRight, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { DokindLogo } from '@/components/common/DokindLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, switchRole } = useAuth();

  const rawReturnUrl = searchParams.get('returnUrl');
  const actionParam = searchParams.get('action');

  const getSafeRedirectUrl = () => {
    if (rawReturnUrl && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//')) {
      if (actionParam && !rawReturnUrl.includes('action=')) {
        const separator = rawReturnUrl.includes('?') ? '&' : '?';
        return `${rawReturnUrl}${separator}action=${encodeURIComponent(actionParam)}`;
      }
      return rawReturnUrl;
    }
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    login(email);
    const targetUrl = getSafeRedirectUrl() || '/account';
    router.push(targetUrl);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchRole(role);
    const safeTarget = getSafeRedirectUrl();
    if (safeTarget) {
      router.push(safeTarget);
      return;
    }

    if (role === 'super_admin' || role === 'ops_admin') {
      router.push('/admin');
    } else if (role === 'fundraiser' || role === 'organization_manager') {
      router.push('/fundraiser/dashboard');
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center group mb-1">
            <DokindLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-[#202124]">Welcome Back</h1>
          <p className="text-xs text-[#555B63]">
            Log in to manage your donations, download 80G tax certificates, or track campaign progress.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-7 shadow-xs space-y-5">
          {actionParam && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-[#EF4949] shrink-0" />
              <span>
                Please sign in to complete your requested action on the campaign.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram.sharma@example.com"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#202124]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-[#E84B45] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              Sign In
            </Button>
          </form>

          {/* Quick Role Simulator Demo Logins */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 text-center">
              Instant Demo Role Access (1-Click)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('donor')}
                className="p-2 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left cursor-pointer"
              >
                <div className="font-bold text-[#202124]">Donor Account</div>
                <div className="text-[10px] text-neutral-500">Vikramaditya (80G Donors)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('fundraiser')}
                className="p-2 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left cursor-pointer"
              >
                <div className="font-bold text-[#202124]">Fundraiser Account</div>
                <div className="text-[10px] text-neutral-500">Ramesh (Aarav’s Father)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('organization_manager')}
                className="p-2 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left cursor-pointer"
              >
                <div className="font-bold text-[#202124]">NGO Partner</div>
                <div className="text-[10px] text-neutral-500">Dr. Sunita (Asha Jyoti)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('super_admin')}
                className="p-2 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left cursor-pointer"
              >
                <div className="font-bold text-[#202124]">Super Admin</div>
                <div className="text-[10px] text-neutral-500">Full Platform Controls</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#555B63] pt-1">
            Don’t have an account yet?{' '}
            <Link href="/signup" className="text-[#E84B45] font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
