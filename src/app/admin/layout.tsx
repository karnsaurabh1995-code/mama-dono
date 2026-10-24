'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';
import { DokindLogo, DokindMark } from '@/components/common/DokindLogo';
import {
  LayoutDashboard,
  Paintbrush,
  Layers,
  Palette,
  Image as ImageIcon,
  HeartHandshake,
  CheckSquare,
  Bookmark,
  Building2,
  DollarSign,
  ArrowRightLeft,
  CreditCard,
  RotateCcw,
  Undo2,
  BarChart3,
  FileSpreadsheet,
  Users,
  BookOpen,
  Quote,
  FileInput,
  Mail,
  Send,
  Globe2,
  Megaphone,
  LifeBuoy,
  History,
  Workflow,
  Settings,
  Shield,
  Tag,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Lock,
  UserCheck,
  HelpCircle,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  roles?: UserRole[];
}

interface SidebarGroup {
  groupTitle: string;
  items: SidebarItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  // Dynamic badge counts from DB
  const pendingApprovalsCount = db.getCampaigns().filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
  const pendingNGOsCount = db.getOrganizations().filter((o) => o.verificationStatus === 'pending').length;
  const pendingWiresCount = db.getManualDonations({ status: 'pending' }).length;

  const sidebarGroups: SidebarGroup[] = [
    {
      groupTitle: 'Core & Experience',
      items: [
        { id: '1', label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { id: '2', label: 'Website Builder', href: '/admin/website-builder', icon: Paintbrush },
        { id: '3', label: 'Pages & Content', href: '/admin/pages', icon: Layers },
        { id: '4', label: 'Theme & Appearance', href: '/admin/theme', icon: Palette },
        { id: '5', label: 'Media Library', href: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      groupTitle: 'Campaigns & Causes',
      items: [
        { id: '6', label: 'Campaigns Control', href: '/admin/campaigns', icon: HeartHandshake },
        {
          id: '7',
          label: 'Campaign Approvals',
          href: '/admin/campaigns/approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { id: '8', label: 'Causes & Categories', href: '/admin/causes', icon: Bookmark },
        {
          id: '9',
          label: 'Organizations & KYC',
          href: '/admin/organizations',
          icon: Building2,
          badge: pendingNGOsCount > 0 ? pendingNGOsCount : undefined,
          badgeColor: 'bg-blue-500 text-white',
        },
      ],
    },
    {
      groupTitle: 'Finances & Gateway',
      items: [
        { id: '10', label: 'Donations Ledger', href: '/admin/donations', icon: DollarSign },
        {
          id: '11',
          label: 'Transactions & Wire',
          href: '/admin/transactions',
          icon: ArrowRightLeft,
          badge: pendingWiresCount > 0 ? pendingWiresCount : undefined,
          badgeColor: 'bg-emerald-600 text-white',
        },
        { id: '12', label: 'Payment Gateways', href: '/admin/payment-gateways', icon: CreditCard },
        { id: '13', label: 'Recurring Subscriptions', href: '/admin/recurring', icon: RotateCcw },
        { id: '14', label: 'Refunds Engine', href: '/admin/refunds', icon: Undo2, badge: '1', badgeColor: 'bg-rose-500 text-white' },
      ],
    },
    {
      groupTitle: 'Intelligence & Team',
      items: [
        { id: '15', label: 'Financial Analytics', href: '/admin/analytics', icon: BarChart3 },
        { id: '15b', label: 'Campaign Analytics', href: '/admin/analytics/campaigns', icon: BarChart3 },
        { id: '16', label: 'Export Reports', href: '/admin/reports', icon: FileSpreadsheet },
        { id: '17', label: 'Users & Permissions', href: '/admin/users', icon: Users },
      ],
    },
    {
      groupTitle: 'CMS & Growth',
      items: [
        { id: '18', label: 'Blog & Impact Stories', href: '/admin/blogs', icon: BookOpen },
        { id: '18b', label: 'FAQ Management', href: '/admin/faqs', icon: HelpCircle },
        { id: '19', label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
        { id: '20', label: 'Forms & Leads', href: '/admin/forms', icon: FileInput },
        { id: '21', label: 'Email Templates', href: '/admin/email-templates', icon: Mail },
        { id: '22', label: 'Newsletter & Marketing', href: '/admin/newsletter', icon: Send },
        { id: '23', label: 'SEO & URL Redirects', href: '/admin/seo', icon: Globe2 },
        { id: '24', label: 'Announcements & Placements', href: '/admin/announcements', icon: Megaphone },
      ],
    },
    {
      groupTitle: 'System & Security',
      items: [
        { id: '25', label: 'Support Desk', href: '/admin/support', icon: LifeBuoy },
        { id: '26', label: 'Audit Logs Ledger', href: '/admin/audit-logs', icon: History },
        { id: '27', label: 'Integrations & Webhooks', href: '/admin/integrations', icon: Workflow },
        { id: '28', label: 'Settings & Backups', href: '/admin/settings', icon: Settings },
        { id: '28b', label: 'Badge & Tag Styles', href: '/admin/settings/badge-styles', icon: Tag },
      ],
    },
  ];

  // RBAC permission check: Check if current role has permission to see item
  const canAccess = (item: SidebarItem): boolean => {
    if (!role || role === 'super_admin') return true;
    if (role === 'finance') {
      return ['1', '10', '11', '12', '13', '14', '15', '16', '26'].includes(item.id);
    }
    if (role === 'reviewer') {
      return ['1', '6', '7', '8', '9', '25'].includes(item.id);
    }
    if (role === 'content_editor') {
      return ['1', '2', '3', '4', '5', '18', '19', '21', '24'].includes(item.id);
    }
    if (role === 'ops_admin') {
      return !['4', '12', '27', '28'].includes(item.id);
    }
    return true;
  };

  // Filter items by search
  const filteredGroups = sidebarGroups.map((g) => ({
    ...g,
    items: g.items.filter(
      (item) =>
        canAccess(item) &&
        (menuSearch === '' || item.label.toLowerCase().includes(menuSearch.toLowerCase()))
    ),
  })).filter((g) => g.items.length > 0);

  // Generate breadcrumb
  const currentPathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbTitle = currentPathSegments.length > 1
    ? currentPathSegments[currentPathSegments.length - 1].replace(/-/g, ' ').toUpperCase()
    : 'OVERVIEW';

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex text-[#202124] font-sans antialiased">
      {/* ----------------- DESKTOP SIDEBAR ----------------- */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#E2E4E9] bg-white transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#E2E4E9] flex items-center justify-between px-4 bg-white">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2">
              <DokindLogo size="sm" showTagline tagline="Admin Command" />
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto" title="dokind Admin">
              <DokindMark size={32} />
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Search input in sidebar */}
        {!collapsed && (
          <div className="p-3 border-b border-[#E2E4E9] bg-neutral-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Jump to setting..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#E84B45] transition-colors"
              />
              {menuSearch && (
                <button
                  onClick={() => setMenuSearch('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Nav Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-1">
                  {group.groupTitle}
                </h4>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#E84B45] text-white shadow-sm font-semibold'
                        : 'text-[#555B63] hover:text-[#202124] hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-[#202124]'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-white text-[#E84B45]' : 'bg-neutral-200 text-neutral-800')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Live Site link */}
        <div className="p-3 border-t border-[#E2E4E9] bg-neutral-50 flex items-center justify-between">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#E84B45] transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span>View Public Site</span>}
          </Link>
        </div>
      </aside>

      {/* ----------------- MOBILE DRAWER ----------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 border-b border-[#E2E4E9] flex items-center justify-between px-4">
              <span className="font-bold text-sm">Navigation Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {filteredGroups.map((g, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-neutral-400 px-2">{g.groupTitle}</h4>
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive ? 'bg-[#E84B45] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E2E4E9] flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs">
              <Link href="/admin" className="text-neutral-400 hover:text-neutral-700 font-medium">
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className="font-bold text-[#202124] tracking-wide">{breadcrumbTitle}</span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Live simulation banner indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Test Mode Active
            </div>

            {/* Role Switcher for Pair-Programming & Verification */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E4E9] bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                title="Switch active role to test RBAC gating"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="capitalize">{role?.replace('_', ' ') || 'Admin'}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {roleSwitcherOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E2E4E9] py-1.5 z-50 text-xs"
                  onMouseLeave={() => setRoleSwitcherOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-neutral-100 text-[11px] text-neutral-400 font-semibold uppercase">
                    Simulate Role (RBAC)
                  </div>
                  {[
                    { r: 'super_admin' as const, label: 'Super Admin (Full Access)' },
                    { r: 'ops_admin' as const, label: 'Operations Admin' },
                    { r: 'reviewer' as const, label: 'Medical Reviewer' },
                    { r: 'finance' as const, label: 'Finance & Compliance' },
                    { r: 'content_editor' as const, label: 'Content Editor' },
                  ].map((item) => (
                    <button
                      key={item.r}
                      onClick={() => {
                        switchRole(item.r);
                        setRoleSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                        role === item.r ? 'text-[#E84B45] font-bold bg-[#E84B45]/5' : 'text-neutral-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {role === item.r && <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {(pendingApprovalsCount > 0 || pendingWiresCount > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E4E9] py-2 z-50 text-xs"
                  onMouseLeave={() => setNotificationsOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between font-bold text-neutral-700">
                    <span>Notifications & Action Items</span>
                    <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                      {pendingApprovalsCount + pendingNGOsCount + pendingWiresCount} New
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {pendingApprovalsCount > 0 && (
                      <Link
                        href="/admin/campaigns/approvals"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingApprovalsCount} Fundraiser(s) Awaiting Review
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Verify hospital billing estimates & identity proofs.
                        </p>
                      </Link>
                    )}
                    {pendingWiresCount > 0 && (
                      <Link
                        href="/admin/transactions"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingWiresCount} Offline Bank Wire(s) Pending
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Match bank UTRs with trust account deposits.
                        </p>
                      </Link>
                    )}
                    {pendingNGOsCount > 0 && (
                      <Link
                        href="/admin/organizations"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingNGOsCount} NGO Darpan Applications
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Verify 12A/80G status on Income Tax portal.
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile summary */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-[#E84B45]/10 text-[#E84B45] font-bold flex items-center justify-center text-xs border border-[#E84B45]/20">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-[#202124] leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-neutral-400 capitalize">
                  {role?.replace('_', ' ') || 'Super Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
