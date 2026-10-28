'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AuthFeedback } from './AuthFeedback';
import { User } from '@/lib/types';

interface PhoneOtpFormProps {
  onSuccess: (user: User) => void;
  className?: string;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
];

export function PhoneOtpForm({ onSuccess, className = '' }: PhoneOtpFormProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
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

  // Clean raw input to national digits only
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length <= 15) {
      setPhoneNumber(digitsOnly);
    }
  };

  // Full E.164 phone string
  const getFullPhone = () => {
    return `${countryCode}${phoneNumber}`;
  };

  // --- Step 1: Send OTP to Phone ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevCodeHint(null);

    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhone();
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send verification SMS. Please check your number.');
        if (data.cooldownSeconds || data.retryAfterSeconds) {
          setCountdown(data.cooldownSeconds || data.retryAfterSeconds);
        }
        setLoading(false);
        return;
      }

      setMaskedPhone(data.maskedPhone || fullPhone);
      setStep('otp');
      setCountdown(data.cooldownSeconds || 60);
      setSuccessMsg(`Verification code sent to ${data.maskedPhone || 'your mobile'}.`);

      if (data.devHint?.devOtpHint) {
        setDevCodeHint(data.devHint.devOtpHint);
      }
    } catch {
      setError('Network error while requesting verification SMS. Please check your connection.');
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
      const fullPhone = getFullPhone();
      const res = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp: fullCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Incorrect or expired verification code.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Phone verified! Signing you in...');
      setTimeout(() => {
        onSuccess(data.user);
      }, 500);
    } catch {
      setError('Network error during verification. Please check your connection.');
      setLoading(false);
    }
  };

  // --- Step 3: Resend OTP Code ---
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setDevCodeHint(null);
    setOtpDigits(['', '', '', '', '', '']);

    setLoading(true);
    try {
      const fullPhone = getFullPhone();
      const res = await fetch('/api/auth/phone/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend SMS code. Please try again later.');
        if (data.cooldownSeconds || data.retryAfterSeconds) {
          setCountdown(data.cooldownSeconds || data.retryAfterSeconds);
        }
        setLoading(false);
        return;
      }

      setCountdown(data.cooldownSeconds || 60);
      setSuccessMsg('A fresh verification code has been sent.');
      if (data.devHint?.devOtpHint) {
        setDevCodeHint(data.devHint.devOtpHint);
      }
      otpInputsRef.current[0]?.focus();
    } catch {
      setError('Network error while resending verification SMS.');
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Box Key & Paste Handlers ---
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      setTimeout(() => {
        const full = newDigits.join('');
        if (full.length === 6) {
          submitDirectCode(full);
        }
      }, 50);
    }
  };

  const submitDirectCode = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const fullPhone = getFullPhone();
      const res = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp: code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Incorrect or expired verification code.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Phone verified! Signing you in...');
      setTimeout(() => {
        onSuccess(data.user);
      }, 500);
    } catch {
      setError('Network error during verification.');
      setLoading(false);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      submitDirectCode(pasted);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visual Feedback Alerts */}
      {error && <AuthFeedback type="error" message={error} />}
      {successMsg && <AuthFeedback type="success" message={successMsg} />}

      {/* Developer Testing Code Callout (Strictly Non-Production) */}
      {devCodeHint && process.env.NODE_ENV !== 'production' && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
          <span className="font-mono text-[11px]">
            🧪 Local Dev SMS Code: <strong>{devCodeHint}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const chars = devCodeHint.split('');
              setOtpDigits(chars);
              submitDirectCode(devCodeHint);
            }}
            className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900"
          >
            Auto-Fill
          </button>
        </div>
      )}

      {step === 'phone' ? (
        /* STEP 1: MOBILE NUMBER INPUT */
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="donor-phone-input"
              className="block text-xs font-bold text-[#202124] uppercase tracking-wider"
            >
              Mobile Number
            </label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <div className="relative shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={loading}
                  aria-label="Select Country Code"
                  className="h-11 px-2.5 bg-[#FAF9F6] border border-[#D1D5DB] rounded-xl text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949] transition-all cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* National Mobile Number Input */}
              <div className="relative flex-1">
                <input
                  id="donor-phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                  autoComplete="tel-national"
                  autoFocus
                  disabled={loading}
                  maxLength={15}
                  required
                  className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D1D5DB] rounded-xl text-sm font-medium text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949] transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#555B63]">
              We will send a 6-digit one-time SMS verification code. Standard carrier rates may apply.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full h-11 bg-[#EF4949] hover:bg-[#D93D3D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#EF4949]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Continue with Mobile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: 6-DIGIT OTP VERIFICATION */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-[#555B63]">
              Sent to: <strong className="text-[#202124]">{maskedPhone}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtpDigits(['', '', '', '', '', '']);
                setError('');
                setSuccessMsg('');
              }}
              className="text-[#EF4949] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          {/* 6 Individual Code Boxes */}
          <div className="flex justify-between gap-1.5 sm:gap-2">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpInputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                aria-label={`Digit ${idx + 1} of verification code`}
                className="w-11 sm:w-12 h-13 text-center text-lg sm:text-xl font-bold bg-[#FAF9F6] border border-[#D1D5DB] rounded-xl text-[#202124] focus:outline-none focus:border-[#EF4949] focus:ring-2 focus:ring-[#EF4949]/20 transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otpDigits.some((d) => !d)}
            className="w-full h-11 bg-[#EF4949] hover:bg-[#D93D3D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#EF4949]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Sign In</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend Cooldown Counter */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0EEEB]">
            <span className="text-[#555B63]">Didn’t receive the SMS?</span>
            {countdown > 0 ? (
              <span className="text-neutral-400 font-mono text-[11px]">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[#EF4949] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
