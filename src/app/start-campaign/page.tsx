'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CAUSES_DATA } from '@/lib/data/causes';
import { db } from '@/lib/db';
import { CauseCategory, CampaignType } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/context';
import {
  Heart,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  ShieldCheck,
  Hospital,
  Sparkles,
} from 'lucide-react';

export default function StartCampaignWizardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<CauseCategory>('medical');
  const [campaignType, setCampaignType] = useState<CampaignType>('one-time');
  const [organizerName, setOrganizerName] = useState(user?.name || '');
  const [organizerEmail, setOrganizerEmail] = useState(user?.email || '');
  const [organizerPhone, setOrganizerPhone] = useState(user?.phone || '');
  const [organizerRole, setOrganizerRole] = useState<'individual' | 'organization'>('individual');
  const [organizationName, setOrganizationName] = useState('');

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [story, setStory] = useState('');
  const [goalAmount, setGoalAmount] = useState<number>(500000);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryLocation, setBeneficiaryLocation] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');

  const [docTitle, setDocTitle] = useState('Hospital Treatment Estimate Letter');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
  );

  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    if (step === 1 && !category) {
      setError('Please select a cause category');
      return;
    }
    if (step === 2 && (!organizerName || !organizerEmail)) {
      setError('Please provide organizer name and email');
      return;
    }
    if (step === 3 && (!title || !shortDescription || !goalAmount || !beneficiaryName)) {
      setError('Please fill in campaign title, summary, goal amount, and beneficiary name');
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const newCampaign = db.createCampaign({
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        title,
        shortDescription,
        story:
          story ||
          `${title}. Seeking generous support from kind souls across India to fund treatments and critical operations.`,
        category,
        campaignType,
        goalAmount: Number(goalAmount),
        deadline,
        featured: false,
        urgent: true,
        status: 'submitted', // Under review
        verifiedStatus: 'pending',
        has80G: true,
        imageUrl,
        beneficiaryName,
        beneficiaryLocation: beneficiaryLocation || 'New Delhi',
        hospitalName: hospitalName || 'Tertiary Care Hospital',
        organizerName,
        organizerRole,
        organizerId: user?.id || 'anonymous-user',
        organizationName: organizerRole === 'organization' ? organizationName : undefined,
        itemizedBudget: [
          { id: 'b1', item: 'Medical Procedures & Operations', amount: Number(goalAmount) * 0.7 },
          { id: 'b2', item: 'Hospital ICU & Bed Stay', amount: Number(goalAmount) * 0.2 },
          { id: 'b3', item: 'Medicines & Blood Component Support', amount: Number(goalAmount) * 0.1 },
        ],
        useOfFunds: useOfFunds || 'Direct hospital patient welfare account transfer upon audit.',
        documents: [
          {
            id: 'd1',
            title: docTitle,
            type: 'medical_estimate',
            url: '#',
            verified: false,
          },
        ],
      });

      setSubmittedId(newCampaign.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit campaign');
    }
  };

  // SUCCESS SUBMISSION SCREEN
  if (submittedId) {
    return (
      <div className="py-16 bg-[#FAF9F6] min-h-screen">
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#25845B] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202124]">
            Campaign Submitted for Review!
          </h1>
          <p className="text-sm text-[#555B63] leading-relaxed">
            Your campaign <strong>"{title}"</strong> has been received by dokind’s medical verification team.
          </p>

          <div className="p-5 bg-white rounded-2xl border border-[#E8E6E1] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Submission Reference:</span>
              <span className="font-mono font-bold text-[#202124]">{submittedId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Under Verification
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Review Window:</span>
              <span className="font-semibold text-[#202124]">4 to 24 Hours</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/fundraiser/dashboard">
              <Button variant="primary" size="md">
                Go to Fundraiser Dashboard
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" size="md">
                Browse Other Causes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Cause & Type' },
    { num: 2, title: 'Campaigner' },
    { num: 3, title: 'Story & Goal' },
    { num: 4, title: 'Documents' },
    { num: 5, title: 'Media' },
    { num: 6, title: 'Review & Submit' },
  ];

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Start a Fundraiser</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Start a Verified Fundraiser
          </h1>
          <p className="text-sm text-[#555B63]">
            Raise money for emergency surgeries, child education, or audited community non-profits with 0% platform fee.
          </p>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
            {stepsList.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-xl ${
                  step === s.num
                    ? 'bg-[#E84B45] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-50 text-[#25845B]'
                    : 'text-[#555B63] bg-[#FAF9F6]'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center border border-current text-[11px]">
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Steps Form */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CAUSE & TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 1: Select Cause & Campaign Type</h3>
                <p className="text-xs text-[#555B63]">
                  Choose the cause that best describes your fundraising need.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] uppercase tracking-wider block mb-2">
                  Cause Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAUSES_DATA.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer text-xs ${
                        category === c.id
                          ? 'border-[#E84B45] bg-[#FFF0EF] font-bold text-[#E84B45] ring-2 ring-[#E84B45]/20'
                          : 'border-[#E8E6E1] bg-[#FAF9F6] text-[#202124] hover:bg-neutral-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] uppercase tracking-wider block mb-2">
                  Campaign Model:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCampaignType('one-time')}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      campaignType === 'one-time'
                        ? 'border-[#E84B45] bg-[#FFF0EF]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#202124]">One-Time Fundraiser</div>
                    <div className="text-[11px] text-[#555B63] mt-1">
                      For acute surgeries, emergency medical bills, disaster response.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCampaignType('monthly')}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      campaignType === 'monthly'
                        ? 'border-[#E84B45] bg-[#FFF0EF]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#202124]">Monthly Mission</div>
                    <div className="text-[11px] text-[#555B63] mt-1">
                      Sustained recurring monthly support (schools, shelters, daily meals).
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCampaignType('product')}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      campaignType === 'product'
                        ? 'border-[#E84B45] bg-[#FFF0EF]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#202124]">Product Giving</div>
                    <div className="text-[11px] text-[#555B63] mt-1">
                      Procure specific physical items (school bags, blankets, ration kits).
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGNER DETAILS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 2: Campaigner Information</h3>
                <p className="text-xs text-[#555B63]">
                  Your identity details remain confidential and are used solely for verification.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={organizerRole === 'individual'}
                    onChange={() => setOrganizerRole('individual')}
                  />
                  <span>I am raising funds as an Individual / Family Member</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={organizerRole === 'organization'}
                    onChange={() => setOrganizerRole('organization')}
                  />
                  <span>I represent a Registered Non-Profit (NGO)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Mobile Number (WhatsApp Enabled) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={organizerPhone}
                    onChange={(e) => setOrganizerPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                {organizerRole === 'organization' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#202124] mb-1">
                      Organization Legal Name
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Asha Jyoti Foundation"
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: STORY & GOAL */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 3: Campaign Story & Target Goal</h3>
                <p className="text-xs text-[#555B63]">
                  Provide transparent facts about the medical diagnosis or social mission.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Help 5-Year-Old Aarav Fight Acute Leukemia at AIIMS"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Target Goal Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                    placeholder="e.g. 1000000"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Beneficiary Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder="e.g. Master Aarav Kumar"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Hospital / Institution Name (if medical)
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. AIIMS New Delhi"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Location (City / State)
                  </label>
                  <input
                    type="text"
                    value={beneficiaryLocation}
                    onChange={(e) => setBeneficiaryLocation(e.target.value)}
                    placeholder="e.g. East Delhi"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Short Summary (1-2 sentences) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summarize the urgency in 1-2 sentences"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Full Story & Medical Need
                </label>
                <textarea
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Detail the background, doctor's prognosis, what family has already spent, and why urgent public help is needed..."
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: VERIFICATION DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 4: Upload Verification Documents</h3>
                <p className="text-xs text-[#555B63]">
                  All documents are securely encrypted and checked directly with hospital patient accounts.
                </p>
              </div>

              <div className="border-2 border-dashed border-[#E8E6E1] rounded-2xl p-8 text-center bg-[#FAF9F6] space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E8E6E1] text-[#E84B45] flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#202124]">
                    Select Hospital Estimate Letter / Medical Prescriptions
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Supports PDF, PNG, JPG up to 15MB
                  </p>
                </div>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-xs text-center"
                  />
                </div>
                <span className="inline-block text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                  ✓ Document attached and queued for encrypted transmission
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: MEDIA */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 5: Campaign Photography</h3>
                <p className="text-xs text-[#555B63]">
                  High-quality photography builds donor trust and empathy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Primary Cover Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              {imageUrl && (
                <div className="relative aspect-[16/9] max-w-md rounded-xl overflow-hidden border border-[#E8E6E1]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202124]">Step 6: Review & Final Submission</h3>
                <p className="text-xs text-[#555B63]">
                  Please review all campaign details before submitting for official verification.
                </p>
              </div>

              <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] text-xs space-y-3">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Title:</span>
                  <span className="font-bold text-[#202124] text-right max-w-sm">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Goal:</span>
                  <span className="font-bold text-[#E84B45]">{formatINR(Number(goalAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Beneficiary:</span>
                  <span className="font-semibold text-[#202124]">{beneficiaryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cause:</span>
                  <span className="font-semibold text-[#202124] capitalize">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hospital:</span>
                  <span className="font-semibold text-[#202124]">{hospitalName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Campaigner:</span>
                  <span className="font-semibold text-[#202124]">{organizerName} ({organizerEmail})</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  By submitting, you confirm that all hospital estimates, clinical documents, and personal details provided are authentic. dokind verifies all claims with treating doctors before activating public donations.
                </span>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            {step > 1 ? (
              <Button type="button" variant="outline" size="md" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Previous
              </Button>
            ) : <div />}

            {step < 6 ? (
              <Button type="button" variant="primary" size="md" onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next Step
              </Button>
            ) : (
              <Button type="button" variant="success" size="lg" onClick={handleSubmit} className="font-bold">
                Submit Campaign for Verification
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
