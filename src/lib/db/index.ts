import {
  Campaign,
  Donation,
  Organization,
  ProductNeed,
  RecurringPlan,
  ImpactStory,
  BlogPost,
  FAQItem,
  AuditLog,
  SiteSettings,
  CauseMeta,
  User,
  UserRole,
  PageSection,
  PageVersion,
  ThemeConfig,
  MediaItem,
  PaymentGatewayConfig,
  ManualDonation,
  Announcement,
  DynamicForm,
  FormSubmission,
  EmailTemplate,
  RedirectRule,
  RolePermission,
} from '../types';
import { CAUSES_DATA } from '../data/causes';
import { ORGANIZATIONS_DATA } from '../data/organizations';
import { CAMPAIGNS_DATA } from '../data/campaigns';
import { PRODUCTS_DATA } from '../data/products';
import { STORIES_DATA } from '../data/stories';
import { BLOGS_DATA } from '../data/blogs';
import { FAQS_DATA } from '../data/faqs';
import { INITIAL_DONATIONS_DATA } from '../data/donations';
import { INITIAL_HOME_SECTIONS } from '../data/builder-sections';
import { INITIAL_GATEWAYS_DATA } from '../data/gateways';
import { INITIAL_MEDIA_DATA } from '../data/media';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_REDIRECT_RULES,
  INITIAL_DYNAMIC_FORMS,
  INITIAL_MANUAL_DONATIONS,
  DEFAULT_THEME_CONFIG,
  INITIAL_ROLE_PERMISSIONS,
} from '../data/marketing';
import { generateReceiptNumber } from '../utils';

// Stateful in-memory database store with cross-session fallback
class DatabaseStore {
  private campaigns: Campaign[] = [...CAMPAIGNS_DATA];
  private organizations: Organization[] = [...ORGANIZATIONS_DATA];
  private products: ProductNeed[] = [...PRODUCTS_DATA];
  private donations: Donation[] = [...INITIAL_DONATIONS_DATA];
  private stories: ImpactStory[] = [...STORIES_DATA];
  private blogs: BlogPost[] = [...BLOGS_DATA];
  private faqs: FAQItem[] = [...FAQS_DATA];
  private causes: CauseMeta[] = [...CAUSES_DATA];
  private pageSections: Record<string, PageSection[]> = {
    home: [...INITIAL_HOME_SECTIONS],
  };
  private pageVersions: Record<string, PageVersion[]> = {
    home: [
      {
        id: 'ver-home-1',
        pageSlug: 'home',
        versionNumber: 1,
        sections: [...INITIAL_HOME_SECTIONS],
        publishedAt: '2026-10-20T10:00:00Z',
        publishedBy: 'System Administrator',
        notes: 'Initial production baseline layout',
      },
    ],
  };
  private theme: ThemeConfig = { ...DEFAULT_THEME_CONFIG };
  private mediaItems: MediaItem[] = [...INITIAL_MEDIA_DATA];
  private gateways: PaymentGatewayConfig[] = [...INITIAL_GATEWAYS_DATA];
  private manualDonations: ManualDonation[] = [...INITIAL_MANUAL_DONATIONS];
  private announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  private emailTemplates: EmailTemplate[] = [...INITIAL_EMAIL_TEMPLATES];
  private redirectRules: RedirectRule[] = [...INITIAL_REDIRECT_RULES];
  private forms: DynamicForm[] = [...INITIAL_DYNAMIC_FORMS];
  private formSubmissions: FormSubmission[] = [
    {
      id: 'sub-01',
      formId: 'form-csr',
      formSlug: 'csr-partnerships',
      data: {
        companyName: 'Infosys Foundation',
        contactPerson: 'Aditi Nair',
        workEmail: 'aditi.nair@infosys.org',
        phone: '+91 80 2852 0261',
        csrBudget: '₹1 Crore - ₹5 Crore',
        preferredCauses: 'Pediatric Cardiac Surgery & Slum Literacy',
        comments: 'Interested in empaneling 5 hospitals for pediatric support in Karnataka and Maharashtra.',
      },
      status: 'in_review',
      submittedAt: '2026-10-22T14:10:00Z',
    },
  ];
  private rolePermissions: RolePermission[] = [...INITIAL_ROLE_PERMISSIONS];
  private users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'Devendra Sharma',
      email: 'admin@sevasetu.org.in',
      role: 'super_admin',
      phone: '+91 98100 23456',
      panNumber: 'ABCDE1234F',
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'usr-ops-1',
      name: 'Pooja Sundaram',
      email: 'pooja.ops@sevasetu.org.in',
      role: 'ops_admin',
      phone: '+91 98200 98765',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'usr-reviewer-1',
      name: 'Dr. Ananya Ray',
      email: 'ananya.review@sevasetu.org.in',
      role: 'reviewer',
      phone: '+91 98300 11223',
      createdAt: '2026-04-10T00:00:00Z',
    },
    {
      id: 'usr-finance-1',
      name: 'Rajesh Varma, CA',
      email: 'rajesh.finance@sevasetu.org.in',
      role: 'finance',
      phone: '+91 98400 33445',
      panNumber: 'ABCPV9988H',
      createdAt: '2026-02-20T00:00:00Z',
    },
    {
      id: 'usr-editor-1',
      name: 'Kavita Menon',
      email: 'kavita.content@sevasetu.org.in',
      role: 'content_editor',
      phone: '+91 98500 55667',
      createdAt: '2026-05-12T00:00:00Z',
    },
    {
      id: 'usr-donor-1',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      role: 'donor',
      phone: '+91 98111 22334',
      panNumber: 'AAAPM1234K',
      createdAt: '2026-06-18T00:00:00Z',
    },
  ];
  private recurringPlans: RecurringPlan[] = [
    {
      id: 'rec-1',
      userId: 'user-donor-1',
      userName: 'Rohan Mehra',
      userEmail: 'rohan.mehra@example.com',
      campaignId: 'camp-karuna-stray-rescue',
      campaignTitle: 'Emergency Medical Care & Trauma Sanctuary for 250 Stray Animals',
      amount: 1800,
      frequency: 'monthly',
      status: 'active',
      nextBillingDate: '2026-11-23',
      lastBillingDate: '2026-10-23',
      razorpaySubscriptionId: 'sub_test_animal_01',
      totalCyclesCharged: 2,
      createdAt: '2026-08-23T00:00:00Z',
    },
  ];
  private auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actorId: 'admin-1',
      actorName: 'System Administrator',
      action: 'PLATFORM_INITIALIZED',
      targetType: 'settings',
      targetId: 'global',
      details: 'SevaSetu Crowdfunding Platform v1.0 initialized with verified Indian NGO datasets.',
      timestamp: new Date().toISOString(),
    },
  ];
  private settings: SiteSettings = {
    platformName: 'SevaSetu',
    tagline: 'Bridging Trust, Transforming Lives Across India',
    contactEmail: 'support@sevasetu.org.in',
    contactPhone: '+91 80 4719 2300',
    supportAddress: 'SevaSetu Foundation, 4th Floor, Connaught Place, New Delhi - 110001',
    darpanPortalRef: 'NITI Aayog NGO-Darpan Portal Approved',
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SevaSetu2026',
    isTestMode: true,
    liveTickerEnabled: true,
    tipPercentageOptions: [0, 5, 8, 10, 15],
    minimumDonationINR: 50,
    enableTax80G: true,
    maintenanceMode: false,
    maintenanceMessage: 'SevaSetu is undergoing scheduled system upgrades. Emergency hospital escrows remain active.',
    sessionTimeoutMinutes: 60,
  };

  // Campaigns
  getCampaigns(filters?: {
    category?: string;
    type?: string;
    status?: string;
    urgent?: boolean;
    featured?: boolean;
    search?: string;
    has80G?: boolean;
    verifiedOnly?: boolean;
  }): Campaign[] {
    return this.campaigns.filter((c) => {
      if (filters?.category && filters.category !== 'all' && c.category !== filters.category) {
        return false;
      }
      if (filters?.type && filters.type !== 'all' && c.campaignType !== filters.type) {
        return false;
      }
      if (filters?.status && c.status !== filters.status) {
        return false;
      }
      if (filters?.urgent !== undefined && c.urgent !== filters.urgent) {
        return false;
      }
      if (filters?.featured !== undefined && c.featured !== filters.featured) {
        return false;
      }
      if (filters?.has80G && !c.has80G) {
        return false;
      }
      if (filters?.verifiedOnly && c.verifiedStatus !== 'verified') {
        return false;
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.shortDescription.toLowerCase().includes(query);
        const matchesOrg = (c.organizationName || '').toLowerCase().includes(query);
        const matchesBeneficiary = (c.beneficiaryName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesBeneficiary) {
          return false;
        }
      }
      return true;
    });
  }

  getCampaignBySlug(slug: string): Campaign | undefined {
    return this.campaigns.find((c) => c.slug === slug || c.id === slug);
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'raisedAmount' | 'supporterCount'>): Campaign {
    const newId = `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaign,
      id: newId,
      raisedAmount: 0,
      supporterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCampaign);
    this.createAuditLog({
      actorId: campaign.organizerId || 'anonymous',
      actorName: campaign.organizerName || 'Campaigner',
      action: 'CAMPAIGN_SUBMITTED',
      targetType: 'campaign',
      targetId: newId,
      details: `New campaign "${campaign.title}" submitted for verification.`,
    });
    return newCampaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>, actorName = 'Admin'): Campaign | undefined {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.campaigns[index] = {
      ...this.campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'CAMPAIGN_UPDATED',
      targetType: 'campaign',
      targetId: id,
      details: `Campaign updated: ${Object.keys(updates).join(', ')}`,
    });

    return this.campaigns[index];
  }

  // Organizations
  getOrganizations(): Organization[] {
    return this.organizations;
  }

  getOrganizationBySlug(slug: string): Organization | undefined {
    return this.organizations.find((o) => o.slug === slug || o.id === slug);
  }

  createOrganization(org: Omit<Organization, 'id' | 'campaignsCount' | 'totalRaised' | 'beneficiariesImpacted'>): Organization {
    const newId = `org-${Date.now()}`;
    const newOrg: Organization = {
      ...org,
      id: newId,
      campaignsCount: 0,
      totalRaised: 0,
      beneficiariesImpacted: 0,
      verificationStatus: 'pending',
    };
    this.organizations.push(newOrg);
    return newOrg;
  }

  updateOrganizationVerification(id: string, status: 'verified' | 'rejected' | 'pending', actorName = 'Admin'): Organization | undefined {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return undefined;
    org.verificationStatus = status;
    if (status === 'verified') {
      org.verifiedAt = new Date().toISOString();
    }
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: `ORGANIZATION_${status.toUpperCase()}`,
      targetType: 'organization',
      targetId: id,
      details: `Organization ${org.name} verification status updated to ${status}.`,
    });
    return org;
  }

  // Products
  getProducts(): ProductNeed[] {
    return this.products;
  }

  getProductById(id: string): ProductNeed | undefined {
    return this.products.find((p) => p.id === id);
  }

  // Donations & Payments
  getDonations(filters?: { campaignId?: string; donorEmail?: string; status?: string }): Donation[] {
    return this.donations.filter((d) => {
      if (filters?.campaignId && d.campaignId !== filters.campaignId) return false;
      if (filters?.donorEmail && d.donorEmail.toLowerCase() !== filters.donorEmail.toLowerCase()) return false;
      if (filters?.status && d.status !== filters.status) return false;
      return true;
    });
  }

  getDonationById(id: string): Donation | undefined {
    return this.donations.find((d) => d.id === id || d.razorpayOrderId === id);
  }

  createDonationOrder(params: {
    campaignId: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    donorPan?: string;
    isAnonymous: boolean;
    amount: number;
    tipAmount: number;
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'razorpay_simulated';
    isRecurring?: boolean;
    message?: string;
  }): Donation {
    const campaign = this.getCampaignById(params.campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      throw new Error(`Campaign cannot accept donations because its status is ${campaign.status}`);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const donationId = `don-${Date.now()}`;
    const totalAmount = params.amount + params.tipAmount;

    const donation: Donation = {
      id: donationId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      donorName: params.donorName.trim() || 'Well Wisher',
      donorEmail: params.donorEmail.trim(),
      donorPhone: params.donorPhone?.trim(),
      donorPan: params.donorPan?.trim().toUpperCase(),
      isAnonymous: params.isAnonymous,
      amount: params.amount,
      tipAmount: params.tipAmount,
      totalAmount,
      currency: 'INR',
      status: 'pending',
      paymentMethod: params.paymentMethod,
      razorpayOrderId: orderId,
      receiptNumber: generateReceiptNumber(),
      taxExemption80G: campaign.has80G && !!params.donorPan,
      message: params.message?.trim(),
      isRecurring: !!params.isRecurring,
      recurringFrequency: params.isRecurring ? 'monthly' : undefined,
      createdAt: new Date().toISOString(),
    };

    this.donations.unshift(donation);
    return donation;
  }

  verifyAndCompletePayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }): Donation {
    const donation = this.donations.find((d) => d.razorpayOrderId === params.razorpayOrderId);
    if (!donation) {
      throw new Error(`Donation order ${params.razorpayOrderId} not found.`);
    }

    // Idempotency: if already succeeded, return cleanly
    if (donation.status === 'succeeded') {
      return donation;
    }

    // Mark succeeded
    donation.status = 'succeeded';
    donation.razorpayPaymentId = params.razorpayPaymentId;
    donation.razorpaySignature = params.razorpaySignature || 'sig_verified_mock_sha256';

    // Recalculate campaign totals
    const campaign = this.getCampaignById(donation.campaignId);
    if (campaign) {
      campaign.raisedAmount += donation.amount;
      campaign.supporterCount += 1;
      campaign.updatedAt = new Date().toISOString();

      // If campaign goal achieved
      if (campaign.raisedAmount >= campaign.goalAmount && campaign.status === 'active') {
        // keep active or mark fully funded flag
      }
    }

    // Check if this was a recurring subscription
    if (donation.isRecurring) {
      const planId = `rec-${Date.now()}`;
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      this.recurringPlans.unshift({
        id: planId,
        userId: donation.donorEmail,
        userName: donation.donorName,
        userEmail: donation.donorEmail,
        campaignId: donation.campaignId,
        campaignTitle: donation.campaignTitle,
        amount: donation.amount,
        frequency: 'monthly',
        status: 'active',
        nextBillingDate: nextMonth.toISOString().split('T')[0],
        lastBillingDate: new Date().toISOString().split('T')[0],
        razorpaySubscriptionId: `sub_${params.razorpayPaymentId}`,
        totalCyclesCharged: 1,
        createdAt: new Date().toISOString(),
      });
    }

    // Log audit
    this.createAuditLog({
      actorId: donation.donorEmail,
      actorName: donation.donorName,
      action: 'PAYMENT_VERIFIED',
      targetType: 'donation',
      targetId: donation.id,
      details: `Payment of ₹${donation.amount} (Total ₹${donation.totalAmount}) verified. Receipt: ${donation.receiptNumber}`,
    });

    return donation;
  }

  processRefund(donationId: string, reason: string, actorName = 'Finance Team'): Donation {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error('Donation not found');
    if (donation.status !== 'succeeded') throw new Error('Only successful donations can be refunded');

    donation.status = 'refunded';

    // Reverse from campaign totals
    const campaign = this.getCampaignById(donation.campaignId);
    if (campaign) {
      campaign.raisedAmount = Math.max(0, campaign.raisedAmount - donation.amount);
      campaign.supporterCount = Math.max(0, campaign.supporterCount - 1);
      campaign.updatedAt = new Date().toISOString();
    }

    this.createAuditLog({
      actorId: 'finance-1',
      actorName,
      action: 'DONATION_REFUNDED',
      targetType: 'donation',
      targetId: donation.id,
      reason,
      details: `Donation ${donation.id} (₹${donation.amount}) refunded to original payment method. Reason: ${reason}`,
    });

    return donation;
  }

  // Recurring Plans
  getRecurringPlans(userEmail?: string): RecurringPlan[] {
    if (userEmail) {
      return this.recurringPlans.filter((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase());
    }
    return this.recurringPlans;
  }

  cancelRecurringPlan(planId: string, userEmail: string): RecurringPlan | undefined {
    const plan = this.recurringPlans.find((p) => p.id === planId);
    if (!plan) return undefined;
    plan.status = 'cancelled';
    this.createAuditLog({
      actorId: userEmail,
      actorName: plan.userName,
      action: 'RECURRING_PLAN_CANCELLED',
      targetType: 'donation',
      targetId: planId,
      details: `Recurring support for "${plan.campaignTitle}" cancelled by donor.`,
    });
    return plan;
  }

  // Stories, Blogs, FAQs
  getStories(): ImpactStory[] {
    return this.stories;
  }

  getStoryBySlug(slug: string): ImpactStory | undefined {
    return this.stories.find((s) => s.slug === slug || s.id === slug);
  }

  getBlogs(): BlogPost[] {
    return this.blogs;
  }

  getBlogBySlug(slug: string): BlogPost | undefined {
    return this.blogs.find((b) => b.slug === slug || b.id === slug);
  }

  getFAQs(category?: string): FAQItem[] {
    if (!category || category === 'all') return this.faqs;
    return this.faqs.filter((f) => f.category === category);
  }

  // Settings & Audit Logs
  getSiteSettings(): SiteSettings {
    return { ...this.settings };
  }

  updateSiteSettings(newSettings: Partial<SiteSettings>, actorName = 'Admin'): SiteSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'SITE_SETTINGS_UPDATED',
      targetType: 'settings',
      targetId: 'global',
      details: `Settings updated: ${Object.keys(newSettings).join(', ')}`,
    });
    return this.settings;
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  getPlatformStats() {
    const activeCampaigns = this.campaigns.filter((c) => c.status === 'active').length;
    const verifiedNGOs = this.organizations.filter((o) => o.verificationStatus === 'verified').length;
    const successfulDonations = this.donations.filter((d) => d.status === 'succeeded');
    const totalRaised = successfulDonations.reduce((acc, curr) => acc + curr.amount, 0);
    const totalDonorsCount = successfulDonations.length;
    const activeRecurring = this.recurringPlans.filter((p) => p.status === 'active').length;

    return {
      activeCampaigns,
      verifiedNGOs,
      totalRaised,
      totalDonorsCount,
      activeRecurring,
      documentedBeneficiaries: 18450 + totalDonorsCount,
    };
  }

  // ---------------- WEBSITE BUILDER ----------------
  getPageSections(pageSlug: string): PageSection[] {
    if (!this.pageSections[pageSlug]) {
      // Default to empty or cloned home sections
      this.pageSections[pageSlug] = [...INITIAL_HOME_SECTIONS].map((s) => ({
        ...s,
        id: `sec-${pageSlug}-${Math.random().toString(36).substring(2, 7)}`,
        pageSlug,
      }));
    }
    return [...this.pageSections[pageSlug]].sort((a, b) => a.order - b.order);
  }

  updatePageSections(pageSlug: string, sections: PageSection[], actorName = 'Admin'): PageSection[] {
    this.pageSections[pageSlug] = sections.map((s, idx) => ({ ...s, order: idx }));
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'PAGE_SECTIONS_DRAFT_SAVED',
      targetType: 'settings',
      targetId: pageSlug,
      details: `Saved ${sections.length} draft sections for page "${pageSlug}"`,
    });
    return this.pageSections[pageSlug];
  }

  publishPageSections(pageSlug: string, actorName = 'Admin'): { success: boolean; version: number } {
    const currentSections = this.getPageSections(pageSlug);
    const existingVersions = this.pageVersions[pageSlug] || [];
    const nextVer = existingVersions.length + 1;

    const newVersion: PageVersion = {
      id: `ver-${pageSlug}-${nextVer}`,
      pageSlug,
      versionNumber: nextVer,
      sections: JSON.parse(JSON.stringify(currentSections)),
      publishedAt: new Date().toISOString(),
      publishedBy: actorName,
      notes: `Published live version #${nextVer} by ${actorName}`,
    };

    if (!this.pageVersions[pageSlug]) {
      this.pageVersions[pageSlug] = [];
    }
    this.pageVersions[pageSlug].unshift(newVersion);

    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'PAGE_SECTIONS_PUBLISHED',
      targetType: 'settings',
      targetId: pageSlug,
      details: `Published live version #${nextVer} for page "${pageSlug}" with ${currentSections.length} sections`,
    });

    return { success: true, version: nextVer };
  }

  getPageVersions(pageSlug: string): PageVersion[] {
    return this.pageVersions[pageSlug] || [];
  }

  restorePageVersion(pageSlug: string, versionNumber: number, actorName = 'Admin'): PageSection[] {
    const versions = this.pageVersions[pageSlug] || [];
    const target = versions.find((v) => v.versionNumber === versionNumber);
    if (!target) throw new Error(`Version #${versionNumber} not found for page ${pageSlug}`);

    this.pageSections[pageSlug] = JSON.parse(JSON.stringify(target.sections));
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'PAGE_VERSION_RESTORED',
      targetType: 'settings',
      targetId: pageSlug,
      details: `Restored page "${pageSlug}" to version #${versionNumber}`,
    });
    return this.pageSections[pageSlug];
  }

  resetPageSectionsToDefault(pageSlug: string, actorName = 'Admin'): PageSection[] {
    this.pageSections[pageSlug] = JSON.parse(JSON.stringify(INITIAL_HOME_SECTIONS)).map((s: PageSection) => ({
      ...s,
      pageSlug,
    }));
    this.publishPageSections(pageSlug, actorName);
    return this.pageSections[pageSlug];
  }

  // ---------------- THEME & APPEARANCE ----------------
  getThemeConfig(): ThemeConfig {
    return { ...this.theme };
  }

  updateThemeConfig(updates: Partial<ThemeConfig>, actorName = 'Admin'): ThemeConfig {
    this.theme = { ...this.theme, ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'THEME_UPDATED',
      targetType: 'settings',
      targetId: 'theme',
      details: `Updated theme settings: ${Object.keys(updates).join(', ')}`,
    });
    return this.theme;
  }

  resetThemeConfig(actorName = 'Admin'): ThemeConfig {
    this.theme = { ...DEFAULT_THEME_CONFIG };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'THEME_RESET',
      targetType: 'settings',
      targetId: 'theme',
      details: 'Theme reset to default brand guidelines',
    });
    return this.theme;
  }

  // ---------------- MEDIA LIBRARY ----------------
  getMediaItems(filters?: { type?: string; search?: string }): MediaItem[] {
    return this.mediaItems.filter((item) => {
      if (filters?.type && filters.type !== 'all' && item.fileType !== filters.type) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesFilename = item.filename.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTag && !matchesFilename) return false;
      }
      return true;
    });
  }

  getMediaItemById(id: string): MediaItem | undefined {
    return this.mediaItems.find((m) => m.id === id);
  }

  addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>, actorName = 'Admin'): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.mediaItems.unshift(newItem);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'MEDIA_UPLOADED',
      targetType: 'settings',
      targetId: newItem.id,
      details: `Uploaded media: ${newItem.filename} (${newItem.fileSizeKB} KB)`,
    });
    return newItem;
  }

  updateMediaItem(id: string, updates: Partial<MediaItem>, actorName = 'Admin'): MediaItem | undefined {
    const idx = this.mediaItems.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.mediaItems[idx] = { ...this.mediaItems[idx], ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'MEDIA_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Updated metadata for media ${this.mediaItems[idx].filename}`,
    });
    return this.mediaItems[idx];
  }

  deleteMediaItem(id: string, actorName = 'Admin'): boolean {
    const idx = this.mediaItems.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    const item = this.mediaItems[idx];
    this.mediaItems.splice(idx, 1);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'MEDIA_DELETED',
      targetType: 'settings',
      targetId: id,
      details: `Deleted media asset: ${item.filename}`,
    });
    return true;
  }

  // ---------------- PAYMENT GATEWAYS ----------------
  getGateways(): PaymentGatewayConfig[] {
    return this.gateways;
  }

  getGatewayById(id: string): PaymentGatewayConfig | undefined {
    return this.gateways.find((g) => g.id === id);
  }

  updateGatewayConfig(id: string, updates: Partial<PaymentGatewayConfig>, actorName = 'Admin'): PaymentGatewayConfig | undefined {
    const idx = this.gateways.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    this.gateways[idx] = { ...this.gateways[idx], ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'GATEWAY_CONFIG_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Payment gateway "${id}" settings modified: ${Object.keys(updates).join(', ')}`,
    });
    return this.gateways[idx];
  }

  simulateGatewayWebhook(gatewayId: string, event: string, payload: Record<string, any>): { success: boolean; message: string } {
    const gw = this.getGatewayById(gatewayId);
    if (!gw) return { success: false, message: 'Gateway not found' };

    const webhookRecord = {
      id: `whk-${Date.now()}`,
      event,
      payloadPreview: JSON.stringify(payload).substring(0, 140),
      status: 'processed' as const,
      timestamp: new Date().toISOString(),
    };
    gw.recentWebhooks.unshift(webhookRecord);
    if (gw.recentWebhooks.length > 20) gw.recentWebhooks.pop();

    this.createAuditLog({
      actorId: 'webhook-runner',
      actorName: 'Gateway Webhook Ingestion',
      action: 'WEBHOOK_PROCESSED',
      targetType: 'settings',
      targetId: gatewayId,
      details: `Simulated ${event} webhook processed cleanly for ${gw.name}`,
    });

    return { success: true, message: `Webhook ${event} successfully processed and signed.` };
  }

  // ---------------- MANUAL / OFFLINE DONATIONS & RECONCILIATION ----------------
  getManualDonations(filters?: { status?: string; campaignId?: string }): ManualDonation[] {
    return this.manualDonations.filter((d) => {
      if (filters?.status && filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters?.campaignId && filters.campaignId !== 'all' && d.campaignId !== filters.campaignId) return false;
      return true;
    });
  }

  createManualDonation(
    params: Omit<ManualDonation, 'id' | 'createdAt' | 'status' | 'reconciledBy' | 'reconciledAt'>,
    actorName = 'Finance Team'
  ): ManualDonation {
    const id = `man-don-${Date.now()}`;
    const newDonation: ManualDonation = {
      ...params,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.manualDonations.unshift(newDonation);

    this.createAuditLog({
      actorId: 'finance-1',
      actorName,
      action: 'MANUAL_DONATION_LOGGED',
      targetType: 'donation',
      targetId: id,
      details: `Manual offline bank donation of ₹${params.amount} logged for "${params.campaignTitle}". UTR: ${params.paymentReference}`,
    });

    return newDonation;
  }

  reconcileManualDonation(
    id: string,
    status: 'approved' | 'rejected',
    actorName = 'Finance Team',
    notes?: string
  ): ManualDonation | undefined {
    const donation = this.manualDonations.find((d) => d.id === id);
    if (!donation) return undefined;

    donation.status = status;
    donation.reconciledBy = actorName;
    donation.reconciledAt = new Date().toISOString();
    if (notes) donation.notes = `${donation.notes || ''} | Reconcile note: ${notes}`;

    if (status === 'approved') {
      // Create official platform donation record so campaign progress updates
      const campaign = this.getCampaignById(donation.campaignId);
      if (campaign) {
        campaign.raisedAmount += donation.amount;
        campaign.supporterCount += 1;
        campaign.updatedAt = new Date().toISOString();
      }

      // Record in main donations ledger
      const officialDonation: Donation = {
        id: `don-wire-${Date.now()}`,
        campaignId: donation.campaignId,
        campaignTitle: donation.campaignTitle,
        campaignSlug: campaign?.slug || donation.campaignId,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        donorPan: donation.donorPan,
        isAnonymous: false,
        amount: donation.amount,
        tipAmount: 0,
        totalAmount: donation.amount,
        currency: 'INR',
        status: 'succeeded',
        paymentMethod: 'netbanking',
        razorpayOrderId: donation.paymentReference,
        razorpayPaymentId: donation.paymentReference,
        receiptNumber: generateReceiptNumber(),
        taxExemption80G: donation.taxExemption80G,
        message: donation.notes,
        isRecurring: false,
        createdAt: new Date().toISOString(),
      };
      this.donations.unshift(officialDonation);
    }

    this.createAuditLog({
      actorId: 'finance-1',
      actorName,
      action: `MANUAL_DONATION_${status.toUpperCase()}`,
      targetType: 'donation',
      targetId: id,
      details: `Offline transfer of ₹${donation.amount} ${status} by ${actorName}. Ref: ${donation.paymentReference}`,
    });

    return donation;
  }

  // ---------------- ANNOUNCEMENTS ----------------
  getAnnouncements(placement?: string): Announcement[] {
    return this.announcements.filter((a) => {
      if (placement && a.placement !== placement) return false;
      return true;
    });
  }

  createAnnouncement(ann: Omit<Announcement, 'id'>, actorName = 'Admin'): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    this.announcements.unshift(newAnn);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'ANNOUNCEMENT_CREATED',
      targetType: 'settings',
      targetId: newAnn.id,
      details: `Created announcement "${newAnn.title}" for placement ${newAnn.placement}`,
    });
    return newAnn;
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>, actorName = 'Admin'): Announcement | undefined {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.announcements[idx] = { ...this.announcements[idx], ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'ANNOUNCEMENT_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Updated announcement ${this.announcements[idx].title}`,
    });
    return this.announcements[idx];
  }

  deleteAnnouncement(id: string, actorName = 'Admin'): boolean {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'ANNOUNCEMENT_DELETED',
      targetType: 'settings',
      targetId: id,
      details: `Removed announcement ${id}`,
    });
    return true;
  }

  // ---------------- EMAIL TEMPLATES ----------------
  getEmailTemplates(): EmailTemplate[] {
    return this.emailTemplates;
  }

  getEmailTemplateById(id: string): EmailTemplate | undefined {
    return this.emailTemplates.find((t) => t.id === id);
  }

  updateEmailTemplate(id: string, updates: Partial<EmailTemplate>, actorName = 'Admin'): EmailTemplate | undefined {
    const idx = this.emailTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.emailTemplates[idx] = {
      ...this.emailTemplates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'EMAIL_TEMPLATE_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Email template "${this.emailTemplates[idx].name}" updated`,
    });
    return this.emailTemplates[idx];
  }

  // ---------------- DYNAMIC FORMS & SUBMISSIONS ----------------
  getForms(): DynamicForm[] {
    return this.forms;
  }

  getFormBySlug(slug: string): DynamicForm | undefined {
    return this.forms.find((f) => f.slug === slug || f.id === slug);
  }

  submitForm(slug: string, data: Record<string, any>): FormSubmission {
    const form = this.getFormBySlug(slug);
    if (!form) throw new Error(`Form ${slug} not found`);

    const submission: FormSubmission = {
      id: `sub-${Date.now()}`,
      formId: form.id,
      formSlug: form.slug,
      data,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };

    this.formSubmissions.unshift(submission);
    form.submissionsCount += 1;

    this.createAuditLog({
      actorId: 'form-respondent',
      actorName: (data.contactPerson || data.name || 'Anonymous User') as string,
      action: 'FORM_SUBMITTED',
      targetType: 'settings',
      targetId: submission.id,
      details: `Submission received for form "${form.title}"`,
    });

    return submission;
  }

  getFormSubmissions(formSlug?: string): FormSubmission[] {
    if (formSlug && formSlug !== 'all') {
      return this.formSubmissions.filter((s) => s.formSlug === formSlug);
    }
    return this.formSubmissions;
  }

  updateSubmissionStatus(
    id: string,
    status: FormSubmission['status'],
    notes?: string
  ): FormSubmission | undefined {
    const sub = this.formSubmissions.find((s) => s.id === id);
    if (!sub) return undefined;
    sub.status = status;
    if (notes) sub.notes = notes;
    return sub;
  }

  // ---------------- REDIRECT RULES ----------------
  getRedirectRules(): RedirectRule[] {
    return this.redirectRules;
  }

  createRedirectRule(rule: Omit<RedirectRule, 'id' | 'hits' | 'createdAt'>, actorName = 'Admin'): RedirectRule {
    const newRule: RedirectRule = {
      ...rule,
      id: `red-${Date.now()}`,
      hits: 0,
      createdAt: new Date().toISOString(),
    };
    this.redirectRules.unshift(newRule);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'REDIRECT_RULE_CREATED',
      targetType: 'settings',
      targetId: newRule.id,
      details: `Created ${rule.statusCode} redirect from ${rule.fromPath} -> ${rule.toPath}`,
    });
    return newRule;
  }

  updateRedirectRule(id: string, updates: Partial<RedirectRule>, actorName = 'Admin'): RedirectRule | undefined {
    const idx = this.redirectRules.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.redirectRules[idx] = { ...this.redirectRules[idx], ...updates };
    return this.redirectRules[idx];
  }

  deleteRedirectRule(id: string, actorName = 'Admin'): boolean {
    const idx = this.redirectRules.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.redirectRules.splice(idx, 1);
    return true;
  }

  recordRedirectHit(fromPath: string): RedirectRule | undefined {
    const rule = this.redirectRules.find((r) => r.fromPath.toLowerCase() === fromPath.toLowerCase() && r.isActive);
    if (rule) {
      rule.hits += 1;
    }
    return rule;
  }

  // ---------------- USERS & ROLES ----------------
  getUsers(): User[] {
    return this.users;
  }

  updateUserRole(userId: string, newRole: UserRole, actorName = 'Admin'): User | undefined {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return undefined;
    const oldRole = user.role;
    user.role = newRole;
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'USER_ROLE_CHANGED',
      targetType: 'user',
      targetId: userId,
      details: `User ${user.name} (${user.email}) role changed from ${oldRole} to ${newRole}`,
    });
    return user;
  }

  getRolePermissions(): RolePermission[] {
    return this.rolePermissions;
  }

  updateRolePermissions(role: UserRole, permissions: string[], actorName = 'Admin'): RolePermission | undefined {
    const rp = this.rolePermissions.find((r) => r.role === role);
    if (!rp) return undefined;
    rp.permissions = permissions;
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'ROLE_PERMISSIONS_UPDATED',
      targetType: 'settings',
      targetId: role,
      details: `Updated permission matrix for role "${rp.name}"`,
    });
    return rp;
  }

  // ---------------- CAUSES MANAGEMENT ----------------
  getCauses(): CauseMeta[] {
    return this.causes;
  }

  updateCause(id: string, updates: Partial<CauseMeta>, actorName = 'Admin'): CauseMeta | undefined {
    const idx = this.causes.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return undefined;
    this.causes[idx] = { ...this.causes[idx], ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'CAUSE_CATEGORY_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Updated cause category: ${this.causes[idx].name}`,
    });
    return this.causes[idx];
  }

  createCause(cause: CauseMeta, actorName = 'Admin'): CauseMeta {
    this.causes.push(cause);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'CAUSE_CATEGORY_CREATED',
      targetType: 'settings',
      targetId: cause.id,
      details: `Added new cause category: ${cause.name}`,
    });
    return cause;
  }

  // ---------------- COMPREHENSIVE ADMIN ANALYTICS ----------------
  getAdminMetrics(periodDays = 30) {
    const successfulDonations = this.donations.filter((d) => d.status === 'succeeded');
    const grossSuccessfulAmount = successfulDonations.reduce((acc, curr) => acc + curr.amount, 0);

    const refundedDonations = this.donations.filter((d) => d.status === 'refunded');
    const totalRefundedAmount = refundedDonations.reduce((acc, curr) => acc + curr.amount, 0);

    // Platform accounting: Net Recognized = Gross - Refunds
    const netRecognizedAmount = grossSuccessfulAmount - totalRefundedAmount;
    const totalSuccessfulCount = successfulDonations.length;
    const averageDonationAmount = totalSuccessfulCount > 0 ? Math.round(grossSuccessfulAmount / totalSuccessfulCount) : 0;

    const activeCampaigns = this.campaigns.filter((c) => c.status === 'active').length;
    const pausedCampaigns = this.campaigns.filter((c) => c.status === 'paused').length;
    const completedCampaigns = this.campaigns.filter((c) => c.status === 'completed').length;
    const suspendedCampaigns = this.campaigns.filter((c) => c.status === 'suspended').length;
    const submittedCampaigns = this.campaigns.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;

    const verifiedNGOs = this.organizations.filter((o) => o.verificationStatus === 'verified').length;
    const pendingNGOs = this.organizations.filter((o) => o.verificationStatus === 'pending').length;

    const pendingPayments = this.donations.filter((d) => d.status === 'pending').length;
    const failedPayments = this.donations.filter((d) => d.status === 'failed').length;

    const activeRecurring = this.recurringPlans.filter((p) => p.status === 'active').length;
    const recurringFailures = 0; // In our simulated dataset

    const refundsAwaitingAction = 1; // Simulated queue
    const pendingReconciliations = this.manualDonations.filter((m) => m.status === 'pending').length;

    // Traffic and conversion metrics
    const trafficSources = [
      { source: 'Direct / Word of Mouth', visitors: 42100, donors: 1240, conversionRate: '2.95%' },
      { source: 'WhatsApp Shares & Appeals', visitors: 28400, donors: 1890, conversionRate: '6.65%' },
      { source: 'Organic Google Search (80G, Surgery)', visitors: 35600, donors: 920, conversionRate: '2.58%' },
      { source: 'Instagram & Facebook Causes', visitors: 22100, donors: 640, conversionRate: '2.90%' },
      { source: 'Corporate CSR Portals', visitors: 4500, donors: 310, conversionRate: '6.89%' },
    ];

    const categoryBreakdown = this.causes.map((cause) => {
      const causeCamps = this.campaigns.filter((c) => c.category === cause.id);
      const raised = causeCamps.reduce((acc, c) => acc + c.raisedAmount, 0);
      return {
        id: cause.id,
        name: cause.name,
        campaignsCount: causeCamps.length,
        raisedAmount: raised,
      };
    }).sort((a, b) => b.raisedAmount - a.raisedAmount);

    return {
      grossSuccessfulAmount,
      totalRefundedAmount,
      netRecognizedAmount,
      totalSuccessfulCount,
      averageDonationAmount,
      activeCampaigns,
      pausedCampaigns,
      completedCampaigns,
      suspendedCampaigns,
      submittedCampaigns,
      verifiedNGOs,
      pendingNGOs,
      pendingPayments,
      failedPayments,
      activeRecurring,
      recurringFailures,
      refundsAwaitingAction,
      pendingReconciliations,
      trafficSources,
      categoryBreakdown,
      periodDays,
    };
  }

  // ---------------- SYSTEM BACKUP & RESTORE ----------------
  exportDatabaseSnapshot(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        campaigns: this.campaigns,
        organizations: this.organizations,
        products: this.products,
        donations: this.donations,
        recurringPlans: this.recurringPlans,
        pageSections: this.pageSections,
        pageVersions: this.pageVersions,
        theme: this.theme,
        mediaItems: this.mediaItems,
        gateways: this.gateways,
        manualDonations: this.manualDonations,
        announcements: this.announcements,
        emailTemplates: this.emailTemplates,
        redirectRules: this.redirectRules,
        forms: this.forms,
        formSubmissions: this.formSubmissions,
        settings: this.settings,
        auditLogs: this.auditLogs,
      },
      null,
      2
    );
  }

  importDatabaseSnapshot(jsonData: string, actorName = 'Admin'): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.campaigns) this.campaigns = parsed.campaigns;
      if (parsed.organizations) this.organizations = parsed.organizations;
      if (parsed.donations) this.donations = parsed.donations;
      if (parsed.pageSections) this.pageSections = parsed.pageSections;
      if (parsed.theme) this.theme = parsed.theme;
      if (parsed.gateways) this.gateways = parsed.gateways;
      if (parsed.settings) this.settings = parsed.settings;

      this.createAuditLog({
        actorId: 'admin-1',
        actorName,
        action: 'DATABASE_RESTORED',
        targetType: 'settings',
        targetId: 'snapshot',
        details: `Platform database state successfully restored from snapshot timestamp ${parsed.timestamp}`,
      });
      return true;
    } catch (err) {
      console.error('Failed to restore database snapshot:', err);
      return false;
    }
  }

}

// Global Singleton to ensure persistence across Hot Module Reloading in Next.js development
declare global {
  var __sevasetu_db__: DatabaseStore | undefined;
}

export const db = global.__sevasetu_db__ || new DatabaseStore();

if (process.env.NODE_ENV !== 'production') {
  global.__sevasetu_db__ = db;
}
