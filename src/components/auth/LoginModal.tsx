'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShieldCheck } from 'lucide-react';
import { DokindLogo } from '@/components/common/DokindLogo';
import { useLoginModal } from '@/providers/AuthUIProvider';
import { useAuth } from '@/lib/auth/context';
import { EmailOtpForm } from './EmailOtpForm';
import { GoogleSignInButton } from './GoogleSignInButton';
import { User } from '@/lib/types';

export function LoginModal() {
  const { isLoginModalOpen, closeLogin, returnUrl } = useLoginModal();
  const { setUserSession } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isLoginModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLogin();
      }
    };

    // Lock body scroll while modal is visible
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoginModalOpen, closeLogin]);

  if (!isLoginModalOpen) {
    return null;
  }

  const handleAuthSuccess = (user: User) => {
    setUserSession(user);
    closeLogin();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={closeLogin}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#EAE7E2] shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Close Button ('X') */}
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Close sign in dialog"
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-[#202124] rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. TOP BRANDING & HEADER */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1">
            <DokindLogo variant="dark" size="md" showTagline={false} />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-black text-[#202124] tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63]">
            Sign in to manage donations, receipts, and campaigns
          </p>
        </div>

        {/* 2. EMAIL OTP VERIFICATION FORM */}
        <EmailOtpForm onSuccess={handleAuthSuccess} />

        {/* 3. SUBTLE "OR" DIVIDER */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#EAE7E2]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 font-bold text-neutral-400 text-[11px]">
              OR
            </span>
          </div>
        </div>

        {/* 4. OFFICIAL GOOGLE SIGN-IN BUTTON */}
        <GoogleSignInButton returnUrl={returnUrl} />

        {/* 5. BOTTOM TRUST & PRIVACY NOTICE */}
        <div className="mt-6 pt-5 border-t border-[#F0EEEB] text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>100% Secure &amp; Verified Authentication</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            By signing in, you agree to Dokind’s{' '}
            <Link
              href="/terms"
              onClick={closeLogin}
              className="text-[#202124] underline hover:text-[#EF4949] font-medium"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              onClick={closeLogin}
              className="text-[#202124] underline hover:text-[#EF4949] font-medium"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
