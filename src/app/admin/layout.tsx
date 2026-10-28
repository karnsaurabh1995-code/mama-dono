'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';
import { DokindLogo, DokindMark } from '@/components/common/DokindLogo';
import {
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  HeartHandshake,
  DollarSign,
  FileSpreadsheet,
  BookOpen,
  Shield,
  LayoutList,
  Paintbrush,
  Layers,
  Bookmark,
  Building2,
  ImageIcon,
  CreditCard,
  History,
  Settings,
  KeyRound,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Lock,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  roles?: UserRole[];
  matchPrefixes?: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Bypass admin dashboard layout for dedicated admin login screen
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  const { user, role, switchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  // Dynamic pending counts from database
  const [pendingCounts, setPendingCounts] = useState<{
    approvals?: number;
    ngos?: number;
    wires?: number;
  }>({});

  useEffect(() => {
    const loadCounts = () => {
      const approvals = db.getCampaigns().filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
      const ngos = db.getOrganizations().filter((o) => o.verificationStatus === 'pending').length;
      const wires = db.getManualDonations({ status: 'pending' }).length;
      setPendingCounts({ approvals, ngos, wires });
    };

    loadCounts();

    fetch('/api/admin/pending-counts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.approvals === 'number') {
          setPendingCounts({
            approvals: data.approvals,
            ngos: data.ngos,
            wires: data.wires,
          });
        }
      })
      .catch(() => {
        // Fallback to local DB counts
      });
  }, []);

  // Primary 6 administrative sections
  const primaryNavItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      matchPrefixes: ['/admin$'],
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      href: '/admin/campaigns',
      icon: HeartHandshake,
      badge: pendingCounts.approvals && pendingCounts.approvals > 0 ? pendingCounts.approvals : undefined,
      badgeColor: 'bg-amber-500 text-white',
      matchPrefixes: ['/admin/campaigns'],
    },
    {
      id: 'finance',
      label: 'Finance Hub',
      href: '/admin/finance',
      icon: DollarSign,
      badge: pendingCounts.wires && pendingCounts.wires > 0 ? pendingCounts.wires : undefined,
      badgeColor: 'bg-emerald-600 text-white',
      roles: ['super_admin', 'admin', 'support_admin', 'finance'],
      matchPrefixes: ['/admin/finance', '/admin/donations', '/admin/transactions', '/admin/refunds'],
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      href: '/admin/reports',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin', 'support_admin', 'finance', 'marketer'],
      matchPrefixes: ['/admin/reports'],
    },
    {
      id: 'blogs',
      label: 'Blog Studio',
      href: '/admin/blogs',
      icon: BookOpen,
      roles: ['super_admin', 'admin', 'support_admin', 'content_writer', 'content_editor', 'marketer'],
      matchPrefixes: ['/admin/blogs'],
    },
    {
      id: 'team',
      label: 'Team & Roles',
      href: '/admin/team',
      icon: Shield,
      roles: ['super_admin', 'admin', 'support_admin'],
      matchPrefixes: ['/admin/team', '/admin/users'],
    },
  ];

  // Secondary management & configuration tools
  const secondaryNavItems: NavItem[] = [
    {
      id: 'homepage-curation',
      label: 'Homepage Placements',
      href: '/admin/homepage-curation',
      icon: LayoutList,
      roles: ['super_admin', 'admin', 'support_admin', 'marketer'],
      matchPrefixes: ['/admin/homepage-curation'],
    },
    {
      id: 'website-builder',
      label: 'Website Builder',
      href: '/admin/website-builder',
      icon: Paintbrush,
      roles: ['super_admin', 'admin', 'support_admin'],
      matchPrefixes: ['/admin/website-builder'],
    },
    {
      id: 'pages',
      label: 'Pages & Content',
      href: '/admin/pages',
      icon: Layers,
      roles: ['super_admin', 'admin', 'support_admin', 'content_writer', 'content_editor'],
      matchPrefixes: ['/admin/pages'],
    },
    {
      id: 'causes',
      label: 'Causes & Taxonomy',
      href: '/admin/causes',
      icon: Bookmark,
      roles: ['super_admin', 'admin', 'support_admin', 'campaign_manager'],
      matchPrefixes: ['/admin/causes'],
    },
    {
      id: 'organizations',
      label: 'Organizations & KYC',
      href: '/admin/organizations',
      icon: Building2,
      badge: pendingCounts.ngos && pendingCounts.ngos > 0 ? pendingCounts.ngos : undefined,
      badgeColor: 'bg-blue-500 text-white',
      roles: ['super_admin', 'admin', 'support_admin', 'reviewer', 'head_staff'],
      matchPrefixes: ['/admin/organizations'],
    },
    {
      id: 'media',
      label: 'Media Library',
      href: '/admin/media',
      icon: ImageIcon,
      roles: ['super_admin', 'admin', 'support_admin', 'content_writer', 'content_editor', 'marketer'],
      matchPrefixes: ['/admin/media'],
    },
    {
      id: 'payment-gateways',
      label: 'Payment Gateways',
      href: '/admin/payment-gateways',
      icon: CreditCard,
      roles: ['super_admin', 'admin'],
      matchPrefixes: ['/admin/payment-gateways'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs Ledger',
      href: '/admin/audit-logs',
      icon: History,
      roles: ['super_admin', 'admin', 'support_admin', 'finance'],
      matchPrefixes: ['/admin/audit-logs'],
    },
    {
      id: 'settings',
      label: 'Settings & Backups',
      href: '/admin/settings',
      icon: Settings,
      roles: ['super_admin', 'admin'],
      matchPrefixes: ['/admin/settings'],
    },
    {
      id: 'api-keys',
      label: 'API Keys & Secrets',
      href: '/admin/api-keys',
      icon: KeyRound,
      badge: 'Super Admin',
      badgeColor: 'bg-rose-100 text-[#E84B45] font-semibold text-[10px]',
      roles: ['super_admin'],
      matchPrefixes: ['/admin/api-keys'],
    },
  ];

  // RBAC permission check
  const canAccess = (item: NavItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    const evaluatedRoles: UserRole[] = [];
    if (role) evaluatedRoles.push(role);
    if (user?.secondaryRole && !evaluatedRoles.includes(user.secondaryRole) && (!role || role === user?.role)) {
      evaluatedRoles.push(user.secondaryRole);
    }
    if (evaluatedRoles.length === 0) return true;
    if (evaluatedRoles.includes('super_admin')) return true;
    return evaluatedRoles.some((r) => item.roles?.includes(r));
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    if (item.matchPrefixes) {
      return item.matchPrefixes.some((prefix) => {
        if (prefix.endsWith('$')) {
          return pathname === prefix.replace('$', '');
        }
        return pathname.startsWith(prefix);
      });
    }
    return pathname.startsWith(item.href);
  };

  const filterItems = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!canAccess(item)) return false;
      if (!menuSearch) return true;
      return item.label.toLowerCase().includes(menuSearch.toLowerCase());
    });
  };

  const visiblePrimary = filterItems(primaryNavItems);
  const visibleSecondary = filterItems(secondaryNavItems);

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
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#E2E4E9] flex items-center justify-between px-4 bg-white">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2">
              <DokindLogo size="sm" showTagline tagline="Admin Workspace" />
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto" title="Dokind Admin">
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

        {/* Quick Search in sidebar */}
        {!collapsed && (
          <div className="p-3 border-b border-[#E2E4E9] bg-neutral-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Jump to tool or setting..."
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

        {/* Scrollable Nav: Primary 6 sections + Collapsible Operations */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {/* Primary Administrative Sections */}
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-1">
                Workspace
              </h4>
            )}
            {visiblePrimary.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-[#E84B45] text-white shadow-sm'
                      : 'text-[#555B63] hover:text-[#202124] hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-neutral-500 group-hover:text-[#202124]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || (active ? 'bg-white text-[#E84B45]' : 'bg-neutral-200 text-neutral-800')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Operations & Settings */}
          {visibleSecondary.length > 0 && (
            <div className="pt-2 border-t border-neutral-100 space-y-1">
              {!collapsed ? (
                <button
                  onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 hover:text-neutral-700 transition"
                >
                  <span>Operations & Settings</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreToolsOpen ? '' : '-rotate-90'}`} />
                </button>
              ) : (
                <div className="h-px bg-neutral-200 my-2" />
              )}

              {(moreToolsOpen || menuSearch !== '' || collapsed) && (
                <div className="space-y-1 pt-1">
                  {visibleSecondary.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                          active
                            ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                            : 'text-[#6B7280] hover:text-[#202124] hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-neutral-400 group-hover:text-[#202124]'}`} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!collapsed && item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || (active ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
              <span className="font-bold text-sm">Dokind Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase text-neutral-400 px-2 pb-1">Primary Workspace</h4>
                {visiblePrimary.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        active ? 'bg-[#E84B45] text-white' : 'text-neutral-700 hover:bg-neutral-100'
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

              {visibleSecondary.length > 0 && (
                <div className="pt-2 border-t border-neutral-100 space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-neutral-400 px-2 pb-1">Operations & Settings</h4>
                  {visibleSecondary.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                          active ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E2E4E9] flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
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
            {/* Verified Admin Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="capitalize">{user?.secondaryRole ? `${(role || user.role).replace('_', ' ')} • ${user.secondaryRole.replace('_', ' ')}` : (role || user?.role || 'Super Admin').replace('_', ' ')}</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {((pendingCounts.approvals || 0) > 0 || (pendingCounts.wires || 0) > 0) && (
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
                      {(pendingCounts.approvals || 0) + (pendingCounts.ngos || 0) + (pendingCounts.wires || 0)} New
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {(pendingCounts.approvals || 0) > 0 && (
                      <Link
                        href="/admin/campaigns/approvals"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingCounts.approvals} Fundraiser(s) Awaiting Review
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Verify hospital billing estimates & identity proofs.
                        </p>
                      </Link>
                    )}
                    {(pendingCounts.wires || 0) > 0 && (
                      <Link
                        href="/admin/finance"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingCounts.wires} Offline Bank Wire(s) Pending
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Match bank UTRs with trust account deposits.
                        </p>
                      </Link>
                    )}
                    {(pendingCounts.ngos || 0) > 0 && (
                      <Link
                        href="/admin/organizations"
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-semibold text-neutral-900">
                          {pendingCounts.ngos} NGO Darpan Applications
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
                  {user?.secondaryRole
                    ? `${(role || user.role).replace('_', ' ')} • ${user.secondaryRole.replace('_', ' ')}`
                    : (role?.replace('_', ' ') || 'Super Admin')}
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/admin/auth/logout', { method: 'POST' });
                  } finally {
                    window.location.href = '/admin/login';
                  }
                }}
                title="Sign Out of Admin Console"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
