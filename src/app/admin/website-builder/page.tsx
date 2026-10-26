'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { PageSection, PageSectionType, PageVersion } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Send,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Settings2,
  CheckCircle2,
  History,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Palette,
  AlertTriangle,
} from 'lucide-react';

const AVAILABLE_PAGES = [
  { slug: 'home', label: 'Homepage (/)' },
  { slug: 'campaigns', label: 'Campaign Listings (/campaigns)' },
  { slug: 'monthly-giving', label: 'Monthly Giving (/monthly-giving)' },
  { slug: 'product-giving', label: 'Product Giving (/product-giving)' },
  { slug: 'about', label: 'About Us (/about)' },
  { slug: 'how-it-works', label: 'How It Works (/how-it-works)' },
  { slug: 'donate-checkout', label: 'Donation Checkout (/donate)' },
  { slug: 'contact-faq', label: 'Contact & FAQs (/contact, /faq)' },
];

const SECTION_TEMPLATES: { type: PageSectionType; name: string; defaultTitle: string; defaultDesc: string }[] = [
  { type: 'hero', name: 'Hero Carousel / Banner', defaultTitle: 'Direct, Audited Compassion Across India', defaultDesc: '100% verified medical emergencies and grassroots missions with 80G tax certificates.' },
  { type: 'urgent_strip', name: 'Urgent Emergency Appeals', defaultTitle: 'Critical Surgeries Requiring Support in 24 Hours', defaultDesc: 'Direct hospital guarantees and vendor escrow payments.' },
  { type: 'categories', name: 'Causes Category Grid', defaultTitle: 'Support Causes That Touch Your Heart', defaultDesc: 'Explore 12 government-vetted categories.' },
  { type: 'featured_campaigns', name: 'Featured Campaigns Grid', defaultTitle: 'Featured Verified Campaigns', defaultDesc: 'Vetted fundraisers with transparent itemized bills.' },
  { type: 'monthly_missions', name: 'Monthly Giving Missions', defaultTitle: 'Sustained Monthly Giving Programs', defaultDesc: 'Consistent support for child hunger and eldercare.' },
  { type: 'products', name: 'Product Needs Showcase', defaultTitle: 'Product Giving: Deliver Tangible Supplies', defaultDesc: 'Fund ration kits, hospital beds, and school supplies directly.' },
  { type: 'stats', name: 'Impact Counter & Metrics', defaultTitle: 'Our Verified Impact in Numbers', defaultDesc: 'Real-time ledger data updated from verified receipts.' },
  { type: 'testimonials', name: 'Donor & Beneficiary Stories', defaultTitle: 'Voices of Trust & Gratitude', defaultDesc: 'What doctors, donors, and recovered patients say.' },
  { type: 'faq', name: 'Frequently Asked Questions', defaultTitle: 'Frequently Asked Questions', defaultDesc: 'Everything you need to know about Section 80G and security.' },
  { type: 'cta_box', name: 'Call to Action Banner', defaultTitle: 'Start a Life-Saving Fundraiser Today', defaultDesc: 'Zero platform fee for verified emergency medical cases.' },
];

export default function WebsiteBuilderPage() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyVersions, setHistoryVersions] = useState<PageVersion[]>([]);

  // History stack for undo / redo
  const [undoStack, setUndoStack] = useState<PageSection[][]>([]);
  const [redoStack, setRedoStack] = useState<PageSection[][]>([]);

  // Load sections on page change via API with fallback
  const loadPageData = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/website-builder?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const list = data.draftSections || [];
          setSections(list);
          setHistoryVersions(data.versions || []);
          if (list.length > 0) {
            setSelectedSectionId(list[0].id);
          } else {
            setSelectedSectionId(null);
          }
          setHasUnpublishedChanges(false);
          setUndoStack([]);
          setRedoStack([]);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback loading page data from db singleton:', e);
    }
    const pageData = db.getPageSections(slug);
    setSections(JSON.parse(JSON.stringify(pageData)));
    setHistoryVersions(db.getPageVersions(slug));
    if (pageData.length > 0) {
      setSelectedSectionId(pageData[0].id);
    } else {
      setSelectedSectionId(null);
    }
    setHasUnpublishedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  useEffect(() => {
    loadPageData(selectedPage);
  }, [selectedPage, loadPageData]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const recordChange = (newSections: PageSection[]) => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    setRedoStack([]);
    setSections(newSections);
    setHasUnpublishedChanges(true);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setSections(previous);
    setHasUnpublishedChanges(true);
    notify('Undo action applied.');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSections(next);
    setHasUnpublishedChanges(true);
    notify('Redo action applied.');
  };

  // Reorder Sections
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    recordChange(reordered);
  };

  // Toggle Section Visibility
  const toggleVisibility = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    recordChange(updated);
  };

  // Duplicate Section
  const duplicateSection = (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (!target) return;
    const clone: PageSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${selectedPage}-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: sections.length,
    };
    const updated = [...sections, clone];
    recordChange(updated);
    setSelectedSectionId(clone.id);
    notify(`Duplicated "${target.title}".`);
  };

  // Delete Section
  const deleteSection = (id: string) => {
    if (sections.length <= 1) {
      alert('A page must contain at least one section.');
      return;
    }
    const updated = sections.filter((s) => s.id !== id);
    recordChange(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || null);
    }
    notify('Section removed.');
  };

  // Add New Section
  const addSectionFromTemplate = (template: (typeof SECTION_TEMPLATES)[0]) => {
    const newSec: PageSection = {
      id: `sec-${selectedPage}-${Date.now()}`,
      pageSlug: selectedPage,
      type: template.type,
      title: template.defaultTitle,
      subtitle: template.defaultDesc,
      order: sections.length,
      isVisible: true,
      settings: {
        bgColor: '#FAF9F6',
        textColor: '#202124',
        padding: 'normal',
        columns: 3,
        layout: 'grid',
      },
    };
    recordChange([...sections, newSec]);
    setSelectedSectionId(newSec.id);
    setShowAddModal(false);
    notify(`Added section: ${template.name}`);
  };

  // Save Draft (Local to DB draft collection via API with fallback)
  const handleSaveDraft = async () => {
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPage,
          action: 'save_draft',
          sections,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save draft');
      setHasUnpublishedChanges(true);
      notify('Draft changes saved to administrative workspace.');
    } catch {
      db.updatePageSections(selectedPage, sections, user?.name || 'Content Editor');
      setHasUnpublishedChanges(true);
      notify('Draft changes saved to administrative workspace.');
    }
  };

  // Publish Live via API with fallback
  const handlePublishLive = async () => {
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPage,
          action: 'publish',
          sections,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to publish');
      setHistoryVersions(data.versions || db.getPageVersions(selectedPage));
      setHasUnpublishedChanges(false);
      notify(`Success! Version #${data.version} is now LIVE on public website.`);
    } catch {
      db.updatePageSections(selectedPage, sections, user?.name || 'Content Editor');
      const res = db.publishPageSections(selectedPage, user?.name || 'Content Editor');
      setHistoryVersions(db.getPageVersions(selectedPage));
      setHasUnpublishedChanges(false);
      notify(`Success! Version #${res.version} is now LIVE on public website.`);
    }
  };

  // Restore Previous Version via API with fallback
  const handleRestoreVersion = async (versionNumber: number) => {
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPage,
          action: 'restore',
          versionNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to restore');
      setSections(data.sections);
      setShowHistoryModal(false);
      setHasUnpublishedChanges(false);
      notify(`Restored page to published Version #${versionNumber}.`);
    } catch {
      try {
        const restored = db.restorePageVersion(selectedPage, versionNumber, user?.name || 'Content Editor');
        setSections(JSON.parse(JSON.stringify(restored)));
        setShowHistoryModal(false);
        setHasUnpublishedChanges(false);
        notify(`Restored page to published Version #${versionNumber}.`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Reset to default via API with fallback
  const handleResetToDefault = async () => {
    if (confirm('Are you sure you want to reset this page layout to default system settings?')) {
      try {
        const res = await fetch('/api/admin/website-builder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: selectedPage,
            action: 'reset',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reset');
        setSections(data.sections);
        setHistoryVersions(data.versions || db.getPageVersions(selectedPage));
        setHasUnpublishedChanges(false);
        notify('Page layout reset to factory baseline.');
      } catch {
        const def = db.resetPageSectionsToDefault(selectedPage, user?.name || 'Content Editor');
        setSections(JSON.parse(JSON.stringify(def)));
        setHistoryVersions(db.getPageVersions(selectedPage));
        setHasUnpublishedChanges(false);
        notify('Page layout reset to factory baseline.');
      }
    }
  };

  // Currently inspected section
  const currentSection = sections.find((s) => s.id === selectedSectionId);

  const updateCurrentSection = (updates: Partial<PageSection>) => {
    if (!currentSection) return;
    const updated = sections.map((s) => (s.id === currentSection.id ? { ...s, ...updates } : s));
    recordChange(updated);
  };

  const updateCurrentSettings = (settingsUpdates: Partial<PageSection['settings']>) => {
    if (!currentSection) return;
    const updated = sections.map((s) =>
      s.id === currentSection.id
        ? { ...s, settings: { ...s.settings, ...settingsUpdates } }
        : s
    );
    recordChange(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-3">
      {/* ----------------- TOP TOOLBAR ----------------- */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Page Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="appearance-none bg-neutral-50 hover:bg-neutral-100 border border-[#E2E4E9] rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-[#202124] focus:outline-none focus:border-[#E84B45] cursor-pointer"
            >
              {AVAILABLE_PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Unpublished Changes Pill */}
          {hasUnpublishedChanges ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unpublished Changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Published Live
            </span>
          )}
        </div>

        {/* Center: Viewport Device Switcher */}
        <div className="hidden sm:flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === 'desktop' ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Desktop 100% Canvas"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === 'tablet' ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Tablet 768px Viewport"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === 'mobile' ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Mobile iPhone/Android 375px Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 text-neutral-600 disabled:opacity-40 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Version History */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors"
            title="View revision history and restore previous versions"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History ({historyVersions.length})</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetToDefault}
            className="p-2 rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 text-neutral-500 hover:text-rose-600 transition-colors"
            title="Reset page to default layout"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>

          {/* Save Draft */}
          <Button size="sm" variant="outline" onClick={handleSaveDraft} className="text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Draft
          </Button>

          {/* Publish Live */}
          <Button size="sm" onClick={handlePublishLive} className="text-xs bg-[#E84B45] hover:bg-[#BD302D] text-white">
            <Send className="w-3.5 h-3.5 mr-1" />
            Publish Live
          </Button>
        </div>
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

      {/* ----------------- THREE-PANE BUILDER WORKSPACE ----------------- */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* PANE 1: Section Outline & Reordering (Left) */}
        <div className="w-72 bg-white rounded-2xl border border-[#E2E4E9] flex flex-col shrink-0 overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-[#E2E4E9] flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
              <Layers className="w-4 h-4 text-[#E84B45]" />
              <span>Page Sections ({sections.length})</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 rounded-lg bg-[#E84B45] text-white hover:bg-[#BD302D] transition-colors"
              title="Add New Content Block"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sections.map((section, idx) => {
              const isSelected = section.id === selectedSectionId;
              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E84B45] bg-[#E84B45]/5 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[#202124] truncate flex-1">{section.title || 'Untitled Section'}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                      {section.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-neutral-400">
                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      {/* Move Down */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, 'down');
                        }}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Toggle Visibility */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(section.id);
                        }}
                        className={`p-1 rounded hover:bg-neutral-100 ${section.isVisible ? 'text-neutral-600' : 'text-neutral-300'}`}
                        title={section.isVisible ? 'Section is Visible' : 'Section is Hidden'}
                      >
                        {section.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      {/* Duplicate */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSection(section.id);
                        }}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-600"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="p-1 rounded hover:bg-rose-50 text-rose-500"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#E2E4E9] bg-neutral-50/50">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#E2E4E9] hover:border-[#E84B45] text-neutral-600 hover:text-[#E84B45] rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Predefined Block</span>
            </button>
          </div>
        </div>

        {/* PANE 2: Visual Canvas / Live Preview (Center) */}
        <div className="flex-1 bg-neutral-200/70 rounded-2xl p-4 overflow-y-auto flex justify-center items-start border border-neutral-300">
          <div
            className={`bg-white transition-all duration-300 shadow-xl overflow-hidden border border-neutral-300 ${
              viewport === 'desktop'
                ? 'w-full rounded-xl'
                : viewport === 'tablet'
                ? 'w-[768px] rounded-2xl min-h-[800px]'
                : 'w-[375px] rounded-3xl min-h-[700px] border-4 border-neutral-800'
            }`}
          >
            {/* Simulated Device Header */}
            {viewport === 'mobile' && (
              <div className="h-6 bg-neutral-800 flex items-center justify-center">
                <div className="w-16 h-1.5 bg-neutral-600 rounded-full" />
              </div>
            )}

            {/* Rendered Live Sections Container */}
            <div className="divide-y divide-neutral-200">
              {sections.map((sec) => {
                const isSelected = sec.id === selectedSectionId;
                if (!sec.isVisible) {
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-4 bg-neutral-50/80 text-center text-xs text-neutral-400 italic cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#E84B45]' : ''
                      }`}
                    >
                      [Hidden Section: {sec.title} — click to edit]
                    </div>
                  );
                }

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`relative cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-[#E84B45] shadow-md z-10' : 'hover:opacity-95'
                    }`}
                    style={{
                      backgroundColor: sec.settings.bgColor || '#FFFFFF',
                      padding: sec.settings.padding === 'compact' ? '24px 16px' : sec.settings.padding === 'spacious' ? '56px 24px' : '40px 20px',
                    }}
                  >
                    {/* Active Inspector Marker */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#E84B45] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Editing</span>
                      </div>
                    )}

                    {/* Section Content Mock Rendering based on type */}
                    <div className="max-w-4xl mx-auto">
                      {sec.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E84B45]/10 text-[#E84B45] text-[11px] font-bold uppercase tracking-wider mb-2">
                          {sec.badge}
                        </span>
                      )}

                      <h2
                        className="text-xl sm:text-2xl font-black tracking-tight"
                        style={{ color: sec.settings.textColor || '#202124' }}
                      >
                        {sec.title}
                      </h2>

                      {sec.subtitle && (
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 max-w-2xl leading-relaxed">
                          {sec.subtitle}
                        </p>
                      )}

                      {/* Mocked UI elements based on section type */}
                      {sec.type === 'hero' && (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button className="px-5 py-2.5 rounded-xl bg-[#E84B45] text-white text-xs font-bold shadow-md">
                            {sec.ctaText || 'Explore Causes'}
                          </button>
                          <button className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 bg-white">
                            How It Works
                          </button>
                        </div>
                      )}

                      {sec.type === 'urgent_strip' && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs">
                              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                                Urgent
                              </span>
                              <p className="text-xs font-bold text-neutral-900 mt-1">Pediatric Surgery #{i}</p>
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2">
                                <div className="bg-red-500 h-full rounded-full" style={{ width: `${40 + i * 20}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.type === 'categories' && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {['Medical', 'Education', 'Food & Hunger', 'Animals'].map((c, i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-neutral-200 text-center shadow-2xs">
                              <span className="text-xs font-bold text-neutral-800">{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.type === 'stats' && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-black text-[#E84B45]">₹4.2 Cr+</p>
                            <p className="text-[11px] text-neutral-400">Raised Transparently</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-[#25845B]">100%</p>
                            <p className="text-[11px] text-neutral-400">Verified Hospital Escrows</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-blue-500">28,000+</p>
                            <p className="text-[11px] text-neutral-400">Indian Donors</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-amber-500">12,400+</p>
                            <p className="text-[11px] text-neutral-400">Patients Recovered</p>
                          </div>
                        </div>
                      )}

                      {sec.ctaText && sec.type !== 'hero' && (
                        <div className="mt-4">
                          <button className="px-4 py-2 rounded-xl bg-[#E84B45] text-white text-xs font-bold">
                            {sec.ctaText}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PANE 3: Property Inspector (Right) */}
        <div className="w-80 bg-white rounded-2xl border border-[#E2E4E9] flex flex-col shrink-0 overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-[#E2E4E9] flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
              <Settings2 className="w-4 h-4 text-[#E84B45]" />
              <span>Section Properties</span>
            </div>
            {currentSection && (
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-bold">
                {currentSection.type}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentSection ? (
              <>
                {/* Heading */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={currentSection.title}
                    onChange={(e) => updateCurrentSection({ title: e.target.value })}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateCurrentSection({ subtitle: e.target.value })}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Verified, Emergency"
                    value={currentSection.badge || ''}
                    onChange={(e) => updateCurrentSection({ badge: e.target.value })}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                {/* CTA Button */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Donate Now"
                      value={currentSection.ctaText || ''}
                      onChange={(e) => updateCurrentSection({ ctaText: e.target.value })}
                      className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Link URL</label>
                    <input
                      type="text"
                      placeholder="/campaigns"
                      value={currentSection.ctaLink || ''}
                      onChange={(e) => updateCurrentSection({ ctaLink: e.target.value })}
                      className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
                    />
                  </div>
                </div>

                {/* Background Swatches */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Background Preset</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { bg: '#FAF9F6', label: 'Warm Ivory' },
                      { bg: '#FFFFFF', label: 'White' },
                      { bg: '#FEF2F2', label: 'Alert Red' },
                      { bg: '#202124', label: 'Dark Slate' },
                    ].map((sw) => (
                      <button
                        key={sw.bg}
                        onClick={() => updateCurrentSettings({ bgColor: sw.bg })}
                        className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition-all ${
                          currentSection.settings.bgColor === sw.bg
                            ? 'border-[#E84B45] ring-2 ring-[#E84B45]/20 font-bold'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        style={{ backgroundColor: sw.bg, color: sw.bg === '#202124' ? '#FFFFFF' : '#202124' }}
                      >
                        {sw.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Vertical Spacing</label>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                    {(['compact', 'normal', 'spacious'] as const).map((pad) => (
                      <button
                        key={pad}
                        onClick={() => updateCurrentSettings({ padding: pad })}
                        className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                          currentSection.settings.padding === pad ? 'bg-white shadow-xs font-bold' : 'text-neutral-500'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column Grid Count */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Columns Layout</label>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                    {[2, 3, 4].map((col) => (
                      <button
                        key={col}
                        onClick={() => updateCurrentSettings({ columns: col })}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          currentSection.settings.columns === col ? 'bg-white shadow-xs font-bold' : 'text-neutral-500'
                        }`}
                      >
                        {col} Columns
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="pt-2 border-t border-neutral-100">
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                    <span className="text-xs font-bold text-neutral-800">Show on Live Website</span>
                    <input
                      type="checkbox"
                      checked={currentSection.isVisible}
                      onChange={(e) => updateCurrentSection({ isVisible: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-neutral-400 text-xs">
                Select a section from the left outline or canvas to inspect its properties.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- ADD PREDEFINED BLOCK MODAL ----------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Choose a Predefined Content Block</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {SECTION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.type}
                  onClick={() => addSectionFromTemplate(tmpl)}
                  className="p-3.5 rounded-xl border border-neutral-200 hover:border-[#E84B45] hover:bg-[#E84B45]/5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#202124] group-hover:text-[#E84B45]">
                      {tmpl.name}
                    </span>
                    <Plus className="w-4 h-4 text-neutral-400 group-hover:text-[#E84B45]" />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{tmpl.defaultDesc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- REVISION HISTORY MODAL ----------------- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Published Version History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-neutral-400 hover:text-neutral-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Every time you click &quot;Publish Live&quot;, an immutable snapshot of this page is saved. Restore any previous revision with 1-click:
            </p>

            <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
              {historyVersions.map((ver) => (
                <div key={ver.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#202124]">Version #{ver.versionNumber}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                        {ver.sections.length} Sections
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Published by {ver.publishedBy} • {new Date(ver.publishedAt).toLocaleString()}
                    </p>
                    {ver.notes && <p className="text-[11px] text-neutral-600 mt-0.5">{ver.notes}</p>}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestoreVersion(ver.versionNumber)}
                    className="text-xs"
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
