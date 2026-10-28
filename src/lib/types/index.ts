export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'support_admin'
  | 'ops_admin'
  | 'marketer'
  | 'content_writer'
  | 'content_editor'
  | 'lead_generator'
  | 'campaign_manager'
  | 'head_staff'
  | 'reviewer'
  | 'finance'
  | 'support_staff'
  | 'organization_manager'
  | 'fundraiser'
  | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  secondaryRole?: UserRole; // Up to 2 roles per employee maximum
  roles?: UserRole[]; // Max 2 roles: [role] or [role, secondaryRole]
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  status?: 'active' | 'suspended' | 'pending_setup';
  phone?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  panNumber?: string;
  avatarUrl?: string;
  organizationId?: string;
  assignedCampaigns?: string[];
  internalNotes?: string;
  requiresPasswordChange?: boolean;
  passwordHash?: string;
  lastLoginAt?: string;
  lastResetAt?: string;
  sessionRevokedAt?: string;
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

export type FundraiserStage =
  | 'lead_verification'
  | 'content_creation'
  | 'supreme_admin_approval'
  | 'published'
  | 'rejected';

export interface LeadGenVerification {
  verifiedAt: string;
  verifiedBy: string;
  verifiedById?: string;
  notes?: string;
  contactConfirmed?: boolean;
  hospitalConfirmed?: boolean;
}

export interface ContentWriterSubmission {
  submittedAt: string;
  submittedBy: string;
  submittedById?: string;
  notes?: string;
  storyPolished?: boolean;
  artworkAdded?: boolean;
}

export interface DonorSubmissionInfo {
  isDonorSubmitted: boolean;
  submittedAt: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  initialStory?: string;
}

export type CampaignType = 'one-time' | 'monthly' | 'product';

export interface CampaignStoryBlock {
  id: string;
  type:
    | 'headline'
    | 'paragraph'
    | 'problem'
    | 'solution'
    | 'beneficiaries'
    | 'budget_breakdown'
    | 'quote'
    | 'image'
    | 'faq'
    | 'cta';
  title?: string;
  content: string;
  caption?: string;
  imageUrl?: string;
  order: number;
}

export interface CampaignArtworkConfig {
  mainPosterUrl?: string;
  heroImageUrl?: string;
  thumbnailSquareUrl?: string;
  socialShareUrl?: string;
  bannerDesktopUrl?: string;
  bannerMobileUrl?: string;
  beforeAfter?: {
    beforeUrl: string;
    afterUrl: string;
    caption: string;
  };
  gallery: string[];
  videoUrl?: string;
}

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
  primaryCategory?: CauseCategory;
  tags?: string[];
  campaignType: CampaignType;
  goalAmount: number;
  raisedAmount: number;
  netRaisedAmount?: number;
  supporterCount: number;
  deadline?: string;
  featured: boolean;
  urgent: boolean;
  staffPick?: boolean;
  status: CampaignStatus;
  verifiedStatus: 'verified' | 'pending' | 'unverified';
  has80G: boolean;
  imageUrl: string;
  posterImages?: string[]; // Multiple high-res posters (up to 2-3 posters for campaign carousel)
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
    isPublic?: boolean;
    status?: 'uploaded' | 'under_review' | 'verified' | 'rejected';
    reviewerNotes?: string;
    cloudProvider?: 'google_drive' | 'dropbox' | 'onedrive' | 'box' | 's3' | 'other';
    fileSize?: string;
    uploadedAt?: string;
  }[];
  // Master Prompt 3 extensions
  acceptsMonetary?: boolean;
  acceptsItems?: boolean;
  itemDonationMode?: 'financial_sponsor' | 'physical_goods' | 'both';
  internalCampaignId?: string;
  internalNotes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  campaignManager?: string;
  scheduledPublishDate?: string;
  startDate?: string;
  endDate?: string;
  storyBlocks?: CampaignStoryBlock[];
  artwork?: CampaignArtworkConfig;
  verificationChecklist?: {
    contentReviewed: boolean;
    docsReviewed: boolean;
    orgVerified: boolean;
    financialApproved: boolean;
    readyToPublish: boolean;
    reviewerComments?: string;
  };
  proposedByEmployee?: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: UserRole;
    department?: string;
    jobTitle?: string;
  };
  requiresSuperAdminApproval?: boolean;
  fundraiserStage?: FundraiserStage;
  donorSubmission?: DonorSubmissionInfo;
  leadGenVerification?: LeadGenVerification;
  contentWriterSubmission?: ContentWriterSubmission;
  superAdminApproval?: {
    approvedAt?: string;
    approvedBy?: string;
    rejectionReason?: string;
    revisionNotes?: string;
  };
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

export interface CampaignItemNeed {
  id: string;
  campaignId: string;
  campaignSlug?: string;
  name: string;
  category: string;
  description: string;
  detailedNeed?: string;
  imageUrl: string;
  posterImages?: string[]; // Multiple high-res posters (up to 2-3 posters for campaign carousel)
  galleryUrls?: string[];
  unit: string;
  unitPrice: number;
  quantityRequired: number;
  quantityFunded: number;
  quantityProcured: number;
  quantityDelivered: number;
  quantityReserved?: number;
  maxPerOrder?: number;
  minQuantity?: number;
  order: number;
  isFeatured?: boolean;
  isActive: boolean;
  donationMode: 'financial_sponsor' | 'physical_goods' | 'both';
  fulfillmentStatus: 'pending' | 'procuring' | 'dispatched' | 'delivered';
  fulfillmentDescription?: string;
  internalNotes?: string;
  physicalReceivingAddress?: string;
  physicalInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalItemPledge {
  id: string;
  campaignId: string;
  itemId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  quantity: number;
  shippingCarrier?: string;
  trackingNumber?: string;
  status: 'pledged' | 'shipped' | 'received_verified' | 'cancelled';
  receivedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface CampaignRevisionSubmission {
  id: string;
  campaignId?: string; // undefined if proposing brand new campaign
  title: string;
  slug?: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  reviewDestination?: 'admin' | 'head_staff' | 'reviewer';
  authorRole?: UserRole;
  requiresSuperAdminApproval?: boolean;
  submissionNotes?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  proposedTitle?: string;
  proposedShortDescription?: string;
  proposedStory?: string;
  proposedStoryBlocks?: CampaignStoryBlock[];
  proposedArtwork?: CampaignArtworkConfig;
  proposedCategory?: CauseCategory;
  proposedBeneficiaryName?: string;
  proposedBeneficiaryLocation?: string;
  proposedItems?: Omit<CampaignItemNeed, 'id' | 'createdAt' | 'updatedAt' | 'quantityFunded' | 'quantityProcured' | 'quantityDelivered'>[];
}

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
  grossAmount?: number;
  platformFeePercent?: number;
  platformFeeAmount?: number;
  netCampaignAmount?: number;
  dokindContributionPercent?: number;
  dokindContributionAmount?: number;
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
  itemAllocations?: {
    itemId: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
  }[];
  itemDonationTotal?: number;
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

export type UpdateMilestoneType =
  | 'progress_report'
  | 'fund_utilization'
  | 'beneficiary_update'
  | 'procurement_update'
  | 'item_delivery'
  | 'milestone_achieved'
  | 'clarification'
  | 'final_impact';

export interface UpdateCloudLink {
  id: string;
  label: string;
  url: string;
  provider?: 'google_drive' | 'dropbox' | 'onedrive' | 'box' | 'other';
  description?: string;
  isPublic: boolean;
}

export interface UpdateEvidenceItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  evidenceCategory: 'medical_bill' | 'doctor_estimate' | 'vendor_invoice' | 'field_photograph' | 'kyc_document' | 'other';
  isPublic: boolean;
  status: 'uploaded' | 'under_review' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  reviewerNotes?: string;
  uploadedAt: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorId?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  milestoneAchieved?: string;
  milestoneType?: UpdateMilestoneType;
  eventDate?: string;
  status?: 'draft' | 'pending_review' | 'under_review' | 'changes_requested' | 'approved' | 'published' | 'rejected' | 'archived';
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  cloudLinks?: UpdateCloudLink[];
  evidenceAttachments?: UpdateEvidenceItem[];
  rejectionReason?: string;
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
  primaryCategory?: CauseCategory;
  tags?: string[];
  campaignId?: string;
  beneficiaryName: string;
  impactMetrics: { label: string; value: string }[];
  publishedAt: string;
  status?: 'published' | 'draft';
  updatedAt?: string;
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
  status?: 'published' | 'draft';
  updatedAt?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'donor' | 'fundraiser' | 'tax_80g' | 'verification' | 'payments';
  order?: number;
  isActive?: boolean;
  showOnHomepage?: boolean;
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
  // Master Prompt 8 fee & contribution configuration
  defaultPlatformFeePercent: number; // default 5%
  platformFeeEnabled: boolean; // default true
  dokindFoundationContributionOptions: number[]; // default [0, 1, 2, 3, 5]
  // Master Prompt 10 Top section & DonateKart ticker configuration
  tickerMode?: 'live_donations' | 'trust_messages' | 'hybrid';
  trustMessages?: string[];
  // Master Prompt 11 Admin-Controlled Branding & Artwork
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  logoFaviconUrl?: string;
  logoAltText?: string;
  logoHeight?: number;
  newsletterImageUrl?: string;
  newsletterImageAlt?: string;
  newsletterFrameStyle?: 'organic_brush' | 'watercolor_edge' | 'subtle_splatter' | 'clean_rounded';
  newsletterFocalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  newsletterImagePosition?: 'left' | 'right';
  newsletterFrameSize?: 'normal' | 'large' | 'compact';
  // Admin-Curated Campaign Placement & Section Configuration
  homepageCuration?: HomepageCurationConfig;
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  googleAnalyticsId?: string;
}

export interface HomepageCurationConfig {
  heroCampaignIds: string[]; // Campaigns featured in the Top Hero Carousel
  featuredCampaignIds: string[]; // Campaigns featured in the Cause & Campaign Discovery Grid
  monthlyMissionIds: string[]; // Campaigns or missions in the Monthly Giving Section
  urgentCampaignIds?: string[]; // Campaigns highlighted with emergency/urgent banners
}

export interface MonthlyMission {
  id: string;
  slug: string;
  title: string;
  cause: string;
  tagline: string;
  monthlyAmount: number;
  supportersCount: number;
  impactNote: string;
  imageUrl: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
  campaignCount?: number;
  createdAt?: string;
}

export interface MediaRecognition {
  id: string;
  outletName: string;
  logoUrl?: string;
  quote: string;
  articleUrl?: string;
  publishedOn?: string;
  category?: 'National Daily' | 'Business & Finance' | 'Television & Broadcast' | 'Digital Media' | 'Philanthropy';
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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

export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  avatarUrl?: string;
  quote: string;
  rating: number;
  featured: boolean;
  date?: string;
  badge?: string;
}

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

export type PlatformCapability =
  | 'view_campaigns'
  | 'create_campaign_drafts'
  | 'edit_campaign_content'
  | 'upload_campaign_media'
  | 'add_campaign_updates'
  | 'submit_updates_review'
  | 'approve_campaign_content'
  | 'publish_campaigns'
  | 'pause_resume_donations'
  | 'complete_archive_campaigns'
  | 'view_campaign_analytics'
  | 'view_financial_reports'
  | 'reconcile_financial_records'
  | 'process_refunds'
  | 'manage_item_requirements'
  | 'manage_pages_faqs'
  | 'upload_shared_media'
  | 'manage_newsletters'
  | 'view_support_records'
  | 'export_reports'
  | 'manage_team'
  | 'manage_roles_permissions'
  | 'manage_settings'
  | 'manage_gateways'
  | 'view_audit_logs'
  | 'manage_seo'
  | 'manage_marketing'
  | 'view_marketing_analytics'
  | 'manage_social_metadata';

export interface RolePermission {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

// ----------------- MASTER PROMPT 11 EXTENSIONS: CAMPAIGN BADGES & LOGIN GATES -----------------

export type BadgeType =
  | 'verified'
  | 'tax_80g'
  | 'urgent'
  | 'cause_category'
  | 'new'
  | 'fully_funded'
  | 'completed';

export interface BadgeStyleConfig {
  id: BadgeType;
  label: string;
  defaultText: string;
  isEnabled: boolean;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number; // in px
  borderRadius: 'pill' | 'rounded-md' | 'rounded-lg' | 'square';
  fontSize: number; // in px
  fontWeight: 'medium' | 'semibold' | 'bold' | 'black';
  letterSpacing: 'normal' | 'wide' | 'wider' | 'widest';
  paddingX: number; // in px
  paddingY: number; // in px
  icon: 'shield' | 'flame' | 'award' | 'sparkles' | 'check' | 'percent' | 'clock' | 'tag' | 'none';
  iconColor?: string;
  iconSize: number; // in px
  shadow: 'none' | 'xs' | 'sm' | 'md';
  cardVariant: {
    fontSize: number;
    paddingX: number;
    paddingY: number;
    iconSize: number;
  };
  updatedAt?: string;
}

export interface CampaignReport {
  id: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  explanation: string;
  status: 'pending_review' | 'under_investigation' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CampaignUpdateRequest {
  id: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  inquiryType: string;
  message?: string;
  status: 'received' | 'notified' | 'answered';
  createdAt: string;
}

// ---------------- API KEY & SECRETS MANAGER (SUPERIOR ADMIN) ----------------
export type ApiKeyCategory =
  | 'google'
  | 'payment'
  | 'email'
  | 'storage'
  | 'communication'
  | 'security'
  | 'custom';

export type ApiKeyEnvironment = 'production' | 'sandbox';
export type ApiKeyStatus = 'active' | 'unconfigured' | 'revoked' | 'expired';

export interface ApiKeyRecord {
  id: string;
  name: string;
  description: string;
  service: string;
  category: ApiKeyCategory;
  environment: ApiKeyEnvironment;
  status: ApiKeyStatus;
  keyIdentifier: string; // e.g. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  publicKey?: string; // Client ID, Measurement ID, Site Key, etc.
  secretKey?: string; // API Secret, Private Key, Token (masked by default)
  webhookSecret?: string; // Webhook signing secret if applicable
  endpointUrl?: string; // Base URL or API Endpoint
  docsUrl?: string; // Official developer documentation
  lastRotatedAt?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'healthy' | 'warning' | 'error';
  lastTestMessage?: string;
  updatedBy: string;
  updatedAt: string;
  isSystemCritical: boolean;
  allowedOrigins?: string[];
  usageNotes?: string;
}


