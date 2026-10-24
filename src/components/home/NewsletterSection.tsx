'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <section className="py-16 bg-[#EF4949] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
            <Mail className="w-3.5 h-3.5" />
            <span>COMMUNITY DISPATCH</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Stay Connected to the Lives You Touch
          </h2>

          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
            Receive monthly transparency audits, patient recovery milestone videos, and verified grassroots field updates directly in your inbox.
          </p>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 text-white max-w-md mx-auto flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs font-bold">
                Thank you! You are subscribed to dokind community dispatches.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-[#202124] text-xs font-medium placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-white/50"
                  required
                />
                <Button
                  type="submit"
                  size="md"
                  className="bg-[#202124] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-xl shrink-0 transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              {error && <p className="text-xs text-white/90 font-medium text-left">{error}</p>}
            </form>
          )}

          <p className="text-[11px] text-white/70">
            We respect your privacy. 100% spam-free. Unsubscribe with a single click anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
