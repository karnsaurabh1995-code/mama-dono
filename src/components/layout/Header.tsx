'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Shield,
} from 'lucide-react';
import { DokindLogo } from '../common/DokindLogo';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';
import { HeaderAccountSkeleton } from '../ui/Skeleton';
import { useLoginModal } from '@/providers/AuthUIProvider';
import { useSiteSettings } from '@/providers/SiteSettingsProvider';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, isLoaded } = useAuth();
  const { openLogin } = useLoginModal();
  const { settings } = useSiteSettings();

  // Focus search input when search popover opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search popover on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Hide public header in dedicated admin and staff workspaces
  // Guarded AFTER all hooks execute to guarantee identical hook count across all route transitions
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    return null;
  }

  const navLinks: { label: string; href: string; badge?: string }[] = [
    { label: 'Explore Campaigns', href: '/campaigns' },
    { label: 'Monthly Giving', href: '/monthly-giving' },
    { label: 'Product Giving', href: '/product-giving' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Impact', href: '/impact' },
  ];
  // Note: /causes directory remains fully supported across platform routes and search

  const getDashboardHref = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'super_admin':
      case 'admin':
      case 'support_admin':
      case 'ops_admin':
      case 'marketer':
      case 'content_writer':
      case 'content_editor':
      case 'reviewer':
      case 'finance':
      case 'support_staff':
      case 'campaign_manager':
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  // Staff roles authorized to access the Admin / Staff workspace
  const isAuthorizedStaff =
    user &&
    ![
      'donor',
      'fundraiser',
      'organization_manager',
    ].includes(user.role);

  return (
    <>
      {settings.maintenanceMode && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b border-amber-600">
          <Shield className="w-3.5 h-3.5" />
          <span>{settings.maintenanceMessage || 'Platform maintenance in progress. All donations and campaigns remain secure.'}</span>
        </div>
      )}
      {!settings.maintenanceMode && settings.topBanner && (
        <div className={`px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 border-b ${
          settings.topBanner.type === 'urgent'
            ? 'bg-[#EF4949] text-white border-red-700'
            : settings.topBanner.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-700'
            : 'bg-[#202124] text-white border-neutral-700'
        }`}>
          <span>{settings.topBanner.message}</span>
          {settings.topBanner.link && (
            <Link href={settings.topBanner.link} className="underline font-bold ml-1 hover:opacity-80">
              Learn more &rarr;
            </Link>
          )}
        </div>
      )}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE7E2] transition-all shadow-xs">
      <div className="w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 lg:gap-6 xl:gap-8">
          {/* 1. LEFT REGION: dokind Wordmark (starts flush with zero excess transparent padding) */}
          <Link
            href="/"
            className="flex items-center shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4949] rounded-lg -ml-1 sm:-ml-1.5 lg:-ml-2"
            aria-label="dokind home"
          >
            <DokindLogo variant="dark" size="md" showTagline={false} />
          </Link>

          {/* 2. MIDDLE REGION: Desktop Navigation Links (Centralized and biased slightly right) */}
          <nav
            className="hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-9 shrink-0 mx-auto lg:translate-x-2 xl:translate-x-4"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] xl:text-[14px] 2xl:text-[14.5px] font-medium transition-colors hover:text-[#EF4949] py-1.5 px-2 xl:px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
                    isActive ? 'text-[#EF4949] font-bold' : 'text-[#4A5056] hover:bg-neutral-100/60'
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

          {/* 3. RIGHT REGION: Actions in strict sequence:
              (1) Compact Search Icon,
              (2) Donate Now (#EF4949),
              (3) Start a Fundraiser,
              (4) User Profile Chip / Login */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-3.5 shrink-0 pl-2 xl:pl-4">
            {/* Action 1: Compact Search Icon & Popover */}
            <div className="relative" ref={searchContainerRef}>
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${
                  searchOpen
                    ? 'border-[#EF4949] bg-[#FFF0EF] text-[#EF4949]'
                    : 'border-[#EAE7E2] hover:border-neutral-300 text-[#555B63] hover:text-[#202124] hover:bg-[#FAF9F6]'
                }`}
                aria-label="Search fundraisers and causes"
                aria-expanded={searchOpen}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Accessible Search Popover */}
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search causes, NGOs, surgeries..."
                      className="w-full bg-[#FAF9F6] border border-[#EAE7E2] rounded-xl pl-9 pr-8 py-2 text-xs text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949]/20"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                        aria-label="Clear search input"
                      >
                        ✕
                      </button>
                    )}
                  </form>
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Press Enter to search</span>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      Close (Esc)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action 2: Donate Now Button (#EF4949) */}
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 bg-[#EF4949] hover:bg-[#D9363E] text-white px-4.5 xl:px-5.5 py-2.5 rounded-full font-bold text-xs xl:text-sm shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Heart className="w-4 h-4 fill-white shrink-0" />
              <span>Donate Now</span>
            </Link>

            {/* Action 3: Start a Fundraiser */}
            <Link
              href="/start-campaign"
              className="inline-flex items-center gap-2 border border-[#EAE7E2] text-[#202124] hover:bg-[#FAF9F6] hover:border-neutral-300 rounded-full font-semibold px-4.5 xl:px-5 py-2.5 text-xs xl:text-sm transition-colors whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#EF4949] shrink-0" />
              <span>Start a Fundraiser</span>
            </Link>

            {/* Action 4: User Profile Chip (NO role badge, clean avatar fallback) */}
            <div className="relative">
              {!isLoaded ? (
                <HeaderAccountSkeleton variant="desktop" />
              ) : user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full border border-[#E8E6E1] hover:bg-[#FAF9F6] transition-colors cursor-pointer whitespace-nowrap"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7.5 h-7.5 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <span className="text-xs xl:text-sm font-semibold text-[#202124] max-w-[110px] xl:max-w-[140px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>

                  {/* Account Dropdown Menu */}
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
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="inline-flex items-center justify-center text-xs xl:text-sm font-semibold text-[#202124] hover:text-[#EF4949] px-4.5 xl:px-5 py-2.5 rounded-full hover:bg-[#FAF9F6] border border-[#EAE7E2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          {/* 4. MOBILE / TABLET CONTROLS */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Tablet Quick Fundraiser CTA */}
            <Link
              href="/start-campaign"
              className="hidden sm:inline-flex items-center gap-1 border border-[#EAE7E2] text-[#202124] hover:bg-[#FAF9F6] rounded-full font-semibold px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#EF4949] shrink-0" />
              <span>Start Fundraiser</span>
            </Link>

            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 150);
              }}
              className="p-2 text-[#555B63] hover:text-[#202124] rounded-lg hover:bg-neutral-100 focus:outline-none"
              aria-label="Search fundraisers"
            >
              <Search className="w-5 h-5" />
            </button>

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

      {/* 5. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EAE7E2] bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search causes, NGOs, surgeries..."
              className="w-full bg-[#FAF9F6] border border-[#EAE7E2] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949]"
            />
          </form>

          {/* Navigation Links */}
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

          {/* Mobile Actions */}
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

            {/* Mobile Account / Dashboard Action */}
            {!isLoaded ? (
              <HeaderAccountSkeleton variant="mobile" />
            ) : user ? (
              <div className="space-y-2 pt-1">
                {isAuthorizedStaff && (
                  <Link
                    href={getDashboardHref(user.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#202124] text-white hover:bg-black transition-colors"
                  >
                    Staff Workspace
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold border border-[#EAE7E2] text-[#202124] hover:bg-neutral-100 transition-colors"
                >
                  My Account ({user.name.split(' ')[0]})
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLogin();
                }}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-[#202124] hover:bg-neutral-100 border border-[#EAE7E2] transition-colors cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
