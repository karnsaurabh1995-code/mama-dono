'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import {
  Campaign,
  CampaignStatus,
  CauseCategory,
  CampaignType,
  CampaignStoryBlock,
  CampaignArtworkConfig,
  CampaignItemNeed,
  ItemizedBudgetItem,
} from '@/lib/types';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  HeartHandshake,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Package,
  ShieldCheck,
  Eye,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Smartphone,
  Monitor,
  Copy,
  Calendar,
  User,
  Building2,
  Tag,
  Check,
} from 'lucide-react';

const CATEGORIES: { id: CauseCategory; name: string }[] = [
  { id: 'medical', name: 'Medical & Healthcare' },
  { id: 'education', name: 'Child & Girl Education' },
  { id: 'food-hunger', name: 'Food & Hunger Relief' },
  { id: 'disability', name: 'Disability & Prosthetics' },
  { id: 'elderly', name: 'Elderly Care' },
  { id: 'animals', name: 'Animal Welfare & Shelters' },
  { id: 'disaster-relief', name: 'Disaster Emergency Relief' },
  { id: 'essential-supplies', name: 'Essential Goods & Clothes' },
  { id: 'women-empowerment', name: 'Women Empowerment' },
  { id: 'environment', name: 'Environment & Water' },
];

const PRESET_ITEMS = [
  {
    name: 'Emergency Family Ration Kit',
    category: 'food-supplies',
    unit: 'Kit',
    unitPrice: 1200,
    description: '10kg Rice, 2kg Dal, 1L Oil, Salt, Jaggery & Dry Rations.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    donationMode: 'both' as const,
  },
  {
    name: 'Heavyweight Woolen Blanket',
    category: 'clothing-bedding',
    unit: 'Blanket',
    unitPrice: 350,
    description: 'High-density blended wool thermal blanket (60x90 inches).',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    donationMode: 'both' as const,
  },
  {
    name: 'AquaClean Water Filter & Tablets',
    category: 'water-hygiene',
    unit: 'Unit',
    unitPrice: 450,
    description: 'Portable gravity filter bottle + 100 chlorine purification tablets.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    donationMode: 'financial_sponsor' as const,
  },
  {
    name: 'Child School Bag & Stationery Set',
    category: 'education-supplies',
    unit: 'Kit',
    unitPrice: 650,
    description: 'Waterproof backpack, 6 notebooks, geometry box, pencil case & pens.',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    donationMode: 'both' as const,
  },
  {
    name: 'Sterile Clinical Care Dressing Pack',
    category: 'medical-supplies',
    unit: 'Kit',
    unitPrice: 850,
    description: 'Chlorhexidine skin swabs, sterile gauze, bandages & surgical tape.',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    donationMode: 'financial_sponsor' as const,
  },
];

export default function AdminNewCampaignWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // STEP 1: IDENTITY
  const [internalId] = useState(`SEVA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState<CauseCategory>('medical');
  const [campaignType, setCampaignType] = useState<CampaignType>('one-time');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [campaignManager, setCampaignManager] = useState(user?.name || 'Administrator');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryLocation, setBeneficiaryLocation] = useState('New Delhi, India');
  const [hospitalName, setHospitalName] = useState('');
  const [organizationName, setOrganizationName] = useState('Asha Jyoti Foundation');
  const [internalNotes, setInternalNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [scheduledPublishDate, setScheduledPublishDate] = useState('');

  // STEP 2: STRUCTURED STORY BLOCKS
  const [story, setStory] = useState(
    'Every rupee donated directly relieves clinical bills and verified essential relief. Join us in providing urgent lifesaving support.'
  );
  const [storyBlocks, setStoryBlocks] = useState<CampaignStoryBlock[]>([
    {
      id: 'blk-1',
      type: 'problem',
      title: 'The Critical Crisis & Need',
      content:
        'Displaced families and patients are facing acute hardship without basic sustenance and medical care. Immediate intervention is required to prevent irreparable loss.',
      order: 1,
    },
    {
      id: 'blk-2',
      type: 'beneficiaries',
      title: 'Who You Are Directly Helping',
      content:
        'Over 500 vulnerable women, children, and daily-wage dependents who have no emergency savings or safety net.',
      order: 2,
    },
    {
      id: 'blk-3',
      type: 'solution',
      title: 'How Contributions Are Deployed',
      content:
        '100% of contributions are tracked transparently with direct supplier invoices, hospital counters, and photo-verified field deliveries.',
      order: 3,
    },
  ]);

  // STEP 3: ARTWORK & MEDIA
  const [mainPosterUrl, setMainPosterUrl] = useState(
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80'
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80'
  );
  const [thumbnailSquareUrl, setThumbnailSquareUrl] = useState(
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80'
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  ]);
  const [beforeAfter, setBeforeAfter] = useState({
    beforeUrl: '',
    afterUrl: '',
    caption: 'Verified recovery and field progress comparison',
  });

  // STEP 4: FUNDRAISING & FINANCIAL CONFIG
  const [goalAmount, setGoalAmount] = useState<number>(750000);
  const [minDonation, setMinDonation] = useState<number>(100);
  const [maxDonation, setMaxDonation] = useState<number>(1000000);
  const [has80G, setHas80G] = useState<boolean>(true);
  const [acceptsMonetary, setAcceptsMonetary] = useState<boolean>(true);
  const [acceptsItems, setAcceptsItems] = useState<boolean>(true);
  const [itemDonationMode, setItemDonationMode] = useState<'financial_sponsor' | 'physical_goods' | 'both'>('both');
  const [budgetItems, setBudgetItems] = useState<ItemizedBudgetItem[]>([
    { id: 'b-1', item: 'Medical Pharmacy / Direct Relief Supplies', amount: 450000, description: 'Direct procurement' },
    { id: 'b-2', item: 'Emergency Hospital Bed & Clinical ICU Stay', amount: 200000, description: 'Ward charges' },
    { id: 'b-3', item: 'Field Distribution & Transit Logistics', amount: 100000, description: 'Refrigerated transit' },
  ]);

  // STEP 5: CAMPAIGN-SPECIFIC ITEM REQUIREMENTS
  const [itemNeeds, setItemNeeds] = useState<
    Omit<CampaignItemNeed, 'id' | 'createdAt' | 'updatedAt' | 'quantityFunded' | 'quantityProcured' | 'quantityDelivered'>[]
  >([
    {
      campaignId: '',
      name: 'Emergency Family Ration Kit',
      category: 'food-supplies',
      description: '10kg Rice, 2kg Dal, 1L Oil, Salt, Jaggery & Dry Rations.',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
      unit: 'Family Kit',
      unitPrice: 1200,
      quantityRequired: 500,
      order: 1,
      isActive: true,
      donationMode: 'both',
      fulfillmentStatus: 'pending',
    },
    {
      campaignId: '',
      name: 'AquaClean Water Purification Unit',
      category: 'water-hygiene',
      description: 'Gravity-fed portable filter unit + chlorine purification tablets.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      unit: 'Purifier Unit',
      unitPrice: 450,
      quantityRequired: 600,
      order: 2,
      isActive: true,
      donationMode: 'financial_sponsor',
      fulfillmentStatus: 'pending',
    },
  ]);

  // STEP 6: VERIFICATION CHECKLIST
  const [checklist, setChecklist] = useState({
    contentReviewed: true,
    docsReviewed: true,
    orgVerified: true,
    financialApproved: true,
    readyToPublish: true,
    reviewerComments: 'Verified with AIIMS/hospital estimate and NGO Darpan registration certificates.',
  });

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  // Add / Remove Story Block
  const handleAddStoryBlock = () => {
    const newBlock: CampaignStoryBlock = {
      id: `blk-${Date.now()}`,
      type: 'paragraph',
      title: 'Additional Field Insight',
      content: 'Detail the operational progress and impact outcomes here.',
      order: storyBlocks.length + 1,
    };
    setStoryBlocks([...storyBlocks, newBlock]);
  };

  const handleRemoveStoryBlock = (index: number) => {
    setStoryBlocks(storyBlocks.filter((_, i) => i !== index));
  };

  // Add Preset Item Need
  const handleAddPresetItem = (preset: typeof PRESET_ITEMS[0]) => {
    setItemNeeds([
      ...itemNeeds,
      {
        campaignId: '',
        name: preset.name,
        category: preset.category,
        description: preset.description,
        imageUrl: preset.imageUrl,
        unit: preset.unit,
        unitPrice: preset.unitPrice,
        quantityRequired: 200,
        order: itemNeeds.length + 1,
        isActive: true,
        donationMode: preset.donationMode,
        fulfillmentStatus: 'pending',
      },
    ]);
    notify(`Added "${preset.name}" to campaign item requirements.`);
  };

  const handleRemoveItemNeed = (index: number) => {
    setItemNeeds(itemNeeds.filter((_, i) => i !== index));
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isEmployeeRole = user?.role === 'content_writer' || user?.role === 'lead_generator' || user?.role === 'admin';

  // Final Action: Save Draft, Schedule, or Publish Live
  const handleSaveCampaign = (requestedStatus: 'draft' | 'submitted' | 'active') => {
    if (!title.trim()) {
      notify('Please provide a campaign title in Step 1.');
      setCurrentStep(1);
      return;
    }
    if (!slug.trim()) {
      notify('Please specify a URL slug in Step 1.');
      setCurrentStep(1);
      return;
    }

    // Slug conflict check
    const existing = db.getCampaignBySlug(slug.trim());
    if (existing) {
      notify(`Slug "${slug}" is already in use. Please enter a unique slug.`);
      setCurrentStep(1);
      return;
    }

    // Role-based publish guard: Content Writers can only save as draft and submit for approval
    let finalStatus: CampaignStatus = requestedStatus;
    let requiresApproval = false;

    if (finalStatus === 'active' && user?.role === 'content_writer') {
      notify('Content Writers can only create campaign drafts and submit for review. Direct live publication requires Supreme Admin approval.');
      return;
    }

    // Role-based publish guard: Non-super_admin employees must submit for Supreme Admin approval
    if (!isSuperAdmin) {
      if (requestedStatus === 'active' || requestedStatus === 'submitted') {
        finalStatus = 'submitted';
        requiresApproval = true;
      } else {
        finalStatus = 'draft';
        requiresApproval = false;
      }
    }

    setIsSubmitting(true);

    try {
      const employeeMetadata = !isSuperAdmin
        ? {
            id: user?.id || 'emp-user',
            name: user?.name || 'Staff Member',
            email: user?.email || 'staff@dokind.org.in',
            role: user?.role || 'admin',
            department: user?.department,
            jobTitle: user?.jobTitle,
          }
        : undefined;

      // 1. Create Campaign
      const createdCampaign = db.createCampaign({
        slug: slug.trim(),
        title: title.trim(),
        shortDescription: shortDescription.trim() || title.trim(),
        story: story.trim(),
        category,
        campaignType,
        goalAmount,
        deadline: endDate || undefined,
        featured: priority === 'urgent',
        urgent: priority === 'urgent',
        status: finalStatus,
        verifiedStatus: isSuperAdmin && finalStatus === 'active' ? 'verified' : 'pending',
        has80G,
        imageUrl: mainPosterUrl,
        posterImages: [mainPosterUrl, ...galleryUrls.slice(0, 2)],
        galleryUrls,
        beneficiaryName: beneficiaryName.trim() || 'Deserving Beneficiary',
        beneficiaryLocation: beneficiaryLocation.trim(),
        hospitalName: hospitalName.trim() || undefined,
        organizerName: organizationName.trim(),
        organizerRole: 'organization',
        organizerId: 'org-hope-india',
        organizationName: organizationName.trim(),
        itemizedBudget: budgetItems,
        useOfFunds: 'Direct relief and clinical care fulfillment.',
        acceptsMonetary,
        acceptsItems,
        itemDonationMode,
        internalCampaignId: internalId,
        internalNotes,
        priority,
        campaignManager,
        scheduledPublishDate: scheduledPublishDate || undefined,
        startDate,
        endDate: endDate || undefined,
        storyBlocks,
        artwork: {
          mainPosterUrl,
          heroImageUrl,
          thumbnailSquareUrl,
          socialShareUrl: mainPosterUrl,
          gallery: galleryUrls,
          beforeAfter: beforeAfter.beforeUrl ? beforeAfter : undefined,
        },
        verificationChecklist: checklist,
        proposedByEmployee: employeeMetadata,
        requiresSuperAdminApproval: requiresApproval,
      });

      // 2. Create Campaign Item Needs if enabled
      if (acceptsItems && itemNeeds.length > 0) {
        for (const item of itemNeeds) {
          db.createCampaignItemNeed(
            {
              ...item,
              campaignId: createdCampaign.id,
              campaignSlug: createdCampaign.slug,
            },
            user?.name || 'Administrator'
          );
        }
      }

      // 3. Register revision submission for Supreme Admin tracking if submitted
      if (finalStatus === 'submitted') {
        db.createRevisionSubmission({
          campaignId: createdCampaign.id,
          title: `[Employee Proposal] ${createdCampaign.title}`,
          slug: createdCampaign.slug,
          submittedBy: user?.id || 'emp-user',
          submittedByName: `${user?.name || 'Staff Member'} (${user?.role || 'staff'})`,
          authorRole: user?.role,
          reviewDestination: 'admin',
          requiresSuperAdminApproval: true,
          submissionNotes: `Campaign proposal created by ${user?.name || 'Employee'} (${user?.role}). Awaiting Supreme Admin verification and publication.`,
          proposedTitle: createdCampaign.title,
          proposedShortDescription: createdCampaign.shortDescription,
          proposedStory: createdCampaign.story,
          proposedCategory: createdCampaign.category,
          proposedBeneficiaryName: createdCampaign.beneficiaryName,
          proposedBeneficiaryLocation: createdCampaign.beneficiaryLocation,
          proposedArtwork: createdCampaign.artwork,
          proposedStoryBlocks: createdCampaign.storyBlocks,
        });
      }

      notify(
        finalStatus === 'active'
          ? `Campaign "${createdCampaign.title}" is now LIVE!`
          : finalStatus === 'submitted'
          ? `Campaign proposal "${createdCampaign.title}" submitted to Supreme Admin for approval.`
          : `Campaign draft "${createdCampaign.title}" saved successfully.`
      );

      setTimeout(() => {
        router.push(finalStatus === 'active' ? `/campaigns/${createdCampaign.slug}` : '/admin/campaigns');
      }, 1000);
    } catch (err: any) {
      notify(`Error: ${err.message || 'Failed to save campaign.'}`);
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Campaign Identity',
    'Structured Story',
    'Artwork & Media',
    'Financial Goals',
    'Item Requirements',
    'Verification',
    'Interactive Preview',
    'Publish & Schedule',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns">
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-[#202124]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Admin Campaign Creation Wizard
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-mono text-neutral-600">
                {internalId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
              Create New Verified Campaign
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSaveCampaign('draft')}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Save as Draft
          </Button>
          {isSuperAdmin ? (
            <Button
              size="sm"
              onClick={() => handleSaveCampaign('active')}
              disabled={isSubmitting}
              className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Publish Live
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSaveCampaign('submitted')}
              disabled={isSubmitting}
              className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Submit to Supreme Admin
            </Button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 8-Step Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[760px]">
          {stepTitles.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#E84B45] text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isCurrent
                      ? 'bg-white text-[#E84B45]'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className="truncate">{st}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Steps Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E4E9] shadow-2xs">
        {/* STEP 1: CAMPAIGN IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 1 — Campaign Identity & Metadata</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Establish the campaign identification, target URL, beneficiary details, and operational priority.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#202124]">Campaign Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Urgent: Emergency Open Heart Surgery for 5-Year-Old Deepa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">URL Slug *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-xs text-neutral-500 font-mono">
                    /campaigns/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-r-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Cause Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CauseCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#202124]">Short Summary (Excerpt) *</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A clear 1-2 sentence overview for cards, WhatsApp sharing, and search previews."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Beneficiary Name *</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Baby Deepa Sen"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Beneficiary Location</label>
                <input
                  type="text"
                  value={beneficiaryLocation}
                  onChange={(e) => setBeneficiaryLocation(e.target.value)}
                  placeholder="e.g. AIIMS New Delhi / Barpeta, Assam"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Hospital or Medical Partner (If applicable)</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Sir Ganga Ram Hospital, New Delhi"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Responsible Organization</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Asha Jyoti Foundation (Darpan Verified)"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Internal Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Emergency</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Internal Campaign Manager</label>
                <input
                  type="text"
                  value={campaignManager}
                  onChange={(e) => setCampaignManager(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Campaign Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#202124]">Internal Administrative Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private internal operational remarks, investigator notes, or escalation channels."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: STRUCTURED STORY BUILDER */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#202124]">Step 2 — Structured Story & Rich Content</h2>
                <p className="text-xs text-[#555B63] mt-0.5">
                  Build the campaign narrative using structured, reorderable content blocks without touching HTML.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddStoryBlock} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Content Block
              </Button>
            </div>

            {/* Main Narrative Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Lead Story Introduction</label>
              <textarea
                rows={4}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="The overarching appeal and human story behind this fundraiser..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Reorderable Blocks */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Narrative Sections ({storyBlocks.length})
              </span>

              {storyBlocks.map((blk, idx) => (
                <div key={blk.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </span>
                      <select
                        value={blk.type}
                        onChange={(e) => {
                          const updated = [...storyBlocks];
                          updated[idx].type = e.target.value as any;
                          setStoryBlocks(updated);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 text-xs font-bold bg-white"
                      >
                        <option value="problem">Problem / Emergency Need</option>
                        <option value="beneficiaries">Beneficiaries Profile</option>
                        <option value="solution">Operational Solution</option>
                        <option value="paragraph">Standard Paragraph</option>
                        <option value="quote">Patient / Family Quote</option>
                        <option value="cta">Call to Action</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStoryBlock(idx)}
                      className="text-neutral-400 hover:text-red-600 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={blk.title || ''}
                    onChange={(e) => {
                      const updated = [...storyBlocks];
                      updated[idx].title = e.target.value;
                      setStoryBlocks(updated);
                    }}
                    placeholder="Section Heading"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold bg-white focus:outline-hidden"
                  />

                  <textarea
                    rows={3}
                    value={blk.content}
                    onChange={(e) => {
                      const updated = [...storyBlocks];
                      updated[idx].content = e.target.value;
                      setStoryBlocks(updated);
                    }}
                    placeholder="Section content..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: ARTWORK & MEDIA STUDIO */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 3 — Campaign Artwork & Media Positioning</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Upload and configure high-resolution campaign photography, posters, and gallery images.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#202124]">Main Campaign Poster URL *</label>
                  <input
                    type="text"
                    value={mainPosterUrl}
                    onChange={(e) => setMainPosterUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  />
                  <p className="text-[11px] text-neutral-400">Recommended: 1200x675 (16:9 ratio). High clarity.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#202124]">Square Thumbnail URL</label>
                  <input
                    type="text"
                    value={thumbnailSquareUrl}
                    onChange={(e) => setThumbnailSquareUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#202124]">Gallery Image #1</label>
                  <input
                    type="text"
                    value={galleryUrls[0] || ''}
                    onChange={(e) => {
                      const arr = [...galleryUrls];
                      arr[0] = e.target.value;
                      setGalleryUrls(arr);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#202124]">Gallery Image #2</label>
                  <input
                    type="text"
                    value={galleryUrls[1] || ''}
                    onChange={(e) => {
                      const arr = [...galleryUrls];
                      arr[1] = e.target.value;
                      setGalleryUrls(arr);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Poster Preview Card */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Poster Visual Check</span>
                <div className="aspect-16/9 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainPosterUrl}
                    alt="Main campaign poster"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="urgent">URGENT</Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-mono">
                    16:9 Verified
                  </div>
                </div>
                <p className="text-xs text-neutral-500">
                  Preview showing safe zones for headline banners and Section 80G tax badges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FUNDRAISING & FINANCIAL CONFIGURATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 4 — Fundraising Goal & Donation Controls</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Configure monetary targets, minimum thresholds, Section 80G exemption, and itemized budget lines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Monetary Fundraising Goal (₹) *</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold font-mono focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Minimum Donation (₹)</label>
                <input
                  type="number"
                  value={minDonation}
                  onChange={(e) => setMinDonation(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Maximum Permitted Donation (₹)</label>
                <input
                  type="number"
                  value={maxDonation}
                  onChange={(e) => setMaxDonation(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Donation Modes */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
              <span className="text-xs font-bold text-[#202124]">Accepted Donation Streams</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsMonetary}
                    onChange={(e) => setAcceptsMonetary(e.target.checked)}
                    className="w-4 h-4 text-[#E84B45] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#202124]">Monetary Contributions</div>
                    <div className="text-[10px] text-neutral-400">Direct cash/UPI donations</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsItems}
                    onChange={(e) => setAcceptsItems(e.target.checked)}
                    className="w-4 h-4 text-[#E84B45] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#202124]">Item-Based Giving</div>
                    <div className="text-[10px] text-neutral-400">DonateKart style products</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={has80G}
                    onChange={(e) => setHas80G(e.target.checked)}
                    className="w-4 h-4 text-[#E84B45] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#202124]">Section 80G Tax Exemption</div>
                    <div className="text-[10px] text-neutral-400">50% income tax relief</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Itemized Budget Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Itemized Budget Allocation
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setBudgetItems([
                      ...budgetItems,
                      { id: `b-${Date.now()}`, item: 'Additional Budget Line', amount: 50000 },
                    ])
                  }
                  className="text-xs font-bold text-[#E84B45] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="space-y-2">
                {budgetItems.map((bi, i) => (
                  <div key={bi.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={bi.item}
                      onChange={(e) => {
                        const arr = [...budgetItems];
                        arr[i].item = e.target.value;
                        setBudgetItems(arr);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                    />
                    <div className="w-40 flex items-center">
                      <span className="px-2 py-2 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-xs font-mono text-neutral-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={bi.amount}
                        onChange={(e) => {
                          const arr = [...budgetItems];
                          arr[i].amount = Number(e.target.value);
                          setBudgetItems(arr);
                        }}
                        className="w-full px-3 py-2 rounded-r-xl border border-neutral-300 text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setBudgetItems(budgetItems.filter((_, idx) => idx !== i))}
                      className="text-neutral-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CAMPAIGN-SPECIFIC ITEM REQUIREMENTS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 5 — Campaign-Specific Item Requirements</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Enable DonateKart-inspired product giving. Donors can fund specific emergency goods or pledge physical items.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5">
              <span className="text-xs font-bold text-[#202124]">1-Click Item Presets:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_ITEMS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPresetItem(preset)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#E84B45] text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E84B45]" />
                    <span>{preset.name}</span>
                    <span className="text-neutral-400 font-mono">({formatINR(preset.unitPrice)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Configured Campaign Items ({itemNeeds.length})
              </span>

              {itemNeeds.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                  No items configured. Click a preset above to attach emergency kits to this campaign.
                </div>
              ) : (
                itemNeeds.map((it, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#E84B45]/10 text-[#E84B45] flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => {
                            const arr = [...itemNeeds];
                            arr[idx].name = e.target.value;
                            setItemNeeds(arr);
                          }}
                          className="font-bold text-xs text-[#202124] border border-neutral-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={it.donationMode}
                          onChange={(e) => {
                            const arr = [...itemNeeds];
                            arr[idx].donationMode = e.target.value as any;
                            setItemNeeds(arr);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs bg-neutral-50"
                        >
                          <option value="both">Mode A & B (Sponsor or Physical)</option>
                          <option value="financial_sponsor">Mode A: Financial Sponsor Only</option>
                          <option value="physical_goods">Mode B: Physical Delivery Only</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemNeed(idx)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={it.unitPrice}
                          onChange={(e) => {
                            const arr = [...itemNeeds];
                            arr[idx].unitPrice = Number(e.target.value);
                            setItemNeeds(arr);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Quantity Needed</label>
                        <input
                          type="number"
                          value={it.quantityRequired}
                          onChange={(e) => {
                            const arr = [...itemNeeds];
                            arr[idx].quantityRequired = Number(e.target.value);
                            setItemNeeds(arr);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Unit Label</label>
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => {
                            const arr = [...itemNeeds];
                            arr[idx].unit = e.target.value;
                            setItemNeeds(arr);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Total Target Value</label>
                        <div className="px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-emerald-700">
                          {formatINR(it.unitPrice * it.quantityRequired)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 6: VERIFICATION CHECKLIST */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 6 — Verification & Compliance Checklist</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Ensure KYC documents, medical estimates, and NGO Darpan accreditation are fully verified before public launch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.contentReviewed}
                  onChange={(e) => setChecklist({ ...checklist, contentReviewed: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-[#E84B45] rounded"
                />
                <div>
                  <div className="text-xs font-bold text-[#202124]">Content & Narrative Verified</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Story copy reviewed for accuracy, dignity of beneficiary, and absence of misleading claims.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.docsReviewed}
                  onChange={(e) => setChecklist({ ...checklist, docsReviewed: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-[#E84B45] rounded"
                />
                <div>
                  <div className="text-xs font-bold text-[#202124]">Supporting Documents on File</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Official hospital bill estimates, Government Aadhaar/PAN identity cards, and BPL certificates.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.orgVerified}
                  onChange={(e) => setChecklist({ ...checklist, orgVerified: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-[#E84B45] rounded"
                />
                <div>
                  <div className="text-xs font-bold text-[#202124]">NGO Darpan / Trust Verification</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Verified organization registration number, Form 12A/80G status, and active bank account mandate.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.financialApproved}
                  onChange={(e) => setChecklist({ ...checklist, financialApproved: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-[#E84B45] rounded"
                />
                <div>
                  <div className="text-xs font-bold text-[#202124]">Financial Configuration Approved</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Fundraising goal, item unit prices, and platform fee disclosures validated against quotes.
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Reviewer Compliance Remarks</label>
              <textarea
                rows={3}
                value={checklist.reviewerComments}
                onChange={(e) => setChecklist({ ...checklist, reviewerComments: e.target.value })}
                placeholder="Official audit log comment regarding verification..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* STEP 7: INTERACTIVE LIVE PREVIEW */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#202124]">Step 7 — Interactive Live Preview</h2>
                <p className="text-xs text-[#555B63] mt-0.5">
                  Inspect the exact public campaign layout, monetary progress bar, and DonateKart item cards.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    previewDevice === 'desktop' ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    previewDevice === 'mobile' ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div
              className={`mx-auto transition-all duration-300 ${
                previewDevice === 'mobile'
                  ? 'max-w-sm border-8 border-neutral-800 rounded-3xl p-3 shadow-2xl bg-[#FAF9F6]'
                  : 'w-full bg-[#FAF9F6] p-6 rounded-2xl border border-neutral-200'
              }`}
            >
              <div className="space-y-6">
                {/* Hero Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                  <div className="aspect-16/9 w-full overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainPosterUrl || 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80'}
                      alt="Campaign Poster"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold">
                        URGENT
                      </span>
                      {has80G && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          80G Tax Benefit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <h3 className="text-base sm:text-lg font-black text-[#202124] leading-snug">
                      {title || 'Campaign Title Preview'}
                    </h3>
                    <p className="text-xs text-[#555B63]">{shortDescription || 'Campaign summary excerpt preview...'}</p>

                    {/* Monetary Progress Bar */}
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#202124]">₹0 raised</span>
                        <span className="text-neutral-500">Goal: {formatINR(goalAmount)}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                        <div className="w-[4%] h-full bg-[#E84B45] rounded-full" />
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-500">
                        <span>0 Supporters</span>
                        <span>0% of Goal</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 bg-[#E84B45] text-white rounded-xl text-xs font-bold hover:bg-[#BD302D] transition">
                        Donate Money
                      </button>
                      {acceptsItems && (
                        <button className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition">
                          Donate Items
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Needed Preview */}
                {acceptsItems && itemNeeds.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-[#202124] flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-[#E84B45]" />
                        Items Needed for This Campaign ({itemNeeds.length})
                      </h4>
                      <span className="text-[11px] text-neutral-500">DonateKart Inspired</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {itemNeeds.map((it, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-[#202124] truncate">{it.name}</h5>
                              <p className="text-[11px] text-neutral-500 line-clamp-1">{it.description}</p>
                              <div className="text-xs font-black text-[#E84B45] mt-1">
                                {formatINR(it.unitPrice)}{' '}
                                <span className="text-[10px] text-neutral-400 font-normal">/ {it.unit}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                            <span className="text-[10px] text-neutral-500 font-mono">0 / {it.quantityRequired} Funded</span>
                            <button className="px-2.5 py-1 rounded-lg bg-[#E84B45] text-white text-[10px] font-bold">
                              Sponsor Need
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: SAVE, SCHEDULE, OR PUBLISH */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#202124]">Step 8 — Save, Schedule, or Publish Live</h2>
              <p className="text-xs text-[#555B63] mt-0.5">
                Confirm final publication parameters and initiate public campaign visibility.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-500">Internal Campaign ID:</span>
                <span className="text-xs font-mono font-bold text-[#202124]">{internalId}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-500">Campaign Title:</span>
                <span className="text-xs font-bold text-[#202124] text-right truncate max-w-md">{title || 'Untitled'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-500">Fundraising Goal:</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{formatINR(goalAmount)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-500">Attached Item Requirements:</span>
                <span className="text-xs font-bold text-[#202124]">{acceptsItems ? `${itemNeeds.length} items` : 'Disabled'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">Verification Compliance:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  All 4 Compliance Criteria Passed
                </span>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Employee Campaign Proposal Governance
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    You are authoring this campaign as an authorized team member (<strong>{user?.name || 'Staff Member'}</strong> • {user?.jobTitle || user?.role}).
                    In accordance with platform governance, all campaigns created by Content Writers, Lead Generators, and Admins are submitted for final verification and live publication approval by the <strong>Supreme Admin</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isSuperAdmin ? (
                <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-[#202124]">Immediate Public Launch</h3>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Instantly publish this campaign on the homepage, browse catalog, and public donation checkout.
                  </p>
                  <Button
                    onClick={() => handleSaveCampaign('active')}
                    disabled={isSubmitting}
                    className="w-full bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold py-2.5"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {isSubmitting ? 'Publishing...' : 'Publish Campaign Live Now'}
                  </Button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#E84B45]" />
                    <h3 className="text-sm font-bold text-[#202124]">Submit to Supreme Admin</h3>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Route this complete campaign configuration to the Supreme Admin's queue for verification and live activation.
                  </p>
                  <Button
                    onClick={() => handleSaveCampaign('submitted')}
                    disabled={isSubmitting}
                    className="w-full bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold py-2.5"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {isSubmitting ? 'Submitting...' : 'Submit for Supreme Admin Approval'}
                  </Button>
                </div>
              )}

              <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neutral-600" />
                  <h3 className="text-sm font-bold text-[#202124]">Save as Staged Draft</h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Save campaign configuration safely in the database. Accessible in the Admin Campaigns list to continue editing later.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleSaveCampaign('draft')}
                  disabled={isSubmitting}
                  className="w-full text-xs font-bold py-2.5"
                >
                  Save as Staged Draft
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Stepper Controls */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>

          <div className="text-xs text-neutral-400 font-medium">
            Step {currentStep} of {stepTitles.length}
          </div>

          {currentStep < 8 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
              className="bg-[#202124] hover:bg-neutral-800 text-white text-xs font-bold"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSaveCampaign(isSuperAdmin ? 'active' : 'submitted')}
              disabled={isSubmitting}
              className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
            >
              {isSuperAdmin ? 'Publish Campaign Live' : 'Submit to Supreme Admin'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
