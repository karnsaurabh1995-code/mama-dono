export type UserRole =
  | 'super_admin'
  | 'ops_admin'
  | 'reviewer'
  | 'finance'
  | 'content_editor'
  | 'organization_manager'
  | 'fundraiser'
  | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  panNumber?: string;
  avatarUrl?: string;
  organizationId?: string;
  createdAt: string;
}

export type CampaignStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'active'
  | 'paused'
  | 'suspended'
  | 'completed'
  | 'rejected'
  | 'expired';

export type CampaignType = 'one-time' | 'monthly' | 'product';

export interface ItemizedBudgetItem {
  id: string;
  item: string;
  amount: number;
  description?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  story: string;
  category: CauseCategory;
  campaignType: CampaignType;
  goalAmount: number;
  raisedAmount: number;
  supporterCount: number;
  deadline?: string;
  featured: boolean;
  urgent: boolean;
  staffPick?: boolean;
  status: CampaignStatus;
  verifiedStatus: 'verified' | 'pending' | 'unverified';
  has80G: boolean;
  imageUrl: string;
  galleryUrls?: string[];
  beneficiaryName: string;
  beneficiaryLocation: string;
  hospitalName?: string;
  organizerName: string;
  organizerRole: 'individual' | 'organization';
  organizerId: string;
  organizationId?: string;
  organizationName?: string;
  itemizedBudget: ItemizedBudgetItem[];
  useOfFunds: string;
  documents?: {
    id: string;
    title: string;
    type: 'medical_estimate' | 'id_proof' | 'ngo_reg' | 'tax_cert' | 'other';
    url: string;
    verified: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type CauseCategory =
  | 'medical'
  | 'education'
  | 'children'
  | 'food-hunger'
  | 'disability'
  | 'elderly'
  | 'animals'
  | 'disaster-relief'
  | 'women-empowerment'
  | 'environment'
  | 'essential-supplies'
  | 'community-dev';

export interface CauseMeta {
  id: CauseCategory;
  name: string;
  slug: string;
  description: string;
  icon: string;
  campaignCount: number;
  totalRaised: number;
  bannerImage: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  website: string;
  darpanId?: string;
  panNumber: string;
  reg12A?: string;
  reg80G?: string;
  fcraRegistered: boolean;
  fcraNumber?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  city: string;
  state: string;
  foundedYear: number;
  campaignsCount: number;
  totalRaised: number;
  beneficiariesImpacted: number;
  causes: CauseCategory[];
  verifiedAt?: string;
}

export interface ProductNeed {
  id: string;
  campaignId: string;
  campaignSlug: string;
  campaignTitle: string;
  name: string;
  category: string;
  unitCost: number;
  quantityRequired: number;
  quantityFunded: number;
  remainingNeed: number;
  imageUrl: string;
  unit: string;
  fulfillmentStatus: 'pending' | 'procuring' | 'dispatched' | 'delivered';
  targetBeneficiaries: string;
  organizationName: string;
}

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;
  isAnonymous: boolean;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  currency: 'INR';
  status: PaymentStatus;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'razorpay_simulated';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptNumber: string;
  taxExemption80G: boolean;
  message?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly';
  createdAt: string;
}

export interface RecurringPlan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  frequency: 'monthly';
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  lastBillingDate: string;
  razorpaySubscriptionId: string;
  totalCyclesCharged: number;
  createdAt: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  mediaUrls?: string[];
  milestoneAchieved?: string;
  publishedAt: string;
}

export interface ImpactStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  category: CauseCategory;
  campaignId?: string;
  beneficiaryName: string;
  impactMetrics: { label: string; value: string }[];
  publishedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTime: string;
  imageUrl: string;
  tags: string[];
  publishedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'donor' | 'fundraiser' | 'tax_80g' | 'verification' | 'payments';
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: 'campaign' | 'donation' | 'organization' | 'user' | 'settings';
  targetId: string;
  reason?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SiteSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  supportAddress: string;
  darpanPortalRef?: string;
  razorpayKeyId: string;
  isTestMode: boolean;
  liveTickerEnabled: boolean;
  tipPercentageOptions: number[];
  minimumDonationINR: number;
  enableTax80G: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  ipAllowlist?: string[];
  sessionTimeoutMinutes?: number;
}

// ----------------- MASTER PROMPT 2 EXTENSIONS -----------------

export type PageSectionType =
  | 'hero'
  | 'urgent_strip'
  | 'categories'
  | 'featured_campaigns'
  | 'monthly_missions'
  | 'products'
  | 'live_ticker'
  | 'stats'
  | 'testimonials'
  | 'faq'
  | 'cta_box'
  | 'rich_text';

export interface PageSection {
  id: string;
  pageSlug: string; // e.g. 'home', 'campaigns', 'about'
  type: PageSectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isVisible: boolean;
  settings: {
    bgColor?: string;
    textColor?: string;
    padding?: 'compact' | 'normal' | 'spacious';
    columns?: number;
    itemLimit?: number;
    showBadge?: boolean;
    layout?: 'grid' | 'carousel' | 'cards' | 'banner';
  };
}

export interface PageVersion {
  id: string;
  pageSlug: string;
  versionNumber: number;
  sections: PageSection[];
  publishedAt: string;
  publishedBy: string;
  notes?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  primaryDarkColor: string;
  headingColor: string;
  bodyColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  borderColor: string;
  successColor: string;
  urgentColor: string;
  fontFamily: 'Inter' | 'Manrope' | 'Plus Jakarta Sans' | 'Outfit' | 'System';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cardShadow: 'none' | 'subtle' | 'medium' | 'elevated';
  headerStyle: 'sticky' | 'static';
  announcementBarVisible: boolean;
  announcementText?: string;
  announcementLink?: string;
  announcementBg?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  filename: string;
  fileType: 'image' | 'document' | 'icon' | 'video';
  mimeType: string;
  fileSizeKB: number;
  dimensions?: string;
  altText: string;
  tags: string[];
  usedIn: string[];
  uploadedAt: string;
}

export interface PaymentGatewayConfig {
  id: 'razorpay' | 'stripe' | 'cashfree' | 'bank_wire';
  name: string;
  description: string;
  isEnabled: boolean;
  isTestMode: boolean;
  keyId: string;
  secretKey: string;
  webhookSecret: string;
  supportedMethods: ('upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'bank_wire')[];
  minAmountINR: number;
  maxAmountINR: number;
  platformFeePercent: number;
  gatewayFeePercent: number;
  healthStatus: 'healthy' | 'degraded' | 'offline';
  lastHealthCheck: string;
  recentWebhooks: {
    id: string;
    event: string;
    payloadPreview: string;
    status: 'processed' | 'failed' | 'ignored';
    timestamp: string;
  }[];
}

export interface ManualDonation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;
  amount: number;
  paymentReference: string;
  bankName: string;
  depositDate: string;
  supportingProofUrl?: string;
  notes?: string;
  status: 'approved' | 'pending' | 'rejected';
  taxExemption80G: boolean;
  reconciledBy?: string;
  reconciledAt?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: 'info' | 'urgent' | 'success';
  placement: 'top_banner' | 'home_hero' | 'modal';
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface DynamicFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface DynamicForm {
  id: string;
  slug: string;
  title: string;
  description: string;
  fields: DynamicFormField[];
  submissionsCount: number;
  isActive: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formSlug: string;
  data: Record<string, any>;
  status: 'new' | 'in_review' | 'contacted' | 'resolved';
  notes?: string;
  submittedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface RedirectRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  hits: number;
  isActive: boolean;
  createdAt: string;
}

export interface CustomLandingPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: 'published' | 'draft';
  publishedAt?: string;
  sections: PageSection[];
}

export interface RolePermission {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

