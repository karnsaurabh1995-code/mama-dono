'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { isValidPAN } from '@/lib/utils';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, updateProfile, setUserSession } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');

  // Mobile OTP Linking Modal / Inline state
  const [linkingPhone, setLinkingPhone] = useState(false);
  const [linkOtp, setLinkOtp] = useState('');
  const [linkCountdown, setLinkCountdown] = useState(0);
  const [linkLoading, setLinkLoading] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (panNumber && !isValidPAN(panNumber)) {
      setError('Invalid Indian PAN format (must be 5 letters, 4 digits, 1 letter, e.g. ABCDE1234F)');
      return;
    }
    setError('');
    updateProfile({
      name,
      phone,
      panNumber: panNumber.toUpperCase(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleStartPhoneLink = async () => {
    setError('');
    setPhoneSuccess('');
    setDevHint(null);

    const cleanDigits = phone.trim().replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number before requesting verification.');
      return;
    }

    setLinkLoading(true);
    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to trigger verification code.');
        setLinkLoading(false);
        return;
      }

      setLinkingPhone(true);
      setLinkCountdown(data.cooldownSeconds || 60);
      if (data.devHint?.devOtpHint) {
        setDevHint(data.devHint.devOtpHint);
      }
    } catch {
      setError('Network connection error while sending verification OTP.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleConfirmPhoneLink = async () => {
    setError('');
    if (!linkOtp.trim() || linkOtp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLinkLoading(true);
    try {
      const res = await fetch('/api/account/phone/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: linkOtp.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Incorrect OTP code.');
        setLinkLoading(false);
        return;
      }

      setPhoneSuccess('Mobile number successfully verified and linked to your account!');
      setLinkingPhone(false);
      setLinkOtp('');
      if (data.user) {
        setUserSession(data.user);
      }
    } catch {
      setError('Network connection error while verifying mobile number.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkPhone = async () => {
    if (!confirm('Are you sure you want to unlink this mobile number from your account?')) return;
    setError('');
    setPhoneSuccess('');
    setLinkLoading(true);

    try {
      const res = await fetch('/api/account/phone/unlink', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to unlink mobile number.');
        setLinkLoading(false);
        return;
      }

      setPhone('');
      setPhoneSuccess('Mobile number unlinked.');
      if (data.user) {
        setUserSession(data.user);
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-[#202124]">
            Donor Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Profile & 80G PAN</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#202124]">Profile & Tax Details</h1>
          <Link href="/account">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#25845B] rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and PAN records updated successfully.</span>
          </div>
        )}

        {phoneSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{phoneSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-neutral-100 border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#202124]">
                  Mobile Number (MSG91 OTP Verified)
                </label>
                {user?.phone && user?.phoneVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="flex-1 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
                {user?.phone && user?.phoneVerified ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUnlinkPhone}
                    disabled={linkLoading}
                    className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                  >
                    Unlink
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleStartPhoneLink}
                    disabled={linkLoading || !phone.trim()}
                    className="shrink-0 text-xs"
                  >
                    {linkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify with OTP'}
                  </Button>
                )}
              </div>

              {/* Inline OTP Verification Box */}
              {linkingPhone && (
                <div className="mt-3 p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#202124]">
                      Enter 6-Digit OTP sent to your phone
                    </span>
                    <button
                      type="button"
                      onClick={() => setLinkingPhone(false)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {devHint && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                      <span>Dev Mock Code: <strong>{devHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setLinkOtp(devHint)}
                        className="text-[10px] font-bold text-amber-700 underline"
                      >
                        Insert
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={linkOtp}
                      onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP"
                      className="flex-1 bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-center"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmPhoneLink}
                      disabled={linkLoading || linkOtp.length !== 6}
                    >
                      {linkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Permanent Account Number (PAN for Section 80G Tax Certificates)
              </label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Required under CBDT guidelines for Form 10BD/10BE annual reporting.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
