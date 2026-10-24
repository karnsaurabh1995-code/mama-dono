'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { DokindLogo } from '@/components/common/DokindLogo';
import {
  HeartHandshake,
  Layers,
  FilePlus,
  Clock,
  Inbox,
  User,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function StaffWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();

  const navItems = [
    { label: 'Assigned Campaigns', href: '/staff/campaigns', icon: Layers },
    { label: 'Prepare New Campaign', href: '/staff/campaigns/new', icon: FilePlus },
    { label: 'Field Progress Updates', href: '/staff/updates', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#202124]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E6E1] px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <DokindLogo size="sm" />
            </Link>

            <span className="h-4 w-px bg-neutral-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                Head Staff Workspace
              </span>
              <span className="hidden md:inline-block text-xs text-neutral-400">
                Field Coordinator & Editorial Drafting
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-neutral-700">Logged in as: <strong>{user?.name || 'Priyanka Sharma (Field Lead)'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Link href="/admin">
                <button
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition"
                  title="Super Admin Control Panel"
                >
                  Admin View
                </button>
              </Link>

              <Link href="/">
                <button
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition"
                  title="Public Website"
                >
                  Live Site
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-nav Links */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#E84B45] text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-[#202124] hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
