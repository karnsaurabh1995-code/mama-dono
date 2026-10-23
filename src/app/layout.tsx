import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth/context';

export const metadata: Metadata = {
  title: 'SevaSetu — India’s Trusted Crowdfunding Platform for Medical & Social Causes',
  description:
    'Support urgent pediatric surgeries, hospital food missions, girl child scholarships, and verified grassroots NGOs across India. 100% verified campaigns with Section 80G tax benefits.',
  keywords: [
    'crowdfunding India',
    'medical fundraiser',
    '80G tax benefit donation',
    'verified NGO donation',
    'Give.do alternative',
    'DonateKart alternative',
    'monthly giving India',
  ],
  authors: [{ name: 'SevaSetu Foundation' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sevasetu.org.in'),
  openGraph: {
    title: 'SevaSetu — Bridging Trust, Transforming Lives in India',
    description:
      'Verified crowdfunding for emergency surgeries, child education, food relief, and audited grassroots non-profits.',
    url: 'https://sevasetu.org.in',
    siteName: 'SevaSetu',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'SevaSetu India Crowdfunding',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SevaSetu — India’s Trusted Giving Platform',
    description:
      'Support verified medical and educational campaigns in India with 80G tax deduction receipts.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#202124]">
        <AuthProvider>
          <Suspense fallback={<div className="h-20 bg-white border-b border-[#E8E6E1]" />}>
            <Header />
          </Suspense>
          <main className="flex-1">
            <Suspense fallback={<div className="py-20 text-center text-xs text-neutral-400">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
