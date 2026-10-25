'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { AuthFeedback } from './AuthFeedback';
import { User } from '@/lib/types';

interface EmailOtpFormProps {
  onSuccess: (user: User) => void;
  className?: string;
}

export function EmailOtpForm({ onSuccess, className = '' }: EmailOtpFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second cooldown countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first OTP box upon advancing to code step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }
  }, [step]);

  // --- Step 1: Send OTP to Email ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevCodeHint(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/email-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send verification code. Please try again.');
        if (data.retryAfterSeconds) {
          setCountdown(data.retryAfterSeconds);
        }
        setLoading(false);
        return;
      }

      setStep('otp');
      setCountdown(data.resendCooldown || 60);
      setSuccessMsg('Verification code sent! Please check your email inbox.');
      if (data.devCode) {
        setDevCodeHint(data.devCode);
      }
    } catch {
      setError('Network error while requesting verification code. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify Submitted OTP ---
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: fullCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid verification code. Please check and try again.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Email verified successfully! Signing you in...');
      setTimeout(() => {
        onSuccess(data.user);
      }, 500);
    } catch {
      setError('Network error while verifying code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP Handler ---
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setDevCodeHint(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/email-otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend verification code.');
        if (data.retryAfterSeconds) {
          setCountdown(data.retryAfterSeconds);
        }
        setLoading(false);
        return;
      }

      setCountdown(data.resendCooldown || 60);
      setSuccessMsg('A fresh verification code has been sent to your email.');
      setOtpDigits(['', '', '', '', '', '']);
      if (data.devCode) {
        setDevCodeHint(data.devCode);
      }
      setTimeout(() => otpInputsRef.current[0]?.focus(), 50);
    } catch {
      setError('Network error while resending code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle single-digit input change with auto-advance
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      const full = newDigits.join('');
      if (full.length === 6) {
        setTimeout(() => handleVerifyOtp(), 50);
      }
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasted.length >= 6) {
      const digits = pasted.slice(0, 6).split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
      setTimeout(() => handleVerifyOtp(), 50);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && <AuthFeedback type="error" message={error} />}
      {successMsg && <AuthFeedback type="success" message={successMsg} />}

      {/* Dev code simulation hint (only displayed in development mode for convenience) */}
      {devCodeHint && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>Dev Simulation Code: <strong className="font-mono text-sm tracking-wider">{devCodeHint}</strong></span>
          <button
            type="button"
            onClick={() => {
              setOtpDigits(devCodeHint.split(''));
              setTimeout(() => handleVerifyOtp(), 50);
            }}
            className="text-[11px] font-bold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
          <div>
            <label htmlFor="auth-email-input" className="block text-xs font-semibold text-[#202124] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-email-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className="w-full bg-[#FAF9F6] border border-[#EAE7E2] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949]/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EF4949] hover:bg-[#D9363E] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
                setSuccessMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#202124] font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change email</span>
            </button>
            <span className="text-xs text-neutral-500 font-mono truncate max-w-[180px]">
              {email}
            </span>
          </div>

          {/* 6-digit Code Entry Boxes */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-2 text-center">
              Enter 6-digit verification code
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  aria-label={`Digit ${idx + 1} of verification code`}
                  className="w-10 sm:w-11 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono bg-[#FAF9F6] border border-[#EAE7E2] rounded-xl focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/20 transition-all text-[#202124]"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EF4949] hover:bg-[#D9363E] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <span>Verify &amp; Sign In</span>
            )}
          </button>

          {/* Resend Cooldown Section */}
          <div className="text-center pt-1">
            {countdown > 0 ? (
              <span className="text-xs text-neutral-500">
                Resend code in <strong>{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-[#EF4949] hover:text-[#D9363E] font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend verification code</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
