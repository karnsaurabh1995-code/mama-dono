'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 bg-[#FAF9F6] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84B45] to-[#BD302D] flex items-center justify-center text-white shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <span className="text-2xl font-black text-[#202124]">
              Seva<span className="text-[#E84B45]">Setu</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#202124]">Reset Your Password</h1>
          <p className="text-xs text-[#555B63]">
            Enter your registered email to receive a password reset recovery link.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-7 shadow-xs space-y-5">
          {submitted ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#25845B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#202124]">Recovery Link Sent!</h3>
              <p className="text-xs text-[#555B63]">
                If an account exists with <strong>{email}</strong>, we have dispatched instructions to reset your password.
              </p>
              <Link href="/login" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
                Send Reset Instructions
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#555B63] hover:text-[#202124] inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
