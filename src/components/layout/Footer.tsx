'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DokindLogo } from '../common/DokindLogo';

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  if (pathname.startsWith('/admin')) {
    return null;
  }


  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#1A1B1E] text-[#A1A7B2] pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center group inline-flex">
              <DokindLogo variant="light" size="lg" />
            </Link>

            <p className="text-sm leading-relaxed text-[#B3B9C4] max-w-sm">
              India’s transparent crowdfunding platform bridging donors directly to emergency surgeries, child education, food relief, and audited grassroots non-profit missions.
            </p>

            {/* Trust and Compliance Badges */}
            <div className="pt-2 flex flex-col gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#25845B]" />
                <span>NITI Aayog NGO-Darpan Portal Recognized</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>256-bit Bank Grade Encrypted Razorpay Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25845B]" />
                <span>Section 80G Tax Exemption Receipts (Form 10BE)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Causes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/causes/medical" className="hover:text-white transition-colors">
                  Medical Emergencies
                </Link>
              </li>
              <li>
                <Link href="/causes/education" className="hover:text-white transition-colors">
                  Child Education & STEM
                </Link>
              </li>
              <li>
                <Link href="/causes/food-hunger" className="hover:text-white transition-colors">
                  Food & Daily Meals
                </Link>
              </li>
              <li>
                <Link href="/causes/animals" className="hover:text-white transition-colors">
                  Animal Rescue & Care
                </Link>
              </li>
              <li>
                <Link href="/causes/disaster-relief" className="hover:text-white transition-colors">
                  Flood & Disaster Relief
                </Link>
              </li>
              <li>
                <Link href="/causes" className="text-[#E84B45] hover:underline font-medium">
                  View All 12 Causes &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Journeys */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Giving Models</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/campaigns" className="hover:text-white transition-colors">
                  Discover Campaigns
                </Link>
              </li>
              <li>
                <Link href="/monthly-giving" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Monthly Giving</span>
                  <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded font-semibold">
                    Give.do style
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/product-giving" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Product Giving</span>
                  <span className="text-[10px] bg-amber-900 text-amber-200 px-1.5 py-0.2 rounded font-semibold">
                    DonateKart style
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/start-campaign" className="hover:text-white transition-colors">
                  Start a Fundraiser
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-white transition-colors">
                  Verified NGO Directory
                </Link>
              </li>
              <li>
                <Link href="/verify-organization" className="hover:text-white transition-colors">
                  Register Your NGO
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Stay Informed</h4>
            <p className="text-xs text-[#A1A7B2]">
              Receive verified monthly impact reports, beneficiary updates, and urgent appeals.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! You are subscribed to our verified impact dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E84B45]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#E84B45] hover:bg-[#BD302D] text-white px-3 rounded-md text-xs font-medium flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <p className="text-[11px] text-neutral-500">
                  No spam. You may unsubscribe anytime in one click.
                </p>
              </form>
            )}

            <div className="pt-2 text-xs space-y-1.5 text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>+91 80 4719 2300 (Mon-Sat, 9AM-7PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>support@dokind.org.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods and Regulatory Bar */}
        <div className="py-6 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-neutral-300">Accepted Indian Payment Methods:</span>
            <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-[11px] font-mono">
              UPI (GPay / PhonePe / Paytm)
            </span>
            <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-[11px] font-mono">
              RuPay / Visa / Mastercard
            </span>
            <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-[11px] font-mono">
              Net Banking (50+ Banks)
            </span>
            <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-[11px] font-mono">
              Razorpay Secured
            </span>
          </div>

          <div className="text-[11px] text-neutral-500">
            * 50% Tax Deduction under Sec 80G available for eligible Indian donor contributions.
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 dokind Foundation. All rights reserved. Registered under Indian Societies Act.</p>

          <div className="flex items-center gap-5 flex-wrap">
            <Link href="/privacy-policy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Use
            </Link>
            <Link href="/donation-policy" className="hover:text-neutral-300 transition-colors">
              Donation & 80G Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-neutral-300 transition-colors">
              Refund Policy
            </Link>
            <Link href="/verification-policy" className="hover:text-neutral-300 transition-colors">
              Verification Policy
            </Link>
            <Link href="/campaign-guidelines" className="hover:text-neutral-300 transition-colors">
              Campaign Guidelines
            </Link>
            <Link href="/accessibility" className="hover:text-neutral-300 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
