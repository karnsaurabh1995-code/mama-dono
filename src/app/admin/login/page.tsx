'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { DokindLogo } from '@/components/common/DokindLogo';
import { Button } from '@/components/ui/Button';
import { getSafeReturnUrl } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));

  // State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // First-login password change state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          if (!data.user.requiresPasswordChange) {
            router.push(returnUrl);
          } else {
            setMustChangePassword(true);
          }
        }
      })
      .catch(() => {});
  }, [router, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your Admin ID or registered email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid Admin ID or Password.');
        setLoading(false);
        return;
      }

      // Check if first-login password rotation is required
      if (data.requiresPasswordChange) {
        setCurrentPassword(password);
        setMustChangePassword(true);
        setLoading(false);
        return;
      }

      // Successful login -> Redirect
      router.push(returnUrl);
      router.refresh();
    } catch {
      setError('A network error occurred. Please check your connection and retry.');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (!newPassword) {
      setChangeError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setChangeError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setChangeError('Password must contain at least one letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match. Please re-type.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword || password,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setChangeError(data.error || 'Could not update password. Please check requirements.');
        setLoading(false);
        return;
      }

      setChangeSuccess(true);
      setTimeout(() => {
        router.push(returnUrl);
        router.refresh();
      }, 1200);
    } catch {
      setChangeError('A network error occurred while updating your password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1015] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#EF4949]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <DokindLogo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-neutral-300">
            <Lock className="w-3 h-3 text-[#EF4949]" />
            <span>Administrative Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mustChangePassword ? 'Set Permanent Password' : 'Sign In to Admin Console'}
          </h2>
          <p className="text-xs text-neutral-400">
            {mustChangePassword
              ? 'First-time login detected. Create your personal secure password.'
              : 'Authorized personnel only. Sessions are cryptographically signed and audited.'}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-[#181B20] py-8 px-6 shadow-2xl rounded-2xl border border-neutral-800 sm:px-10 relative">
          {!mustChangePassword ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  Admin ID or Registered Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. sarthakraj2009 or admin@dokind.org"
                    autoComplete="username"
                    required
                    className="w-full bg-[#101216] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-300">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-[#101216] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949] pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EF4949] hover:bg-[#D93D3D] text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg shadow-[#EF4949]/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notices */}
              <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-2">
                <div className="flex items-center gap-2 text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>NIST SP 800-63B compliant password protection</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>HMAC-SHA256 signed HttpOnly sessions</span>
                </div>
              </div>
            </form>
          ) : (
            /* First-login Password Change Form */
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  As a security precaution for newly provisioned admin accounts, please choose your personal permanent password before continuing.
                </span>
              </div>

              {changeError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Password updated! Entering administrative console...</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full bg-[#101216] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#EF4949] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">Confirm New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full bg-[#101216] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#EF4949]"
                />
              </div>

              <div className="text-[11px] text-neutral-400 space-y-1">
                <p className="font-semibold text-neutral-300">Password requirements:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-neutral-400">
                  <li>Minimum 8 characters in length</li>
                  <li>At least one letter (a-z, A-Z)</li>
                  <li>At least one numeric digit (0-9)</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || changeSuccess}
                  className="w-full bg-[#EF4949] hover:bg-[#D93D3D] text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Set Password & Enter Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Public Site */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            &larr; <span>Return to Dokind Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
