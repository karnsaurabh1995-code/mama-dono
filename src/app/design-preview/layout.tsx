import React from 'react';
import { StudioHeaderBar } from '@/components/design-preview/StudioHeaderBar';

export const metadata = {
  title: 'dokind Design Studio | Visual Editing & UI Prototyping',
  description: 'Isolated visual design studio for dokind crowdfunding platform in Rocket.new Visual Edit mode.',
};

export default function DesignPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#202124] antialiased">
      {/* Top Floating Studio Header Bar */}
      <StudioHeaderBar />

      {/* Main Preview Area */}
      <main className="relative">{children}</main>
    </div>
  );
}
