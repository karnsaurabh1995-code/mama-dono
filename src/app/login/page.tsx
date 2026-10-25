'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Info,
  Phone,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DokindLogo } from '@/components/common/DokindLogo';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setUserSession } = useAuth();

  // Tab: 'phone' (Default Indian Giving Experience) vs 'email' (Staff & Traditional Accounts)
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone OTP Flow State
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'verify_otp'>('enter_phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);

  // Email Flow State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  // General feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const rawReturnUrl = searchParams.get('returnUrl');
  const actionParam = searchParams.get('action');

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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

  // ---------------- PHONE OTP HANDLERS ----------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevHint(null);

    const cleanDigits = phone.trim().replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!['6', '7', '8', '9'].includes(cleanDigits.charAt(0))) {
      setError('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode} ${cleanDigits}`;
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send OTP code. Please try again.');
        setLoading(false);
        return;
      }

      setMaskedPhone(data.maskedPhone || `${countryCode} ${cleanDigits.slice(0, 2)}••••••${cleanDigits.slice(-2)}`);
      setCountdown(data.cooldownSeconds || 60);
      setPhoneStep('verify_otp');
      setOtp(['', '', '', '', '', '']);

      if (data.devHint?.devOtpHint) {
        setDevHint(data.devHint.devOtpHint);
      }

      // Auto-focus first digit on next tick
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setError('Network connection error. Please verify your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (submittedOtpCode?: string) => {
    setError('');
    const code = submittedOtpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode} ${phone.trim().replace(/\D/g, '')}`;
      const res = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          otp: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Incorrect OTP code. Please try again.');
        setLoading(false);
        return;
      }

      // Establish client auth session
      setUserSession(data.user);
      setSuccessMsg('Mobile number verified! Signing you in...');

      const safeTarget = getSafeRedirectUrl();
      setTimeout(() => {
        if (safeTarget) {
          router.push(safeTarget);
        } else {
          router.push(data.redirectUrl || '/account');
        }
      }, 600);
    } catch {
      setError('Verification network error. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setDevHint(null);
    setLoading(true);

    try {
      const fullPhone = `${countryCode} ${phone.trim().replace(/\D/g, '')}`;
      const res = await fetch('/api/auth/phone/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, retryType: 'text' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend code.');
        setLoading(false);
        return;
      }

      setCountdown(data.cooldownSeconds || 60);
      setSuccessMsg('New verification code sent via SMS.');
      if (data.devHint?.devOtpHint) {
        setDevHint(data.devHint.devOtpHint);
      }
    } catch {
      setError('Failed to resend code due to network error.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Keydown and Paste Handlers
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // If entered a digit, move to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    const allFilled = newOtp.every((d) => d !== '');
    if (allFilled) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    // Focus last filled or 6th input
    const focusIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  // ---------------- EMAIL / PASSWORD HANDLER (PRESERVED) ----------------
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    login(cleanEmail);

    const safeTarget = getSafeRedirectUrl();
    if (safeTarget) {
      router.push(safeTarget);
      return;
    }

    // Role-aware default destination
    if (db.isDesignatedSuperAdmin(cleanEmail) || cleanEmail.includes('admin') || cleanEmail.includes('staff')) {
      router.push('/admin');
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-[460px] w-full space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center group mb-1 focus:outline-none" aria-label="dokind home">
            <DokindLogo size="lg" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Welcome to dokind
          </h1>
          <p className="text-xs sm:text-sm text-[#555B63] max-w-sm mx-auto leading-relaxed">
            Support verified missions, download 80G tax receipts, and track your compassionate giving.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-sm space-y-5">
          {actionParam && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-[#EF4949] shrink-0" />
              <span>Please sign in to complete your requested action on the campaign.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev Mode Simulation Hint (Only in non-production) */}
          {devHint && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Dev Mode Mock OTP:</span>
                <strong className="font-mono text-xs bg-amber-200/80 px-1.5 py-0.5 rounded">{devHint}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const digits = devHint.split('');
                  setOtp(digits);
                  handleVerifyOtp(devHint);
                }}
                className="text-[10px] text-amber-800 underline font-semibold hover:text-amber-900 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Authentication Method Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F5F4F0] rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'phone'
                  ? 'bg-white text-[#202124] shadow-xs font-bold'
                  : 'text-[#555B63] hover:text-[#202124]'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-[#202124] shadow-xs font-bold'
                  : 'text-[#555B63] hover:text-[#202124]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* ================= FLOW 1: PHONE OTP SIGN IN ================= */}
          {authMethod === 'phone' && (
            <>
              {phoneStep === 'enter_phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="mobile-input" className="block text-xs sm:text-sm font-semibold text-[#202124] mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Country Code Prefix */}
                      <div className="shrink-0 flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3 py-3 text-xs sm:text-sm font-semibold text-[#202124]">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>{countryCode}</span>
                      </div>
                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <input
                          id="mobile-input"
                          type="tel"
                          required
                          autoFocus
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="98765 43210"
                          className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/15 transition-all font-medium tracking-wide"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-[#555B63] mt-1.5 block">
                      We’ll send a 6-digit verification code via MSG91 SMS.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || phone.trim().length !== 10}
                    className="w-full font-bold py-3 text-sm rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* STEP 2: VERIFY OTP SCREEN */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E8E6E1] p-3 rounded-2xl text-xs">
                    <div>
                      <span className="text-[#555B63] block text-[11px]">Code sent to</span>
                      <strong className="text-[#202124] font-semibold">{maskedPhone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep('enter_phone');
                        setError('');
                        setDevHint(null);
                      }}
                      className="text-xs text-[#EF4949] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* 6 Individual Code Boxes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#202124] mb-2 text-center">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex justify-between gap-2 max-w-[340px] mx-auto" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          autoComplete="one-time-code"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 sm:w-12 h-12 text-center text-lg font-bold font-mono text-[#202124] bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/20 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Action Button */}
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full font-bold py-3 text-sm rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {/* Resend OTP with Countdown */}
                  <div className="text-center pt-1 text-xs">
                    {countdown > 0 ? (
                      <span className="text-[#555B63] flex items-center justify-center gap-1.5">
                        <RotateCcw className="w-3 h-3 text-neutral-400 animate-spin" />
                        <span>Resend OTP available in <strong>{countdown}s</strong></span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[#EF4949] font-semibold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend OTP via SMS</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= FLOW 2: PRESERVED EMAIL / PASSWORD SIGN IN ================= */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#202124] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram.sharma@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-[#202124]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#EF4949] hover:text-[#D9363E] transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/15 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#555B63] pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-[#E8E6E1] text-[#EF4949] focus:ring-[#EF4949]"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold py-3 text-sm rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Subtle OR Divider & Google Sign-In */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#EAE7E2]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 font-bold text-neutral-400 text-[11px]">
                OR
              </span>
            </div>
          </div>

          <GoogleSignInButton returnUrl={rawReturnUrl || '/'} />

          {/* Trust and Compliance Footnote */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#555B63]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25845B] shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#EF4949] fill-[#EF4949] shrink-0" />
              <span>Instant 80G Tax Receipts</span>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center text-xs sm:text-sm text-[#555B63] pt-1">
            Don’t have an account yet?{' '}
            <Link href="/signup" className="text-[#EF4949] font-bold hover:text-[#D9363E] transition-colors hover:underline">
              Create an Account
            </Link>
          </div>
        </div>

        {/* Useful Footer Links */}
        <div className="text-center text-xs text-neutral-400 flex items-center justify-center gap-3">
          <Link href="/help" className="hover:text-neutral-600 transition-colors">Help Center</Link>
          <span>•</span>
          <Link href="/faq" className="hover:text-neutral-600 transition-colors">FAQs</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-neutral-600 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
