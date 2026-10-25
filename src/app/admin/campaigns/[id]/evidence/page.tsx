'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  FileCheck2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Trash2,
  Check,
  X,
  Cloud,
  Eye,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export default function CampaignEvidenceVaultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add Document Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'medical_estimate' | 'id_proof' | 'ngo_reg' | 'tax_cert' | 'other'>('medical_estimate');
  const [docUrl, setDocUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [cloudProvider, setCloudProvider] = useState<'google_drive' | 'dropbox' | 'onedrive' | 's3' | 'other'>('google_drive');
  const [reviewerNotes, setReviewerNotes] = useState('');

  const isSuperAdminOrReviewer =
    currentUser?.role === 'super_admin' || currentUser?.role === 'reviewer' || currentUser?.role === 'ops_admin';

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
    }
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E2E4E9] text-center text-xs text-neutral-500">
        Campaign not found.
      </div>
    );
  }

  const documents = campaign.documents || [];

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) return;

    try {
      const updated = db.addCampaignEvidenceDocument(
        campaign.id,
        {
          title: docTitle.trim(),
          type: docType,
          url: docUrl.trim(),
          isPublic,
          cloudProvider,
          status: isSuperAdminOrReviewer ? 'verified' : 'under_review',
          verified: isSuperAdminOrReviewer,
          reviewerNotes: reviewerNotes.trim() || undefined,
        },
        currentUser?.name || 'Administrator'
      );

      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify(`Evidence document "${docTitle}" attached successfully.`);
      }

      setAddModalOpen(false);
      setDocTitle('');
      setDocUrl('');
      setReviewerNotes('');
      setIsPublic(false);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleToggleVerification = (docId: string, currentStatus: string) => {
    if (!isSuperAdminOrReviewer) return;
    const newStatus = currentStatus === 'verified' ? 'under_review' : 'verified';
    try {
      const updated = db.updateCampaignEvidenceDocument(
        campaign.id,
        docId,
        {
          status: newStatus,
          verified: newStatus === 'verified',
        },
        currentUser?.name || 'Reviewer'
      );
      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify(`Document verification status changed to "${newStatus}".`);
      }
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleTogglePrivacy = (docId: string, currentPublic: boolean) => {
    try {
      const updated = db.updateCampaignEvidenceDocument(
        campaign.id,
        docId,
        {
          isPublic: !currentPublic,
        },
        currentUser?.name || 'Administrator'
      );
      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify(`Document visibility changed to ${!currentPublic ? 'Public' : 'Restricted Internal'}.`);
      }
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (!confirm('Are you sure you want to remove this evidence document?')) return;
    try {
      const updated = db.deleteCampaignEvidenceDocument(
        campaign.id,
        docId,
        currentUser?.name || 'Administrator'
      );
      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify('Evidence document removed.');
      }
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ----------------- BREADCRUMB ----------------- */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaign Hub</span>
        </Link>

        <Button
          size="sm"
          onClick={() => setAddModalOpen(true)}
          className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Attach Evidence Document
        </Button>
      </div>

      {/* ----------------- TOAST FEEDBACK ----------------- */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* ----------------- HEADER CARD ----------------- */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-purple-50 text-purple-600">
            <FileCheck2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Document &amp; Cloud Evidence Vault
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
          Verification Documents &amp; Audit Records
        </h1>
        <p className="text-xs text-[#555B63] max-w-2xl">
          Secure repository for hospital surgical estimates, doctor bills, NGO 12A/80G filings, and procurement receipts. You have granular control over which proof is <strong>Public</strong> for donors versus <strong>Restricted Internal</strong> for compliance auditors.
        </p>
      </div>

      {/* ----------------- DOCUMENTS LIST ----------------- */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E4E9] p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">No documents attached yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Attach hospital estimates, patient UHID certificates, or NGO Darpan filings.
            </p>
            <Button size="sm" onClick={() => setAddModalOpen(true)} className="text-xs bg-[#EF4949] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Attach Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => {
              const isDocVerified = doc.status === 'verified' || doc.verified;
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E4E9] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-300 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900">
                          {doc.title}
                        </h3>

                        {/* Visibility Pill */}
                        <button
                          type="button"
                          onClick={() => handleTogglePrivacy(doc.id, Boolean(doc.isPublic))}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                            doc.isPublic
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                          title="Click to toggle Public vs Internal"
                        >
                          {doc.isPublic ? <Globe2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{doc.isPublic ? 'Public Evidence' : 'Restricted Internal'}</span>
                        </button>

                        {/* Verification Status Pill */}
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(doc.id, doc.status || 'uploaded')}
                          disabled={!isSuperAdminOrReviewer}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                            isDocVerified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                          title={isSuperAdminOrReviewer ? 'Click to toggle verified' : undefined}
                        >
                          {isDocVerified ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{isDocVerified ? 'Verified by Reviewer' : doc.status || 'Under Review'}</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                        {doc.cloudProvider && (
                          <>
                            <span>•</span>
                            <span className="capitalize font-mono text-[11px] text-blue-600">{doc.cloudProvider}</span>
                          </>
                        )}
                        {doc.fileSize && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-neutral-400">{doc.fileSize}</span>
                          </>
                        )}
                      </div>

                      {doc.reviewerNotes && (
                        <p className="text-[11px] text-neutral-500 italic pt-0.5">
                          Notes: {doc.reviewerNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-500" />
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ----------------- MODAL: ATTACH DOCUMENT ----------------- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleAddDocument} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 border border-[#E2E4E9] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#202124]">
                Attach Evidence Document
              </h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIIMS Pediatric Cardiac Surgery Cost Estimate"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    <option value="medical_estimate">Hospital Estimate / Bill</option>
                    <option value="id_proof">Patient / Beneficiary ID Proof</option>
                    <option value="ngo_reg">NGO Darpan / Registration</option>
                    <option value="tax_cert">Section 80G / 12A Certificate</option>
                    <option value="other">Procurement / Other Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Cloud Storage Provider
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={(e) => setCloudProvider(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    <option value="google_drive">Google Drive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="s3">AWS S3 Vault</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  File URL or Cloud Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EF4949] accent-[#EF4949]"
                  />
                  <span className="text-xs font-bold text-neutral-800">
                    Make Visible to Public Donors
                  </span>
                </label>
                <p className="text-[11px] text-neutral-500 pl-6">
                  If unchecked, this file will remain <strong>Restricted Internal</strong>, visible only to verified reviewers and Super Administrators.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Reviewer Notes / Verification Context
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cross-checked with hospital billing office on Oct 22..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white">
                Attach Document
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
