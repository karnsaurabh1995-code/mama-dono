'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Search,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Calendar,
  LogOut,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { DokindLogo } from '../common/DokindLogo';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';
import { db } from '@/lib/db';
import { HeaderAccountSkeleton } from '../ui/Skeleton';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [utilitySearchQuery, setUtilitySearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchRole, isLoaded } = useAuth();
  const siteSettings = db.getSiteSettings();

  // Hide public header in dedicated admin and staff workspaces
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    return null;
  }

  const navLinks = [
    { label: 'Explore Campaigns', href: '/campaigns' },
    { label: 'Causes', href: '/causes' },
    { label: 'Monthly Giving', href: '/monthly-giving', badge: 'Monthly' },
    { label: 'Product Giving', href: '/product-giving' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Impact', href: '/impact' },
  ];

  const getDashboardHref = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'super_admin':
      case 'ops_admin':
      case 'reviewer':
      case 'finance':
      case 'content_editor':
        return '/admin';
      case 'head_staff':
        return '/staff/campaigns';
      case 'fundraiser':
      case 'organization_manager':
        return '/fundraiser/dashboard';
      default:
        return '/account';
    }
  };

  const handleUtilitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (utilitySearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(utilitySearchQuery.trim())}`);
      setUtilitySearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* 1. TOP UTILITY BAR (Row A: Slim bar with brand message, quick search, single Donate Now, help, and hydration-safe user status) */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE7E2] text-xs text-[#555B63] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto flex items-center justify-between gap-3 flex-nowrap">
          {/* Brand Mission Message Region (Left) */}
          <div className="flex items-center gap-2 min-w-0 shrink truncate">
            <span className="w-2 h-2 rounded-full bg-[#EF4949] shrink-0" />
            <span className="font-semibold text-[#202124] shrink-0">
              {siteSettings.tagline || 'Small acts. Real impact.'}
            </span>
            <span className="hidden sm:inline-block text-neutral-300 shrink-0">•</span>
            <span className="hidden md:inline-block text-[#555B63] truncate">
              100% verified grassroots campaigns with Section 80G tax benefit
            </span>
          </div>

          {/* Quick Utility Actions Region (Right): Search, Help, Single Donate Now, and Hydration-Safe Account Link */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11px] font-medium flex-nowrap">
            {/* Inline Controlled Quick Search Field */}
            <form onSubmit={handleUtilitySearchSubmit} className="hidden md:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={utilitySearchQuery}
                onChange={(e) => setUtilitySearchQuery(e.target.value)}
                placeholder="Search causes, NGOs..."
                className="bg-white border border-[#EAE7E2] rounded-full pl-8 pr-3 py-1 text-xs text-[#202124] placeholder-neutral-400 w-36 sm:w-44 lg:w-52 xl:w-60 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949]/20 transition-all"
              />
            </form>

            <Link
              href="/faq"
              className="hidden lg:flex items-center gap-1 hover:text-[#202124] transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Need Help?</span>
            </Link>

            {/* Row A: Single Prominent Donate Now Action */}
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1.5 bg-[#EF4949] hover:bg-[#D9363E] text-white px-3 py-1 rounded-full font-bold text-xs shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Heart className="w-3 h-3 fill-white shrink-0" />
              <span>Donate Now</span>
            </Link>

            {/* Hydration-Safe Utility Account Display */}
            <div className="min-w-[70px] text-right whitespace-nowrap shrink-0">
              {!isLoaded ? (
                <HeaderAccountSkeleton variant="utility" />
              ) : user ? (
                <Link
                  href={getDashboardHref(user.role)}
                  className="font-semibold text-[#202124] hover:text-[#EF4949] transition-colors"
                >
                  Hi, {user.name.split(' ')[0]} ({user.role === 'super_admin' ? 'admin' : user.role})
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="font-semibold text-[#202124] hover:text-[#EF4949] transition-colors"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION ROW (Row B: Dokind Logo, Main Links, Start Fundraiser, Account Menu) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE7E2] transition-all shadow-xs">
        <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-3 lg:gap-4 xl:gap-8">
            {/* dokind Wordmark with Verified Alignment */}
            <Link href="/" className="flex items-center shrink-0 group focus:outline-none" aria-label="dokind home">
              <DokindLogo variant="dark" size="md" showTagline={false} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 2xl:gap-7 shrink min-w-0" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs xl:text-sm font-medium transition-colors hover:text-[#EF4949] flex items-center gap-1.5 whitespace-nowrap ${
                      isActive ? 'text-[#EF4949] font-semibold' : 'text-[#555B63]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] bg-rose-50 text-[#EF4949] border border-rose-200/80 px-2 py-0.5 rounded-full font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
              {/* Start Campaign Action (Direct Styled Link) */}
              <Link
                href="/start-campaign"
                className="inline-flex items-center gap-1.5 border border-[#EAE7E2] text-[#202124] hover:bg-[#FAF9F6] hover:border-neutral-300 rounded-full font-semibold px-3.5 xl:px-4 py-2 text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-[#EF4949] shrink-0" />
                <span>Start a Fundraiser</span>
              </Link>

              {/* User Account / Role Switcher Menu (Hydration-Safe) */}
              <div className="relative">
                {!isLoaded ? (
                  <HeaderAccountSkeleton variant="desktop" />
                ) : user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-[#E8E6E1] hover:bg-[#FAF9F6] transition-colors cursor-pointer whitespace-nowrap"
                      aria-expanded={userDropdownOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 m-1.5 text-neutral-600" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#202124] max-w-[90px] xl:max-w-[120px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] bg-neutral-100 text-[#555B63] px-1.5 py-0.5 rounded font-mono uppercase">
                        {user.role === 'super_admin' ? 'admin' : user.role}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </button>

                    {/* Account Dropdown */}
                    {userDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="font-semibold text-[#202124]">{user.name}</p>
                          <p className="text-xs text-[#555B63] truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={getDashboardHref(user.role)}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-[#202124] font-medium"
                          >
                            <SlidersHorizontal className="w-4 h-4 text-[#EF4949]" />
                            <span>Go to Dashboard</span>
                          </Link>
                          <Link
                            href="/account/donations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-[#555B63]"
                          >
                            <Heart className="w-4 h-4 text-neutral-500" />
                            <span>My Donations & 80G Receipts</span>
                          </Link>
                          <Link
                            href="/account/recurring"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-[#555B63]"
                          >
                            <Calendar className="w-4 h-4 text-neutral-500" />
                            <span>Monthly Giving Mandates</span>
                          </Link>
                        </div>

                        {/* Role Simulator for Pair-Programming & QA Testing */}
                        <div className="px-4 py-2 border-t border-neutral-100 bg-[#FAF9F6]">
                          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                            Switch Role (Demo)
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('donor');
                                setUserDropdownOpen(false);
                              }}
                              className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                                user.role === 'donor'
                                  ? 'bg-[#EF4949] text-white font-medium'
                                  : 'hover:bg-neutral-200 text-[#202124]'
                              }`}
                            >
                              Donor
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('head_staff');
                                setUserDropdownOpen(false);
                              }}
                              className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                                user.role === 'head_staff'
                                  ? 'bg-[#EF4949] text-white font-medium'
                                  : 'hover:bg-neutral-200 text-[#202124]'
                              }`}
                            >
                              Head Staff
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('fundraiser');
                                setUserDropdownOpen(false);
                              }}
                              className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                                user.role === 'fundraiser'
                                  ? 'bg-[#EF4949] text-white font-medium'
                                  : 'hover:bg-neutral-200 text-[#202124]'
                              }`}
                            >
                              Fundraiser
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('super_admin');
                                setUserDropdownOpen(false);
                              }}
                              className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                                user.role === 'super_admin'
                                  ? 'bg-[#EF4949] text-white font-medium'
                                  : 'hover:bg-neutral-200 text-[#202124]'
                              }`}
                            >
                              Administrator
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center text-xs font-semibold text-[#202124] hover:text-[#EF4949] px-3.5 xl:px-4 py-2 rounded-full hover:bg-[#FAF9F6] border border-[#EAE7E2] transition-colors whitespace-nowrap shrink-0"
                  >
                    Log In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Tablet Quick Fundraiser CTA */}
              <Link
                href="/start-campaign"
                className="hidden sm:inline-flex items-center gap-1 border border-[#EAE7E2] text-[#202124] hover:bg-[#FAF9F6] rounded-full font-semibold px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#EF4949] shrink-0" />
                <span>Start Fundraiser</span>
              </Link>

              {/* Mobile Search Icon (only shown on < md screens since md+ has search in utility bar) */}
              <Link
                href="/search"
                className="md:hidden p-2 text-[#555B63] hover:text-[#202124]"
                aria-label="Search fundraisers"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#202124] hover:bg-neutral-100 rounded-lg focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE7E2] bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleUtilitySearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={utilitySearchQuery}
                onChange={(e) => setUtilitySearchQuery(e.target.value)}
                placeholder="Search causes, NGOs, surgeries..."
                className="w-full bg-[#FAF9F6] border border-[#EAE7E2] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949]"
              />
            </form>

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-base font-medium flex items-center justify-between ${
                    pathname === link.href
                      ? 'bg-[#FFF0EF] text-[#EF4949] font-bold'
                      : 'text-[#202124] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-rose-100 text-[#EF4949] font-bold px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
              <Link
                href="/start-campaign"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold border border-[#EAE7E2] text-[#202124] hover:bg-[#FAF9F6] transition-colors"
              >
                Start a Fundraiser
              </Link>
              <Link
                href="/campaigns"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#EF4949] hover:bg-[#D9363E] text-white transition-colors shadow-xs"
              >
                Explore Campaigns & Donate
              </Link>

              {/* Mobile Hydration-Safe Account Action */}
              {!isLoaded ? (
                <HeaderAccountSkeleton variant="mobile" />
              ) : user ? (
                <Link
                  href={getDashboardHref(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#202124] text-white hover:bg-black transition-colors"
                >
                  Dashboard ({user.role === 'super_admin' ? 'admin' : user.role})
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-[#202124] hover:bg-neutral-100 border border-[#EAE7E2] transition-colors"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
