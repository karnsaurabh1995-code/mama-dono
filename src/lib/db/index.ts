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
  CampaignItemNeed,
  PhysicalItemPledge,
  CampaignRevisionSubmission,
  CampaignUpdate,
  CampaignStoryBlock,
  CampaignArtworkConfig,
  Testimonial,
  BadgeType,
  BadgeStyleConfig,
  CampaignReport,
  CampaignUpdateRequest,
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
import { INITIAL_CAMPAIGN_ITEMS } from '../data/campaign-items';
import { INITIAL_CAMPAIGN_UPDATES } from '../data/campaign-updates';
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

export const DEFAULT_BADGE_STYLES: Record<BadgeType, BadgeStyleConfig> = {
  verified: {
    id: 'verified',
    label: 'Verified Cause',
    defaultText: 'Verified Cause',
    isEnabled: true,
    backgroundColor: '#EBF7F1',
    textColor: '#15803D',
    borderColor: '#C2E8D4',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 12,
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'shield',
    iconColor: '#15803D',
    iconSize: 14,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 12,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  tax_80g: {
    id: 'tax_80g',
    label: '80G Tax Exemption',
    defaultText: '80G Tax Benefit',
    isEnabled: true,
    backgroundColor: '#F3F4F6',
    textColor: '#1F2937',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 12,
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'percent',
    iconColor: '#1F2937',
    iconSize: 14,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 12,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent Support',
    defaultText: 'Urgent Need',
    isEnabled: true,
    backgroundColor: '#FEF2F2',
    textColor: '#B91C1C',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'flame',
    iconColor: '#B91C1C',
    iconSize: 14,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 12,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  cause_category: {
    id: 'cause_category',
    label: 'Cause Category',
    defaultText: 'Category',
    isEnabled: true,
    backgroundColor: '#FEF2F2',
    textColor: '#B91C1C',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 'wider',
    paddingX: 10,
    paddingY: 4,
    icon: 'tag',
    iconColor: '#B91C1C',
    iconSize: 12,
    shadow: 'none',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 10,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  new: {
    id: 'new',
    label: 'New Campaign',
    defaultText: 'New Cause',
    isEnabled: true,
    backgroundColor: '#EFF6FF',
    textColor: '#1D4ED8',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 11,
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'sparkles',
    iconColor: '#1D4ED8',
    iconSize: 13,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 11,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  fully_funded: {
    id: 'fully_funded',
    label: 'Fully Funded',
    defaultText: '100% Funded',
    isEnabled: true,
    backgroundColor: '#ECFDF5',
    textColor: '#047857',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'check',
    iconColor: '#047857',
    iconSize: 13,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 11,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
  completed: {
    id: 'completed',
    label: 'Campaign Completed',
    defaultText: 'Mission Completed',
    isEnabled: true,
    backgroundColor: '#F5F3FF',
    textColor: '#6D28D9',
    borderColor: '#DDD6FE',
    borderWidth: 1,
    borderRadius: 'pill',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 'normal',
    paddingX: 10,
    paddingY: 4,
    icon: 'award',
    iconColor: '#6D28D9',
    iconSize: 13,
    shadow: 'xs',
    cardVariant: {
      fontSize: 10,
      paddingX: 7,
      paddingY: 2,
      iconSize: 11,
    },
    updatedAt: '2026-10-24T10:00:00Z',
  },
};

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
  private campaignItemNeeds: CampaignItemNeed[] = [...INITIAL_CAMPAIGN_ITEMS];
  private physicalItemPledges: PhysicalItemPledge[] = [
    {
      id: 'plg-01',
      campaignId: 'camp-winter-blankets-delhi',
      itemId: 'item-delhi-woolen-blanket',
      donorName: 'Radha Mohan Singhania',
      donorEmail: 'rm.singhania@gmail.com',
      donorPhone: '+91 98110 55443',
      quantity: 50,
      shippingCarrier: 'BlueDart Logistics',
      trackingNumber: 'BD-DEL-88392019',
      status: 'shipped',
      notes: 'Dispatched 5 bundles of 10 thermal blankets directly from Panipat mill to Kashmere Gate center.',
      createdAt: '2026-10-22T16:00:00Z',
    },
  ];
  private campaignRevisionSubmissions: CampaignRevisionSubmission[] = [
    {
      id: 'sub-rev-01',
      campaignId: 'camp-assam-flood-relief',
      title: 'Assam Flood Relief — Field Story & Medical Need Revision',
      slug: 'emergency-flood-ration-clean-water-kits-assam',
      submittedBy: 'user-head-staff-1',
      submittedByName: 'Priyanka Sharma (Head Staff)',
      submittedAt: '2026-10-23T11:30:00Z',
      status: 'pending_review',
      submissionNotes: 'Updated the field story with latest ground situation from Barpeta district where water levels rose 2 feet. Added new verified photos from dispatch boats.',
      proposedTitle: 'Flood Relief 2026: Deliver 2,000 Emergency Food & Clean Water Kits in Inundated Assam',
      proposedShortDescription: 'Severe monsoon flooding in Barpeta and Dhubri has submerged 850 villages. Over 1,200 families urgently require family dry rations, halogen water purification tablets, and mosquito nets.',
      proposedStory: `Monsoon flash floods in Assam's Brahmaputra valley have breached embankment spurs across Barpeta, Dhubri, and Morigaon districts, submerging more than 850 villages under 4 to 8 feet of turbulent floodwaters. Over 12,000 rural residents have taken shelter on elevated highway flanks, railway tracks, and school verandas with zero access to clean drinking water or food.

Our field teams, led by Priyanka Sharma, reached the affected flood belts on October 16th with rescue country boats. Ground assessments confirm immediate risks of waterborne gastroenteritis, acute dehydration among infants, and hypothermia in senior citizens.

With dokind's transparent item-giving model, 100% of sponsored ration kits and water filter units are procured locally from wholesale suppliers and directly handed over to displaced families under NGO Darpan registered oversight.`,
      proposedArtwork: {
        mainPosterUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
        heroImageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
        thumbnailSquareUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80',
        socialShareUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        ],
      },
    },
  ];
  private campaignUpdates: CampaignUpdate[] = [...INITIAL_CAMPAIGN_UPDATES];
  private users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'Devendra Sharma',
      email: 'admin@dokind.org.in',
      role: 'super_admin',
      phone: '+91 98100 23456',
      panNumber: 'ABCDE1234F',
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'usr-ops-1',
      name: 'Pooja Sundaram',
      email: 'pooja.ops@dokind.org.in',
      role: 'ops_admin',
      phone: '+91 98200 98765',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'user-head-staff-1',
      name: 'Priyanka Sharma (Field Lead)',
      email: 'priyanka.staff@dokind.org.in',
      role: 'head_staff',
      phone: '+91 98200 44556',
      createdAt: '2025-08-01T00:00:00Z',
    },
    {
      id: 'usr-reviewer-1',
      name: 'Dr. Ananya Ray',
      email: 'ananya.review@dokind.org.in',
      role: 'reviewer',
      phone: '+91 98300 11223',
      createdAt: '2026-04-10T00:00:00Z',
    },
    {
      id: 'usr-finance-1',
      name: 'Rajesh Varma, CA',
      email: 'rajesh.finance@dokind.org.in',
      role: 'finance',
      phone: '+91 98400 33445',
      panNumber: 'ABCPV9988H',
      createdAt: '2026-02-20T00:00:00Z',
    },
    {
      id: 'usr-editor-1',
      name: 'Kavita Menon',
      email: 'kavita.content@dokind.org.in',
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
      details: 'dokind Crowdfunding Platform v1.0 initialized with verified Indian NGO datasets.',
      timestamp: new Date().toISOString(),
    },
  ];
  private testimonials: Testimonial[] = [
    {
      id: 't-1',
      authorName: 'Dr. Suresh Sen, Chief Cardiac Surgeon',
      role: 'AIIMS Child Heart Centre',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      quote: 'dokind has eliminated critical delays for underprivileged children requiring emergency heart surgery. Funds reach the hospital account directly before surgical procedures commence.',
      rating: 5,
      featured: true,
      badge: 'Verified Surgeon',
      date: '2026-09-15',
    },
    {
      id: 't-2',
      authorName: 'Kiran Bedi Verma',
      role: 'Regular Monthly Donor (Bengaluru)',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      quote: 'Receiving instant Form 10BE tax receipts and verified video updates of rural children receiving notebooks and meals gives me 100% confidence in my monthly pledge.',
      rating: 5,
      featured: true,
      badge: 'Monthly Donor',
      date: '2026-10-02',
    },
    {
      id: 't-3',
      authorName: 'Aarav’s Father, Ramesh',
      role: 'Beneficiary Caregiver',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      quote: 'When my 3-year-old son collapsed with cardiac failure, I had no money. 2,400 compassionate donors on dokind funded his surgery within 48 hours. He is now healthy and smiling.',
      rating: 5,
      featured: true,
      badge: 'Caregiver',
      date: '2026-08-20',
    },
    {
      id: 't-4',
      authorName: 'Meenakshi Sundaram',
      role: 'Animal Welfare Trust Founder',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      quote: 'The item-based giving model on dokind allowed us to receive 150 bags of veterinary feed directly at our trauma sanctuary without worrying about procurement shortages.',
      rating: 5,
      featured: true,
      badge: 'Partner NGO',
      date: '2026-10-12',
    },
  ];
  private settings: SiteSettings = {
    platformName: 'dokind',
    tagline: 'Small acts. Real impact. Transparent Indian Crowdfunding',
    contactEmail: 'support@dokind.org.in',
    contactPhone: '+91 80 4719 2300',
    supportAddress: 'dokind Foundation, 4th Floor, Connaught Place, New Delhi - 110001',
    darpanPortalRef: 'NITI Aayog NGO-Darpan Portal Approved',
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dokind2026',
    isTestMode: true,
    liveTickerEnabled: true,
    tipPercentageOptions: [0, 5, 8, 10, 15],
    minimumDonationINR: 50,
    enableTax80G: true,
    maintenanceMode: false,
    maintenanceMessage: 'dokind is undergoing scheduled system upgrades. Emergency hospital escrows remain active.',
    sessionTimeoutMinutes: 60,
    defaultPlatformFeePercent: 5,
    platformFeeEnabled: true,
    dokindFoundationContributionOptions: [0, 1, 2, 3, 5],
    tickerMode: 'live_donations',
    trustMessages: [
      '100% Tax Deductible under Section 80G with Instant Receipts',
      'Direct Hospital & Verified NGO Escrow Disbursements',
      'Zero Platform Fee On Emergency Pediatric & Cancer Surgeries',
      'Wholesale Item Giving With Zero Markup & Live Tracking',
      'NITI Aayog NGO-Darpan Verified Grassroots Partners',
    ],
  };
  private badgeStyles: Record<BadgeType, BadgeStyleConfig> = { ...DEFAULT_BADGE_STYLES };
  private campaignReports: CampaignReport[] = [
    {
      id: 'rep-01',
      campaignId: 'camp-aarav-cancer',
      campaignTitle: 'Help 4-Year-Old Aarav Fight Acute Lymphoblastic Leukemia',
      userId: 'user-donor-1',
      userName: 'Vikramaditya Sharma',
      userEmail: 'vikram.sharma@example.com',
      reason: 'Missing Expenditure Receipts',
      explanation: 'Please provide the recent cycle 3 pharmacy invoice updates for Aarav.',
      status: 'resolved',
      createdAt: '2026-10-18T14:30:00Z',
    },
  ];
  private campaignUpdateRequests: CampaignUpdateRequest[] = [
    {
      id: 'upd-req-01',
      campaignId: 'camp-aarav-cancer',
      campaignTitle: 'Help 4-Year-Old Aarav Fight Acute Lymphoblastic Leukemia',
      userId: 'user-donor-1',
      userName: 'Vikramaditya Sharma',
      userEmail: 'vikram.sharma@example.com',
      inquiryType: 'Patient / Medical Condition',
      message: 'Kindly share an update on Aarav’s blood cell count after the recent chemo cycle.',
      status: 'answered',
      createdAt: '2026-10-19T09:15:00Z',
    },
  ];

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
    const newId = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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

  duplicateCampaignAsDraft(campaignId: string, actorName = 'Admin'): Campaign {
    const source = this.getCampaignById(campaignId);
    if (!source) {
      throw new Error(`Source campaign ${campaignId} not found.`);
    }

    const newId = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const cleanSlug = `${source.slug.replace(/-copy-[a-z0-9]+$/, '')}-copy-${Math.random().toString(36).substring(2, 6)}`;

    // Copy permitted content and configuration only (do NOT copy raisedAmount, donors, or transactions)
    const clonedCampaign: Campaign = {
      id: newId,
      slug: cleanSlug,
      title: `${source.title} (Draft Copy)`,
      shortDescription: source.shortDescription,
      story: source.story,
      category: source.category,
      campaignType: source.campaignType,
      goalAmount: source.goalAmount,
      // Fresh zero financial counters
      raisedAmount: 0,
      supporterCount: 0,
      deadline: source.deadline,
      featured: false,
      urgent: false,
      staffPick: false,
      status: 'draft',
      verifiedStatus: 'pending',
      has80G: source.has80G,
      imageUrl: source.imageUrl,
      galleryUrls: source.galleryUrls ? [...source.galleryUrls] : [],
      beneficiaryName: source.beneficiaryName,
      beneficiaryLocation: source.beneficiaryLocation,
      hospitalName: source.hospitalName,
      organizerName: source.organizerName,
      organizerRole: source.organizerRole,
      organizerId: source.organizerId,
      organizationId: source.organizationId,
      organizationName: source.organizationName,
      itemizedBudget: source.itemizedBudget.map((b) => ({
        ...b,
        id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      })),
      useOfFunds: source.useOfFunds,
      documents: source.documents ? source.documents.map((d) => ({ ...d, verified: false })) : [],
      acceptsMonetary: source.acceptsMonetary ?? true,
      acceptsItems: source.acceptsItems ?? false,
      itemDonationMode: source.itemDonationMode ?? 'both',
      internalCampaignId: `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      internalNotes: `Cloned from ${source.id} (${source.title}) by ${actorName}`,
      priority: source.priority ?? 'medium',
      campaignManager: source.campaignManager,
      storyBlocks: source.storyBlocks ? JSON.parse(JSON.stringify(source.storyBlocks)) : undefined,
      artwork: source.artwork ? JSON.parse(JSON.stringify(source.artwork)) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.unshift(clonedCampaign);

    // Duplicate item requirements with zeroed progress
    const sourceItems = this.campaignItemNeeds.filter((it) => it.campaignId === source.id);
    for (const item of sourceItems) {
      const newItemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.campaignItemNeeds.push({
        ...item,
        id: newItemId,
        campaignId: newId,
        campaignSlug: cleanSlug,
        quantityFunded: 0,
        quantityProcured: 0,
        quantityDelivered: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'CAMPAIGN_DUPLICATED_AS_DRAFT',
      targetType: 'campaign',
      targetId: newId,
      details: `Campaign "${source.title}" duplicated as draft "${clonedCampaign.title}" (ID: ${newId}). Financial metrics reset to 0.`,
    });

    return clonedCampaign;
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
    itemAllocations?: {
      itemId: string;
      itemName: string;
      unitPrice: number;
      quantity: number;
    }[];
    dokindContributionPercent?: number;
    dokindContributionAmount?: number;
    platformFeePercent?: number;
  }): Donation {
    const campaign = this.getCampaignById(params.campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      throw new Error(`Campaign cannot accept donations because its status is ${campaign.status}`);
    }

    let calculatedItemTotal = 0;
    if (params.itemAllocations && params.itemAllocations.length > 0) {
      for (const alloc of params.itemAllocations) {
        const itemNeed = this.campaignItemNeeds.find((it) => it.id === alloc.itemId);
        if (!itemNeed) {
          throw new Error(`Item need ${alloc.itemId} not found for this campaign.`);
        }
        if (!itemNeed.isActive) {
          throw new Error(`Item requirement "${itemNeed.name}" is no longer active.`);
        }
        if (itemNeed.maxPerOrder && alloc.quantity > itemNeed.maxPerOrder) {
          throw new Error(`Quantity ${alloc.quantity} exceeds maximum per order limit (${itemNeed.maxPerOrder}) for ${itemNeed.name}`);
        }
        calculatedItemTotal += alloc.unitPrice * alloc.quantity;
      }
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const donationId = `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Master Prompt 8 transparent fee & contribution calculation
    const feePercent = params.platformFeePercent ?? (this.settings.platformFeeEnabled ? this.settings.defaultPlatformFeePercent : 0);
    const platformFeeAmount = Math.round((params.amount * feePercent) / 100);
    const netCampaignAmount = params.amount - platformFeeAmount;

    const dokindContribPercent = params.dokindContributionPercent ?? 0;
    const dokindContribAmount = params.dokindContributionAmount ?? Math.round((params.amount * dokindContribPercent) / 100);

    const totalAmount = params.amount + dokindContribAmount + params.tipAmount;

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
      grossAmount: params.amount,
      platformFeePercent: feePercent,
      platformFeeAmount,
      netCampaignAmount,
      dokindContributionPercent: dokindContribPercent,
      dokindContributionAmount: dokindContribAmount,
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
      itemAllocations: params.itemAllocations,
      itemDonationTotal: calculatedItemTotal > 0 ? calculatedItemTotal : undefined,
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

    // Recalculate campaign monetary totals
    const campaign = this.getCampaignById(donation.campaignId);
    if (campaign) {
      campaign.raisedAmount += donation.amount;
      const netAllocated = donation.netCampaignAmount ?? Math.round(donation.amount * 0.95);
      campaign.netRaisedAmount = (campaign.netRaisedAmount ?? Math.max(0, Math.round((campaign.raisedAmount - donation.amount) * 0.95))) + netAllocated;
      campaign.supporterCount += 1;
      campaign.updatedAt = new Date().toISOString();
    }

    // Atomically increment item quantityFunded for each allocated item need
    if (donation.itemAllocations && donation.itemAllocations.length > 0) {
      for (const alloc of donation.itemAllocations) {
        const itemNeed = this.campaignItemNeeds.find((it) => it.id === alloc.itemId);
        if (itemNeed) {
          itemNeed.quantityFunded += alloc.quantity;
          itemNeed.updatedAt = new Date().toISOString();
        }
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
      const netAllocated = donation.netCampaignAmount ?? Math.round(donation.amount * 0.95);
      if (campaign.netRaisedAmount !== undefined) {
        campaign.netRaisedAmount = Math.max(0, campaign.netRaisedAmount - netAllocated);
      }
      campaign.supporterCount = Math.max(0, campaign.supporterCount - 1);
      campaign.updatedAt = new Date().toISOString();
    }

    // Atomically reverse item quantityFunded
    if (donation.itemAllocations && donation.itemAllocations.length > 0) {
      for (const alloc of donation.itemAllocations) {
        const itemNeed = this.campaignItemNeeds.find((it) => it.id === alloc.itemId);
        if (itemNeed) {
          itemNeed.quantityFunded = Math.max(0, itemNeed.quantityFunded - alloc.quantity);
          itemNeed.updatedAt = new Date().toISOString();
        }
      }
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

  getFAQs(category?: string, activeOnly = false, homepageOnly = false): FAQItem[] {
    let list = [...this.faqs];
    if (category && category !== 'all') {
      list = list.filter((f) => f.category === category);
    }
    if (activeOnly) {
      list = list.filter((f) => f.isActive !== false);
    }
    if (homepageOnly) {
      list = list.filter((f) => f.showOnHomepage !== false);
    }
    list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return list;
  }

  getFAQById(id: string): FAQItem | undefined {
    return this.faqs.find((f) => f.id === id);
  }

  createFAQ(data: Omit<FAQItem, 'id'>, actorName = 'Admin'): FAQItem {
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      order: data.order ?? this.faqs.length + 1,
      isActive: data.isActive ?? true,
      showOnHomepage: data.showOnHomepage ?? true,
      ...data,
    };
    this.faqs.push(newFaq);
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'FAQ_CREATED',
      targetType: 'settings',
      targetId: newFaq.id,
      details: `Created FAQ: "${newFaq.question.substring(0, 40)}..."`,
    });
    return newFaq;
  }

  updateFAQ(id: string, updates: Partial<FAQItem>, actorName = 'Admin'): FAQItem | null {
    const idx = this.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.faqs[idx] = { ...this.faqs[idx], ...updates };
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'FAQ_UPDATED',
      targetType: 'settings',
      targetId: id,
      details: `Updated FAQ ${id}`,
    });
    return this.faqs[idx];
  }

  deleteFAQ(id: string, actorName = 'Admin'): boolean {
    const idx = this.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    const deleted = this.faqs.splice(idx, 1)[0];
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'FAQ_DELETED',
      targetType: 'settings',
      targetId: id,
      details: `Deleted FAQ: "${deleted.question.substring(0, 40)}..."`,
    });
    return true;
  }

  reorderFAQs(orderedIds: string[], actorName = 'Admin'): FAQItem[] {
    orderedIds.forEach((id, index) => {
      const item = this.faqs.find((f) => f.id === id);
      if (item) item.order = index + 1;
    });
    this.createAuditLog({
      actorId: 'admin-1',
      actorName,
      action: 'FAQS_REORDERED',
      targetType: 'settings',
      targetId: 'faqs',
      details: `Reordered ${orderedIds.length} FAQs`,
    });
    return this.getFAQs();
  }

  // Testimonials
  getTestimonials(featuredOnly = false): Testimonial[] {
    if (featuredOnly) return this.testimonials.filter((t) => t.featured);
    return [...this.testimonials];
  }

  getTestimonialById(id: string): Testimonial | undefined {
    return this.testimonials.find((t) => t.id === id);
  }

  createTestimonial(data: Omit<Testimonial, 'id'>): Testimonial {
    const testimonial: Testimonial = {
      id: `t-${Date.now()}`,
      ...data,
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const idx = this.testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.testimonials[idx] = { ...this.testimonials[idx], ...updates };
    return this.testimonials[idx];
  }

  deleteTestimonial(id: string): boolean {
    const initialLen = this.testimonials.length;
    this.testimonials = this.testimonials.filter((t) => t.id !== id);
    return this.testimonials.length < initialLen;
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

  // ---------------- BADGE STYLE MANAGER (MASTER PROMPT 11) ----------------
  getBadgeStyles(): Record<BadgeType, BadgeStyleConfig> {
    return { ...this.badgeStyles };
  }

  getBadgeStyle(type: BadgeType): BadgeStyleConfig {
    return this.badgeStyles[type] || DEFAULT_BADGE_STYLES[type];
  }

  updateBadgeStyle(
    type: BadgeType,
    updates: Partial<BadgeStyleConfig>,
    actorName = 'Admin'
  ): BadgeStyleConfig {
    const current = this.badgeStyles[type] || DEFAULT_BADGE_STYLES[type];
    const updated: BadgeStyleConfig = {
      ...current,
      ...updates,
      id: type,
      cardVariant: {
        ...current.cardVariant,
        ...(updates.cardVariant || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    this.badgeStyles[type] = updated;

    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'BADGE_STYLE_UPDATED',
      targetType: 'settings',
      targetId: type,
      details: `Badge style updated for "${updated.label}" (${type})`,
    });

    return updated;
  }

  resetBadgeStyles(actorName = 'Admin'): Record<BadgeType, BadgeStyleConfig> {
    this.badgeStyles = { ...DEFAULT_BADGE_STYLES };
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'BADGE_STYLES_RESET_DEFAULT',
      targetType: 'settings',
      targetId: 'all-badges',
      details: 'All campaign badge and tag styles reset to factory defaults.',
    });
    return { ...this.badgeStyles };
  }

  // ---------------- CAMPAIGN REPORTS & MODERATION (LOGIN GATE) ----------------
  getCampaignReports(campaignId?: string): CampaignReport[] {
    if (campaignId) {
      return this.campaignReports.filter((r) => r.campaignId === campaignId);
    }
    return [...this.campaignReports];
  }

  createCampaignReport(
    report: Omit<CampaignReport, 'id' | 'createdAt' | 'status'>
  ): CampaignReport {
    const newReport: CampaignReport = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    this.campaignReports.unshift(newReport);

    this.createAuditLog({
      actorId: report.userId || report.userEmail,
      actorName: report.userName,
      action: 'CAMPAIGN_REPORTED',
      targetType: 'campaign',
      targetId: report.campaignId,
      details: `Flagged campaign: ${report.reason}. Case opened for trust & safety review.`,
    });

    return newReport;
  }

  // ---------------- CAMPAIGN UPDATE REQUESTS (LOGIN GATE) ----------------
  getCampaignUpdateRequests(campaignId?: string): CampaignUpdateRequest[] {
    if (campaignId) {
      return this.campaignUpdateRequests.filter((r) => r.campaignId === campaignId);
    }
    return [...this.campaignUpdateRequests];
  }

  createCampaignUpdateRequest(
    request: Omit<CampaignUpdateRequest, 'id' | 'createdAt' | 'status'>
  ): CampaignUpdateRequest {
    const newReq: CampaignUpdateRequest = {
      ...request,
      id: `upd-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    this.campaignUpdateRequests.unshift(newReq);

    this.createAuditLog({
      actorId: request.userId || request.userEmail,
      actorName: request.userName,
      action: 'CAMPAIGN_UPDATE_REQUESTED',
      targetType: 'campaign',
      targetId: request.campaignId,
      details: `Inquiry: ${request.inquiryType}`,
    });

    return newReq;
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

  // Master Prompt 8: Graph-based Financial & Campaign Analytics
  getDetailedFinancialAnalytics(filters?: {
    period?: 'today' | '7d' | '30d' | '90d' | 'month' | 'year' | 'custom' | string;
    startDate?: string;
    endDate?: string;
    campaignId?: string;
    status?: string;
  }) {
    let list = [...this.donations];

    if (filters?.campaignId && filters.campaignId !== 'all') {
      list = list.filter((d) => d.campaignId === filters.campaignId || d.campaignSlug === filters.campaignId);
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((d) => d.status === filters.status);
    }

    // Date filtering
    const now = new Date();
    let startTime = 0;
    if (filters?.period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTime = today.getTime();
    } else if (filters?.period === '7d' || filters?.period === '7') {
      startTime = now.getTime() - 7 * 86400000;
    } else if (filters?.period === '30d' || filters?.period === '30') {
      startTime = now.getTime() - 30 * 86400000;
    } else if (filters?.period === '90d' || filters?.period === '90') {
      startTime = now.getTime() - 90 * 86400000;
    } else if (filters?.period === 'month') {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    } else if (filters?.period === 'year' || filters?.period === '365') {
      startTime = new Date(now.getFullYear(), 0, 1).getTime();
    } else if (filters?.startDate) {
      startTime = new Date(filters.startDate).getTime();
    }

    if (startTime > 0) {
      list = list.filter((d) => new Date(d.createdAt).getTime() >= startTime);
    }
    if (filters?.endDate) {
      const endTime = new Date(filters.endDate).getTime() + 86400000;
      list = list.filter((d) => new Date(d.createdAt).getTime() <= endTime);
    }

    const successful = list.filter((d) => d.status === 'succeeded');
    const refunded = list.filter((d) => d.status === 'refunded');
    const pending = list.filter((d) => d.status === 'pending');
    const failed = list.filter((d) => d.status === 'failed');

    const grossDonations = successful.reduce((sum, d) => sum + (d.grossAmount || d.amount), 0);
    const platformFees = successful.reduce((sum, d) => sum + (d.platformFeeAmount ?? Math.round((d.grossAmount || d.amount) * 0.05)), 0);
    const dokindContributions = successful.reduce((sum, d) => sum + (d.dokindContributionAmount ?? 0), 0);
    const totalDokindAllocation = platformFees + dokindContributions;
    const refunds = refunded.reduce((sum, d) => sum + (d.grossAmount || d.amount), 0);
    const netCampaignAllocation = successful.reduce((sum, d) => sum + (d.netCampaignAmount ?? Math.round((d.grossAmount || d.amount) * 0.95)), 0);
    const totalCollected = successful.reduce((sum, d) => sum + d.totalAmount, 0);

    // Build timeline points (daily aggregation for charts)
    const dailyMap: Record<string, {
      date: string;
      label: string;
      grossAmount: number;
      netCampaignAmount: number;
      platformFeeAmount: number;
      dokindContributionAmount: number;
      donationCount: number;
    }> = {};

    const daysCount = filters?.period === '7d' ? 7 : (filters?.period === '90d' ? 30 : 14);
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      dailyMap[key] = {
        date: key,
        label,
        grossAmount: 0,
        netCampaignAmount: 0,
        platformFeeAmount: 0,
        dokindContributionAmount: 0,
        donationCount: 0,
      };
    }

    successful.forEach((d) => {
      const key = d.createdAt.split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].grossAmount += (d.grossAmount || d.amount);
        dailyMap[key].netCampaignAmount += (d.netCampaignAmount ?? Math.round((d.grossAmount || d.amount) * 0.95));
        dailyMap[key].platformFeeAmount += (d.platformFeeAmount ?? Math.round((d.grossAmount || d.amount) * 0.05));
        dailyMap[key].dokindContributionAmount += (d.dokindContributionAmount ?? 0);
        dailyMap[key].donationCount += 1;
      }
    });

    const timeline = Object.values(dailyMap);

    // Campaign Comparisons
    const campaignComparisons = this.campaigns.map((camp) => {
      const campDons = successful.filter((d) => d.campaignId === camp.id || d.campaignSlug === camp.slug);
      const campGross = campDons.reduce((sum, d) => sum + (d.grossAmount || d.amount), 0);
      const campFee = campDons.reduce((sum, d) => sum + (d.platformFeeAmount ?? Math.round((d.grossAmount || d.amount) * 0.05)), 0);
      const campContrib = campDons.reduce((sum, d) => sum + (d.dokindContributionAmount ?? 0), 0);
      const campNet = campDons.reduce((sum, d) => sum + (d.netCampaignAmount ?? Math.round((d.grossAmount || d.amount) * 0.95)), 0);

      const items = this.getCampaignItemNeeds(camp.id);
      const itemsFunded = items.reduce((s, it) => s + it.quantityFunded, 0);
      const itemsRequired = items.reduce((s, it) => s + it.quantityRequired, 0);

      return {
        id: camp.id,
        title: camp.title,
        slug: camp.slug,
        category: camp.category,
        goalAmount: camp.goalAmount,
        raisedAmount: camp.raisedAmount,
        netRaisedAmount: camp.netRaisedAmount || Math.round(camp.raisedAmount * 0.95),
        grossDonations: campGross,
        netAllocated: campNet,
        platformFee: campFee,
        dokindContribution: campContrib,
        donorsCount: camp.supporterCount,
        supporterCount: camp.supporterCount,
        completionPct: Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100)),
        itemsFunded,
        itemsRequired,
      };
    }).sort((a, b) => b.grossDonations - a.grossDonations);

    const paymentOutcomes = {
      succeeded: successful.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      total: list.length,
    };

    const allItems = this.campaignItemNeeds;
    const totalItemsFunded = allItems.reduce((s, it) => s + it.quantityFunded, 0);
    const totalItemValueFunded = allItems.reduce((s, it) => s + it.quantityFunded * it.unitPrice, 0);

    return {
      summary: {
        grossDonations,
        platformFees,
        dokindContributions,
        totalDokindAllocation,
        refunds,
        netCampaignAllocation,
        totalCollected,
        successfulDonorsCount: successful.length,
        averageGift: successful.length > 0 ? Math.round(grossDonations / successful.length) : 0,
      },
      timeline,
      campaignComparisons,
      paymentOutcomes,
      itemGivingAnalytics: {
        totalItemsFunded,
        totalItemValueFunded,
        activeNeedsCount: allItems.filter((i) => i.isActive).length,
      },
      filteredDonations: list,
    };
  }

  // ---------------- CAMPAIGN ITEM NEEDS & FULFILLMENT ----------------
  getCampaignItemNeeds(campaignId?: string): CampaignItemNeed[] {
    if (campaignId) {
      return this.campaignItemNeeds.filter((it) => it.campaignId === campaignId || it.campaignSlug === campaignId);
    }
    return this.campaignItemNeeds;
  }

  getCampaignItemNeedById(id: string): CampaignItemNeed | undefined {
    return this.campaignItemNeeds.find((it) => it.id === id);
  }

  createCampaignItemNeed(
    item: Omit<CampaignItemNeed, 'id' | 'createdAt' | 'updatedAt' | 'quantityFunded' | 'quantityProcured' | 'quantityDelivered' | 'fulfillmentStatus'> & {
      fulfillmentStatus?: CampaignItemNeed['fulfillmentStatus'];
    },
    actorName = 'Admin'
  ): CampaignItemNeed {
    const newId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: CampaignItemNeed = {
      ...item,
      id: newId,
      quantityFunded: 0,
      quantityProcured: 0,
      quantityDelivered: 0,
      quantityReserved: 0,
      isActive: item.isActive ?? true,
      donationMode: item.donationMode ?? 'both',
      fulfillmentStatus: item.fulfillmentStatus ?? 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaignItemNeeds.push(newItem);
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'CAMPAIGN_ITEM_NEED_CREATED',
      targetType: 'campaign',
      targetId: item.campaignId,
      details: `Created item requirement "${newItem.name}" (${newItem.quantityRequired} ${newItem.unit} @ ₹${newItem.unitPrice})`,
    });
    return newItem;
  }

  updateCampaignItemNeed(id: string, updates: Partial<CampaignItemNeed>, actorName = 'Admin'): CampaignItemNeed | undefined {
    const idx = this.campaignItemNeeds.findIndex((it) => it.id === id);
    if (idx === -1) return undefined;
    this.campaignItemNeeds[idx] = {
      ...this.campaignItemNeeds[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'CAMPAIGN_ITEM_NEED_UPDATED',
      targetType: 'campaign',
      targetId: this.campaignItemNeeds[idx].campaignId,
      details: `Updated item "${this.campaignItemNeeds[idx].name}": ${Object.keys(updates).join(', ')}`,
    });
    return this.campaignItemNeeds[idx];
  }

  deleteCampaignItemNeed(id: string, actorName = 'Admin'): boolean {
    const idx = this.campaignItemNeeds.findIndex((it) => it.id === id);
    if (idx === -1) return false;
    const item = this.campaignItemNeeds[idx];
    if (item.quantityFunded > 0) {
      // Do not hard delete items with financial history — safely deactivate
      item.isActive = false;
      item.updatedAt = new Date().toISOString();
      this.createAuditLog({
        actorId: 'admin-action',
        actorName,
        action: 'CAMPAIGN_ITEM_DEACTIVATED',
        targetType: 'campaign',
        targetId: item.campaignId,
        details: `Item "${item.name}" has ${item.quantityFunded} funded units; deactivated listing rather than hard deletion to preserve ledger integrity.`,
      });
      return true;
    }
    this.campaignItemNeeds.splice(idx, 1);
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'CAMPAIGN_ITEM_DELETED',
      targetType: 'campaign',
      targetId: item.campaignId,
      details: `Deleted unfunded item requirement "${item.name}"`,
    });
    return true;
  }

  recordItemProcurement(itemId: string, quantity: number, notes?: string, actorName = 'Admin'): CampaignItemNeed | undefined {
    const item = this.getCampaignItemNeedById(itemId);
    if (!item) return undefined;
    item.quantityProcured = Math.min(item.quantityRequired, item.quantityProcured + quantity);
    if (item.quantityProcured > 0 && item.fulfillmentStatus === 'pending') {
      item.fulfillmentStatus = 'procuring';
    }
    item.updatedAt = new Date().toISOString();
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'ITEM_PROCUREMENT_RECORDED',
      targetType: 'campaign',
      targetId: item.campaignId,
      details: `Procured ${quantity} ${item.unit} of "${item.name}". Total procured: ${item.quantityProcured}/${item.quantityRequired}. Notes: ${notes || 'Standard procurement'}`,
    });
    return item;
  }

  recordItemDelivery(itemId: string, quantity: number, notes?: string, evidenceUrl?: string, actorName = 'Admin'): CampaignItemNeed | undefined {
    const item = this.getCampaignItemNeedById(itemId);
    if (!item) return undefined;
    item.quantityDelivered = Math.min(item.quantityRequired, item.quantityDelivered + quantity);
    if (item.quantityDelivered >= item.quantityRequired) {
      item.fulfillmentStatus = 'delivered';
    } else if (item.quantityDelivered > 0) {
      item.fulfillmentStatus = 'dispatched';
    }
    item.updatedAt = new Date().toISOString();
    this.createAuditLog({
      actorId: 'admin-action',
      actorName,
      action: 'ITEM_DELIVERY_RECORDED',
      targetType: 'campaign',
      targetId: item.campaignId,
      details: `Verified handover of ${quantity} ${item.unit} of "${item.name}". Total delivered: ${item.quantityDelivered}/${item.quantityRequired}. Evidence: ${evidenceUrl || 'Photo & signed receipts on file'}`,
    });
    return item;
  }

  // ---------------- PHYSICAL ITEM PLEDGES ----------------
  getPhysicalItemPledges(campaignId?: string): PhysicalItemPledge[] {
    if (campaignId) {
      return this.physicalItemPledges.filter((p) => p.campaignId === campaignId);
    }
    return this.physicalItemPledges;
  }

  createPhysicalItemPledge(pledge: Omit<PhysicalItemPledge, 'id' | 'status' | 'createdAt'>): PhysicalItemPledge {
    const item = this.getCampaignItemNeedById(pledge.itemId);
    if (!item) throw new Error(`Item ${pledge.itemId} not found`);
    if (item.donationMode === 'financial_sponsor') {
      throw new Error(`Item "${item.name}" only accepts financial sponsorship, not direct physical drops.`);
    }

    const newPledge: PhysicalItemPledge = {
      ...pledge,
      id: `plg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pledged',
      createdAt: new Date().toISOString(),
    };
    this.physicalItemPledges.unshift(newPledge);
    this.createAuditLog({
      actorId: pledge.donorEmail,
      actorName: pledge.donorName,
      action: 'PHYSICAL_PLEDGE_CREATED',
      targetType: 'campaign',
      targetId: pledge.campaignId,
      details: `Donor pledged physical shipment of ${pledge.quantity} ${item.unit} of "${item.name}"`,
    });
    return newPledge;
  }

  verifyPhysicalItemPledge(pledgeId: string, verifiedBy: string, notes?: string): PhysicalItemPledge | undefined {
    const pledge = this.physicalItemPledges.find((p) => p.id === pledgeId);
    if (!pledge) return undefined;
    pledge.status = 'received_verified';
    pledge.receivedAt = new Date().toISOString();
    pledge.verifiedBy = verifiedBy;
    if (notes) pledge.notes = notes;

    // Increment delivered quantity on the item requirement
    const item = this.getCampaignItemNeedById(pledge.itemId);
    if (item) {
      item.quantityDelivered = Math.min(item.quantityRequired, item.quantityDelivered + pledge.quantity);
      if (item.quantityDelivered >= item.quantityRequired) {
        item.fulfillmentStatus = 'delivered';
      }
      item.updatedAt = new Date().toISOString();
    }

    this.createAuditLog({
      actorId: verifiedBy,
      actorName: verifiedBy,
      action: 'PHYSICAL_PLEDGE_VERIFIED',
      targetType: 'campaign',
      targetId: pledge.campaignId,
      details: `Received and verified ${pledge.quantity} physical units from ${pledge.donorName} for pledge ${pledgeId}.`,
    });
    return pledge;
  }

  // ---------------- HEAD STAFF CAMPAIGN REVISION SUBMISSIONS ----------------
  getRevisionSubmissions(status?: string, staffUserId?: string): CampaignRevisionSubmission[] {
    return this.campaignRevisionSubmissions.filter((s) => {
      if (status && status !== 'all' && s.status !== status) return false;
      if (staffUserId && s.submittedBy !== staffUserId) return false;
      return true;
    });
  }

  getRevisionSubmissionById(id: string): CampaignRevisionSubmission | undefined {
    return this.campaignRevisionSubmissions.find((s) => s.id === id);
  }

  createRevisionSubmission(
    sub: Omit<CampaignRevisionSubmission, 'id' | 'submittedAt' | 'status'>
  ): CampaignRevisionSubmission {
    const newId = `sub-rev-${Date.now()}`;
    const newSubmission: CampaignRevisionSubmission = {
      ...sub,
      id: newId,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };
    this.campaignRevisionSubmissions.unshift(newSubmission);
    this.createAuditLog({
      actorId: sub.submittedBy,
      actorName: sub.submittedByName,
      action: 'STAFF_REVISION_SUBMITTED',
      targetType: 'campaign',
      targetId: sub.campaignId || 'new-campaign-proposal',
      details: `Head Staff proposed revision for "${sub.title}" (${sub.submissionNotes || 'No notes'})`,
    });
    return newSubmission;
  }

  approveRevisionSubmission(
    id: string,
    reviewerName: string,
    reviewerNotes?: string,
    schedulePublishDate?: string
  ): CampaignRevisionSubmission | undefined {
    const sub = this.getRevisionSubmissionById(id);
    if (!sub) return undefined;

    // Apply approved changes to the campaign
    if (sub.campaignId) {
      const camp = this.getCampaignById(sub.campaignId);
      if (camp) {
        if (sub.proposedTitle) camp.title = sub.proposedTitle;
        if (sub.proposedShortDescription) camp.shortDescription = sub.proposedShortDescription;
        if (sub.proposedStory) camp.story = sub.proposedStory;
        if (sub.proposedStoryBlocks) camp.storyBlocks = sub.proposedStoryBlocks;
        if (sub.proposedArtwork) {
          camp.artwork = sub.proposedArtwork;
          if (sub.proposedArtwork.mainPosterUrl) camp.imageUrl = sub.proposedArtwork.mainPosterUrl;
          if (sub.proposedArtwork.gallery) camp.galleryUrls = sub.proposedArtwork.gallery;
        }
        if (schedulePublishDate) {
          camp.scheduledPublishDate = schedulePublishDate;
        } else {
          camp.status = 'active';
        }
        camp.updatedAt = new Date().toISOString();
      }
    } else if (sub.proposedTitle && sub.proposedStory) {
      // New campaign proposal approved by admin -> promote to live active campaign!
      const newCamp = this.createCampaign({
        slug: sub.slug || `camp-${Date.now()}`,
        title: sub.proposedTitle,
        shortDescription: sub.proposedShortDescription || sub.proposedTitle,
        story: sub.proposedStory,
        category: sub.proposedCategory || 'essential-supplies',
        campaignType: 'product',
        goalAmount: 500000,
        featured: false,
        urgent: false,
        status: schedulePublishDate ? 'draft' : 'active',
        verifiedStatus: 'verified',
        has80G: true,
        imageUrl: sub.proposedArtwork?.mainPosterUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
        beneficiaryName: sub.proposedBeneficiaryName || 'Field Community',
        beneficiaryLocation: sub.proposedBeneficiaryLocation || 'India',
        organizerName: 'SevaSetu Foundation',
        organizerRole: 'organization',
        organizerId: 'org-hope-india',
        itemizedBudget: [],
        useOfFunds: 'Direct fulfillment of essential supplies.',
        storyBlocks: sub.proposedStoryBlocks,
        artwork: sub.proposedArtwork,
      });
      sub.campaignId = newCamp.id;
    }

    sub.status = 'approved';
    sub.reviewedBy = reviewerName;
    sub.reviewedAt = new Date().toISOString();
    if (reviewerNotes) sub.reviewerNotes = reviewerNotes;

    this.createAuditLog({
      actorId: 'admin-action',
      actorName: reviewerName,
      action: 'STAFF_REVISION_APPROVED',
      targetType: 'campaign',
      targetId: sub.campaignId || id,
      details: `Administrator approved staff revision ${id}. Published changes to live campaign.`,
    });

    return sub;
  }

  rejectRevisionSubmission(id: string, reviewerName: string, rejectionReason: string): CampaignRevisionSubmission | undefined {
    const sub = this.getRevisionSubmissionById(id);
    if (!sub) return undefined;
    sub.status = 'rejected';
    sub.reviewedBy = reviewerName;
    sub.reviewedAt = new Date().toISOString();
    sub.reviewerNotes = rejectionReason;

    this.createAuditLog({
      actorId: 'admin-action',
      actorName: reviewerName,
      action: 'STAFF_REVISION_REJECTED',
      targetType: 'campaign',
      targetId: sub.campaignId || id,
      reason: rejectionReason,
      details: `Administrator rejected staff submission ${id}. Reason: ${rejectionReason}`,
    });

    return sub;
  }

  requestChangesRevisionSubmission(id: string, reviewerName: string, comments: string): CampaignRevisionSubmission | undefined {
    const sub = this.getRevisionSubmissionById(id);
    if (!sub) return undefined;
    sub.status = 'changes_requested';
    sub.reviewedBy = reviewerName;
    sub.reviewedAt = new Date().toISOString();
    sub.reviewerNotes = comments;

    this.createAuditLog({
      actorId: 'admin-action',
      actorName: reviewerName,
      action: 'STAFF_REVISION_CHANGES_REQUESTED',
      targetType: 'campaign',
      targetId: sub.campaignId || id,
      details: `Administrator requested modifications on staff revision ${id}: ${comments}`,
    });

    return sub;
  }

  // ---------------- CAMPAIGN UPDATES & FIELD PROGRESS ----------------
  getCampaignUpdates(campaignId?: string, includePending = false): CampaignUpdate[] {
    return this.campaignUpdates.filter((u) => {
      if (campaignId && u.campaignId !== campaignId) return false;
      if (!includePending && u.status !== 'published') return false;
      return true;
    });
  }

  getCampaignUpdateById(id: string): CampaignUpdate | undefined {
    return this.campaignUpdates.find((u) => u.id === id);
  }

  createCampaignUpdate(
    update: Omit<CampaignUpdate, 'id' | 'createdAt'>,
    requiresReview = true
  ): CampaignUpdate {
    const newId = `upd-${Date.now()}`;
    const newUpdate: CampaignUpdate = {
      ...update,
      id: newId,
      status: requiresReview ? 'pending_review' : 'published',
      publishedAt: requiresReview ? '' : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.campaignUpdates.unshift(newUpdate);
    this.createAuditLog({
      actorId: update.authorId || 'author',
      actorName: update.authorName,
      action: requiresReview ? 'CAMPAIGN_UPDATE_SUBMITTED' : 'CAMPAIGN_UPDATE_PUBLISHED',
      targetType: 'campaign',
      targetId: update.campaignId,
      details: `Campaign update "${update.title}" created (${requiresReview ? 'Pending Review' : 'Published'})`,
    });
    return newUpdate;
  }

  approveCampaignUpdate(id: string, reviewerName = 'Admin'): CampaignUpdate | undefined {
    const upd = this.getCampaignUpdateById(id);
    if (!upd) return undefined;
    upd.status = 'published';
    upd.reviewedBy = reviewerName;
    upd.publishedAt = new Date().toISOString();

    this.createAuditLog({
      actorId: 'admin-action',
      actorName: reviewerName,
      action: 'CAMPAIGN_UPDATE_APPROVED',
      targetType: 'campaign',
      targetId: upd.campaignId,
      details: `Administrator approved and published campaign field update "${upd.title}"`,
    });
    return upd;
  }

  rejectCampaignUpdate(id: string, reviewerName = 'Admin', reason?: string): CampaignUpdate | undefined {
    const upd = this.getCampaignUpdateById(id);
    if (!upd) return undefined;
    upd.status = 'rejected';
    upd.reviewedBy = reviewerName;

    this.createAuditLog({
      actorId: 'admin-action',
      actorName: reviewerName,
      action: 'CAMPAIGN_UPDATE_REJECTED',
      targetType: 'campaign',
      targetId: upd.campaignId,
      reason,
      details: `Administrator rejected campaign update "${upd.title}". Reason: ${reason || 'Unspecified'}`,
    });
    return upd;
  }

  // ---------------- CAMPAIGN ITEM ANALYTICS ----------------
  getCampaignItemAnalytics(campaignId?: string) {
    const items = this.getCampaignItemNeeds(campaignId);
    const itemDonations = this.donations.filter((d) => d.status === 'succeeded' && d.itemAllocations && d.itemAllocations.length > 0);
    const filteredDonations = campaignId ? itemDonations.filter((d) => d.campaignId === campaignId) : itemDonations;

    const totalItemDesignatedAmount = filteredDonations.reduce((sum, d) => sum + (d.itemDonationTotal || d.amount), 0);
    const totalItemOrders = filteredDonations.length;
    const totalItemsRequired = items.reduce((sum, it) => sum + it.quantityRequired, 0);
    const totalItemsFunded = items.reduce((sum, it) => sum + it.quantityFunded, 0);
    const totalItemsProcured = items.reduce((sum, it) => sum + it.quantityProcured, 0);
    const totalItemsDelivered = items.reduce((sum, it) => sum + it.quantityDelivered, 0);
    const totalItemsRemaining = Math.max(0, totalItemsRequired - totalItemsFunded);

    const physicalPledges = this.getPhysicalItemPledges(campaignId);
    const totalPhysicalPledges = physicalPledges.length;
    const totalPhysicalUnitsReceived = physicalPledges
      .filter((p) => p.status === 'received_verified')
      .reduce((sum, p) => sum + p.quantity, 0);

    const itemBreakdown = items.map((it) => ({
      id: it.id,
      name: it.name,
      category: it.category,
      unitPrice: it.unitPrice,
      quantityRequired: it.quantityRequired,
      quantityFunded: it.quantityFunded,
      quantityProcured: it.quantityProcured,
      quantityDelivered: it.quantityDelivered,
      remaining: Math.max(0, it.quantityRequired - it.quantityFunded),
      percentFunded: it.quantityRequired > 0 ? Math.min(100, Math.round((it.quantityFunded / it.quantityRequired) * 100)) : 0,
      totalValueFunded: it.quantityFunded * it.unitPrice,
      fulfillmentStatus: it.fulfillmentStatus,
      donationMode: it.donationMode,
    }));

    return {
      totalItemDesignatedAmount,
      totalItemOrders,
      totalItemsRequired,
      totalItemsFunded,
      totalItemsProcured,
      totalItemsDelivered,
      totalItemsRemaining,
      totalPhysicalPledges,
      totalPhysicalUnitsReceived,
      overallItemPercentage: totalItemsRequired > 0 ? Math.min(100, Math.round((totalItemsFunded / totalItemsRequired) * 100)) : 0,
      items: itemBreakdown,
    };
  }

  // ---------------- SYSTEM BACKUP & RESTORE ----------------
  exportDatabaseSnapshot(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        campaigns: this.campaigns,
        campaignItemNeeds: this.campaignItemNeeds,
        physicalItemPledges: this.physicalItemPledges,
        campaignRevisionSubmissions: this.campaignRevisionSubmissions,
        campaignUpdates: this.campaignUpdates,
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
        badgeStyles: this.badgeStyles,
        campaignReports: this.campaignReports,
        campaignUpdateRequests: this.campaignUpdateRequests,
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
      if (parsed.campaignItemNeeds) this.campaignItemNeeds = parsed.campaignItemNeeds;
      if (parsed.physicalItemPledges) this.physicalItemPledges = parsed.physicalItemPledges;
      if (parsed.campaignRevisionSubmissions) this.campaignRevisionSubmissions = parsed.campaignRevisionSubmissions;
      if (parsed.campaignUpdates) this.campaignUpdates = parsed.campaignUpdates;
      if (parsed.organizations) this.organizations = parsed.organizations;
      if (parsed.donations) this.donations = parsed.donations;
      if (parsed.pageSections) this.pageSections = parsed.pageSections;
      if (parsed.theme) this.theme = parsed.theme;
      if (parsed.gateways) this.gateways = parsed.gateways;
      if (parsed.settings) this.settings = parsed.settings;
      if (parsed.badgeStyles) this.badgeStyles = parsed.badgeStyles;
      if (parsed.campaignReports) this.campaignReports = parsed.campaignReports;
      if (parsed.campaignUpdateRequests) this.campaignUpdateRequests = parsed.campaignUpdateRequests;

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
  var __dokind_db__: DatabaseStore | undefined;
}

export const db = global.__dokind_db__ || new DatabaseStore();

if (process.env.NODE_ENV !== 'production') {
  global.__dokind_db__ = db;
}
