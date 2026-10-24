import React from 'react';
import Link from 'next/link';
import { DokindLogo } from '@/components/common/DokindLogo';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export function PreviewFooter() {
  return (
    <footer
      data-component="PreviewFooter"
      className="bg-[#202124] text-neutral-300 pt-16 pb-12 border-t border-neutral-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <DokindLogo size="md" variant="light" />
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              dokind connects compassionate citizens with verified medical emergencies, child education missions, and essential product drives across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Section 80G Certified • NITI Aayog Darpan Accredited</span>
            </div>
          </div>

          {/* Causes */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Explore Causes</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/causes/medical" className="hover:text-white transition">Medical Surgeries</Link></li>
              <li><Link href="/causes/education" className="hover:text-white transition">Child Education</Link></li>
              <li><Link href="/causes/food-hunger" className="hover:text-white transition">Hunger Relief</Link></li>
              <li><Link href="/causes/animals" className="hover:text-white transition">Animal Rescue</Link></li>
              <li><Link href="/causes/disability" className="hover:text-white transition">Disability Support</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Programs</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/monthly-giving" className="hover:text-white transition">Monthly Changemakers</Link></li>
              <li><Link href="/product-giving" className="hover:text-white transition">Product Giving</Link></li>
              <li><Link href="/start-campaign" className="hover:text-white transition">Start a Campaign</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition">How it Works</Link></li>
              <li><Link href="/about" className="hover:text-white transition">Impact & Governance</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Support & Trust</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>support@dokind.org.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>+91 80 4719 2300</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>Connaught Place, New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} dokind Foundation. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/donation-policy" className="hover:text-white transition">Donation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
