'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/db';
import { BrushStrokeFrame } from './BrushStrokeFrame';

interface NewsletterSectionProps {
  customImageUrl?: string;
  customAlt?: string;
  customFrameStyle?: 'organic_brush' | 'watercolor_edge' | 'subtle_splatter' | 'clean_rounded';
  customFocalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  customImagePosition?: 'left' | 'right';
  customFrameSize?: 'normal' | 'large' | 'compact';
}

export function NewsletterSection({
  customImageUrl,
  customAlt,
  customFrameStyle,
  customFocalPoint,
  customImagePosition,
  customFrameSize,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const settings = db.getSiteSettings();
  const imageUrl = customImageUrl !== undefined ? customImageUrl : settings.newsletterImageUrl;
  const imageAlt = customAlt !== undefined ? customAlt : (settings.newsletterImageAlt || 'Children supported by dokind grassroots campaign');
  const frameStyle = customFrameStyle || settings.newsletterFrameStyle || 'organic_brush';
  const focalPoint = customFocalPoint || settings.newsletterFocalPoint || 'center';
  const imagePosition = customImagePosition || settings.newsletterImagePosition || 'right';
  const frameSize = customFrameSize || settings.newsletterFrameSize || 'normal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  return (
    <section className="py-16 sm:py-20 bg-[#EF4949] text-white relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {hasImage ? (
          /* Two-Column Responsive Layout (Desktop: Side-by-side; Mobile: Stacked) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Form Column */}
            <div
              className={`lg:col-span-7 space-y-6 text-left ${
                imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'
              }`}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                <Mail className="w-3.5 h-3.5" />
                <span>COMMUNITY DISPATCH</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Stay Connected to the Lives You Touch
              </h2>

              <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
                Receive monthly transparency audits, patient recovery milestone videos, and verified grassroots field updates directly in your inbox.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>100% Verified Hospital Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Direct Beneficiary Stories</span>
                </div>
              </div>

              {submitted ? (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 text-white max-w-lg flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">You are subscribed!</h4>
                    <p className="text-xs text-white/80">Thank you for joining the dokind community dispatches.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-lg space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-xl bg-white text-[#202124] text-xs font-medium placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-white/50 shadow-xs"
                      required
                    />
                    <Button
                      type="submit"
                      size="md"
                      className="bg-[#202124] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-xl shrink-0 transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Button>
                  </div>
                  {error && <p className="text-xs text-white font-semibold">{error}</p>}
                </form>
              )}

              <p className="text-[11px] text-white/70">
                We respect your privacy. 100% spam-free. Unsubscribe with a single click anytime.
              </p>
            </div>

            {/* Artwork Column with Brush Stroke Decorative Frame */}
            <div
              className={`lg:col-span-5 flex justify-center ${
                imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              <BrushStrokeFrame
                imageUrl={imageUrl!}
                altText={imageAlt}
                frameStyle={frameStyle}
                focalPoint={focalPoint}
                frameSize={frameSize}
                className="w-full max-w-md"
              />
            </div>
          </div>
        ) : (
          /* Centered Fallback Layout (When Image is Removed) */
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
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>
                </div>
                {error && <p className="text-xs text-white/90 font-medium text-left">{error}</p>}
              </form>
            )}

            <p className="text-[11px] text-white/70">
              We respect your privacy. 100% spam-free. Unsubscribe with a single click anytime.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
