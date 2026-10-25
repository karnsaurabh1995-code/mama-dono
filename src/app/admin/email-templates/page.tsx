'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { EmailTemplate } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { sanitizeHtml } from '@/lib/security/sanitize';
import {
  Mail,
  Save,
  CheckCircle2,
  Eye,
  Code,
  Sparkles,
  Send,
} from 'lucide-react';

export default function EmailTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>(db.getEmailTemplates());
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || '');
  const [subject, setSubject] = useState<string>(templates[0]?.subject || '');
  const [bodyHtml, setBodyHtml] = useState<string>(templates[0]?.bodyHtml || '');
  const [toastMessage, setToastMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');

  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    setSelectedId(tpl.id);
    setSubject(tpl.subject);
    setBodyHtml(tpl.bodyHtml);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateEmailTemplate(
      selectedId,
      { subject, bodyHtml },
      user?.name || 'Admin'
    );
    if (updated) {
      setTemplates([...db.getEmailTemplates()]);
      notify(`Template "${updated.name}" updated successfully.`);
    }
  };

  // Generate simulated preview by replacing variable tokens
  const renderedPreviewHtml = bodyHtml
    .replace(/{{donor_name}}/g, 'Rohan Mehra')
    .replace(/{{amount}}/g, '5,000')
    .replace(/{{campaign_title}}/g, 'Emergency Cardiac Surgery for 3-Year-Old Aarav')
    .replace(/{{receipt_number}}/g, 'REC-2026-99018')
    .replace(/{{date}}/g, '23 October 2026')
    .replace(/{{payment_method}}/g, 'UPI (Google Pay)')
    .replace(/{{organizer_name}}/g, 'Ramesh Devendra')
    .replace(/{{campaign_url}}/g, 'https://sevasetu.org.in/campaigns/aarav-heart-surgery');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Mail className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Communication Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Transactional Email & 80G Receipt Templates
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Customize HTML emails, Section 80G certificate layouts, and automated milestone updates.
          </p>
        </div>

        <Button size="sm" onClick={handleSave} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Template
        </Button>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Template Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => handleSelectTemplate(tpl)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white shadow-2xs ${
              selectedId === tpl.id ? 'border-[#E84B45] ring-2 ring-[#E84B45]/15' : 'border-[#E2E4E9] hover:border-neutral-300'
            }`}
          >
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-bold">
              {tpl.triggerEvent}
            </span>
            <h3 className="text-xs font-bold text-[#202124] mt-2 line-clamp-1">{tpl.name}</h3>
          </div>
        ))}
      </div>

      {/* Editor & Preview Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">{currentTemplate.name}</h3>
              <p className="text-xs text-neutral-400">Trigger: {currentTemplate.triggerEvent}</p>
            </div>
            {/* Variables tag pills */}
            <div className="flex flex-wrap gap-1">
              {currentTemplate.variables.map((v) => (
                <span key={v} className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Subject Line *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-700">HTML Email Body *</label>
              <span className="text-[10px] text-neutral-400 font-mono">KaTeX / HTML</span>
            </div>
            <textarea
              rows={14}
              required
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#E84B45]"
            />
          </div>
        </div>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Simulated Inbox Preview</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              Live Mock Data
            </span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <p className="text-neutral-500">
              <strong className="text-neutral-800">Subject:</strong> {subject}
            </p>
            <p className="text-neutral-500 mt-1">
              <strong className="text-neutral-800">From:</strong> SevaSetu Foundation &lt;donations@sevasetu.org.in&gt;
            </p>
          </div>

          <div className="flex-1 bg-white border border-neutral-200 rounded-xl p-4 overflow-y-auto max-h-[450px]">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderedPreviewHtml) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
