'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Package,
  Calendar,
  LogOut,
  SlidersHorizontal,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout, switchRole } = useAuth();

  const navLinks = [
    { label: 'Explore Causes', href: '/causes' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Monthly Giving', href: '/monthly-giving', highlight: true },
    { label: 'Product Giving', href: '/product-giving' },
    { label: 'Impact', href: '/impact' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  const getDashboardHref = (role: UserRole | null) => {
    switch (role) {
      case 'super_admin':
      case 'ops_admin':
      case 'reviewer':
      case 'finance':
      case 'content_editor':
        return '/admin';
      case 'fundraiser':
        return '/fundraiser/dashboard';
      case 'organization_manager':
        return '/fundraiser/dashboard';
      default:
        return '/account';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E6E1] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84B45] to-[#BD302D] flex items-center justify-center text-white shadow-md shadow-[#E84B45]/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white stroke-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-[#202124] leading-none flex items-center">
                  Seva<span className="text-[#E84B45]">Setu</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#25845B] mt-0.5">
                  India’s Trust Bridge
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#E84B45] ${
                      isActive ? 'text-[#E84B45] font-semibold' : 'text-[#555B63]'
                    } ${
                      link.highlight
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-full'
                        : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Shortcut */}
              <Link
                href="/search"
                className="p-2 text-[#555B63] hover:text-[#202124] hover:bg-neutral-100 rounded-full transition-colors"
                title="Search campaigns"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Start Campaign */}
              <Link href="/start-campaign">
                <Button variant="outline" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Start a Campaign
                </Button>
              </Link>

              {/* User Account / Role Switcher Menu */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-[#E8E6E1] hover:bg-[#FAF9F6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-200 border border-neutral-300">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 m-1.5 text-neutral-600" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#202124] max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] bg-neutral-100 text-[#555B63] px-1.5 py-0.5 rounded font-mono uppercase">
                      {user.role === 'super_admin' ? 'admin' : user.role}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="md">
                      Log In
                    </Button>
                  </Link>
                )}

                {/* Account Dropdown */}
                {userDropdownOpen && user && (
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
                        <SlidersHorizontal className="w-4 h-4 text-[#E84B45]" />
                        <span>Go to Dashboard</span>
                      </Link>
                      <Link
                        href="/account/donations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-[#555B63]"
                      >
                        <Heart className="w-4 h-4" />
                        <span>My Donations & 80G Receipts</span>
                      </Link>
                      <Link
                        href="/account/recurring"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-[#555B63]"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Monthly Giving Mandates</span>
                      </Link>
                    </div>

                    {/* Role Simulator for Pair-Programming & QA Testing */}
                    <div className="px-4 py-2 border-t border-neutral-100 bg-[#FAF9F6]">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Test Different Roles
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <button
                          onClick={() => switchRole('donor')}
                          className={`text-left px-2 py-1 rounded text-[11px] ${
                            user.role === 'donor' ? 'bg-[#E84B45] text-white font-medium' : 'hover:bg-neutral-200'
                          }`}
                        >
                          Donor
                        </button>
                        <button
                          onClick={() => switchRole('fundraiser')}
                          className={`text-left px-2 py-1 rounded text-[11px] ${
                            user.role === 'fundraiser' ? 'bg-[#E84B45] text-white font-medium' : 'hover:bg-neutral-200'
                          }`}
                        >
                          Fundraiser
                        </button>
                        <button
                          onClick={() => switchRole('organization_manager')}
                          className={`text-left px-2 py-1 rounded text-[11px] ${
                            user.role === 'organization_manager' ? 'bg-[#E84B45] text-white font-medium' : 'hover:bg-neutral-200'
                          }`}
                        >
                          NGO Partner
                        </button>
                        <button
                          onClick={() => switchRole('super_admin')}
                          className={`text-left px-2 py-1 rounded text-[11px] ${
                            user.role === 'super_admin' ? 'bg-[#E84B45] text-white font-medium' : 'hover:bg-neutral-200'
                          }`}
                        >
                          Administrator
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Donate Button */}
              <Link href="/campaigns">
                <Button variant="primary" size="md" className="font-semibold px-5">
                  Donate Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Link href="/search" className="p-2 text-[#555B63]">
                <Search className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#202124] hover:bg-neutral-100 rounded-lg focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E6E1] bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-base font-medium ${
                    pathname === link.href ? 'bg-[#FFF0EF] text-[#E84B45]' : 'text-[#202124] hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
              <Link href="/start-campaign" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Start a Campaign
                </Button>
              </Link>
              <Link href="/campaigns" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center font-semibold">
                  Donate Now
                </Button>
              </Link>
              {user ? (
                <Link href={getDashboardHref(user.role)} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    Dashboard ({user.role})
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">
                    Sign In / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
