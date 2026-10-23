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
} from '../types';
import { CAUSES_DATA } from '../data/causes';
import { ORGANIZATIONS_DATA } from '../data/organizations';
import { CAMPAIGNS_DATA } from '../data/campaigns';
import { PRODUCTS_DATA } from '../data/products';
import { STORIES_DATA } from '../data/stories';
import { BLOGS_DATA } from '../data/blogs';
import { FAQS_DATA } from '../data/faqs';
import { INITIAL_DONATIONS_DATA } from '../data/donations';
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

  // Platform Metrics
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
}

// Global Singleton to ensure persistence across Hot Module Reloading in Next.js development
declare global {
  var __sevasetu_db__: DatabaseStore | undefined;
}

export const db = global.__sevasetu_db__ || new DatabaseStore();

if (process.env.NODE_ENV !== 'production') {
  global.__sevasetu_db__ = db;
}
