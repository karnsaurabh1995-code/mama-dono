import type { Metadata, Viewport } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth/context';
import { getServerSession } from '@/lib/auth/server';
import { AuthUIProvider } from '@/providers/AuthUIProvider';
import { LoginModal } from '@/components/auth/LoginModal';
import { ScreenFitProvider } from '@/components/common/ScreenFitProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF9F6',
};

export const metadata: Metadata = {
  title: 'dokind — Transparent Crowdfunding & Compassionate Giving in India',
  description:
    'Small acts. Real impact. Support urgent pediatric surgeries, rural child education, hospital meals, and verified grassroots non-profits across India with 100% transparent Section 80G tax benefits.',
  keywords: [
    'dokind',
    'crowdfunding India',
    'medical fundraiser',
    '80G tax benefit donation',
    'verified NGO donation',
    'Give.do alternative',
    'DonateKart alternative',
    'monthly giving India',
    'product giving',
  ],
  authors: [{ name: 'dokind Foundation' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dokind.org.in'),
  icons: {
    icon: '/dokind-icon.svg',
    shortcut: '/dokind-icon.svg',
    apple: '/dokind-icon.svg',
  },
  openGraph: {
    title: 'dokind — Small acts. Real impact. Transparent Indian Crowdfunding',
    description:
      'Verified crowdfunding for emergency surgeries, child education, food relief, and audited grassroots non-profits.',
    url: 'https://dokind.org.in',
    siteName: 'dokind',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'dokind India Crowdfunding',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dokind — India’s Trusted Giving Platform',
    description:
      'Support verified medical and educational campaigns in India with 80G tax deduction receipts.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getServerSession();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#202124]">
        <AuthProvider initialUser={initialUser}>
          <AuthUIProvider>
            <ScreenFitProvider>
              <Suspense fallback={<div className="h-20 bg-white border-b border-[#E8E6E1]" />}>
                <Header />
              </Suspense>
              <main className="flex-1">
                <Suspense fallback={<div className="py-20 text-center text-xs text-neutral-400">Loading...</div>}>
                  {children}
                </Suspense>
              </main>
              <Footer />
              <LoginModal />
            </ScreenFitProvider>
          </AuthUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
