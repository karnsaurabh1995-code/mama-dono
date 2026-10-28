'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db, DEFAULT_BADGE_STYLES } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { BadgeType, BadgeStyleConfig } from '@/lib/types';
import { CampaignBadge } from '@/components/campaign/CampaignBadge';
import { Button } from '@/components/ui/Button';
import {
  Tag,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Save,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export default function BadgeStylesAdminPage() {
  const { user } = useAuth();
  const [badgeStyles, setBadgeStyles] = useState<Record<BadgeType, BadgeStyleConfig>>(() =>
    typeof db?.getBadgeStyles === 'function' ? db.getBadgeStyles() : { ...DEFAULT_BADGE_STYLES }
  );
  const [selectedType, setSelectedType] = useState<BadgeType>('verified');
  const [previewDark, setPreviewDark] = useState<boolean>(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string>('');

  const currentStyle = badgeStyles[selectedType];

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUpdateCurrent = (updates: Partial<BadgeStyleConfig>) => {
    setBadgeStyles((prev) => ({
      ...prev,
      [selectedType]: {
        ...prev[selectedType],
        ...updates,
      },
    }));
  };

  const handleUpdateCardVariant = (updates: Partial<BadgeStyleConfig['cardVariant']>) => {
    setBadgeStyles((prev) => ({
      ...prev,
      [selectedType]: {
        ...prev[selectedType],
        cardVariant: {
          ...prev[selectedType].cardVariant,
          ...updates,
        },
      },
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    Object.values(badgeStyles).forEach((cfg) => {
      db.updateBadgeStyle(cfg.id, cfg, user?.name || 'Administrator');
    });
    notify('Badge and tag appearance styles saved and published across the platform!');
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to restore factory default badge styles?')) {
      const reset = typeof db?.resetBadgeStyles === 'function'
        ? db.resetBadgeStyles(user?.name || 'Administrator')
        : { ...DEFAULT_BADGE_STYLES };
      setBadgeStyles(reset);
      notify('All badge styles restored to factory defaults.');
    }
  };

  const badgeTypesList: { id: BadgeType; label: string; desc: string }[] = [
    {
      id: 'verified',
      label: 'Verified Cause',
      desc: 'Shown only for campaigns backed by verified hospital/NGO credentials.',
    },
    {
      id: 'tax_80g',
      label: 'Tax Benefits',
      desc: 'Shown only for campaigns confirmed eligible under Section 80G.',
    },
    {
      id: 'urgent',
      label: 'Urgent Support',
      desc: 'Shown only for campaigns with administrator-approved emergency status.',
    },
    {
      id: 'cause_category',
      label: 'Cause Category',
      desc: 'Category indicator (Medical, Education, Hunger, Animal Welfare).',
    },
    {
      id: 'new',
      label: 'New Campaign',
      desc: 'Shown automatically for recently launched grassroots initiatives.',
    },
    {
      id: 'fully_funded',
      label: 'Fully Funded',
      desc: 'Shown when net contributions reach or exceed 100% of target.',
    },
    {
      id: 'completed',
      label: 'Mission Completed',
      desc: 'Shown when field implementation and patient recovery are concluded.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/admin/settings" className="hover:text-neutral-600">
              Settings
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#202124] font-semibold">Badge & Tag Styles</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1 flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[#EF4949]" />
            Campaign Badge & Tag Appearance Manager
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage global colors, typography, shapes, and placement variants across homepage tiles and campaign detail pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="bg-[#EF4949] hover:bg-[#D9363E] text-white font-bold text-xs"
          >
            Save & Publish Styles
          </Button>
        </div>
      </div>

      {/* Critical Verification Guard Notice */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Separation of Style from Factual Truth:</strong>
          <span>
            This manager controls visual styling (colors, geometry, and fonts). Legitimate status (Verified, 80G tax eligibility, and Urgency) is strictly derived from verified database records. Ineligible campaigns never display badges regardless of style configurations.
          </span>
        </div>
      </div>

      {/* Main 2-Column Interface: Left Badge Selector & Live Previews, Right Style Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Badge List & Real-time Live Previews */}
        <div className="lg:col-span-5 space-y-5">
          {/* Badge Types Tabs */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 px-1 mb-2">
              Select Badge Type to Customize
            </h3>
            <div className="space-y-1">
              {badgeTypesList.map((item) => {
                const isSelected = selectedType === item.id;
                const style = badgeStyles[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedType(item.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF9F6] border-2 border-[#EF4949] shadow-xs'
                        : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#202124]">{item.label}</span>
                        {!style.isEnabled && (
                          <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.2 rounded font-mono">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">{item.desc}</p>
                    </div>

                    <div className="shrink-0">
                      <CampaignBadge
                        type={item.id}
                        variant="card"
                        styleOverride={style}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#EF4949]" />
                Live Real-Time Preview
              </span>

              {/* Viewport & Background Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewDark(!previewDark)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    previewDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                  title="Toggle light / dark background"
                >
                  {previewDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport(previewViewport === 'desktop' ? 'mobile' : 'desktop')}
                  className="p-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-700 cursor-pointer"
                  title="Toggle desktop / mobile preview"
                >
                  {previewViewport === 'desktop' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div
              className={`p-6 rounded-2xl transition-colors duration-300 space-y-5 ${
                previewDark ? 'bg-[#18191B] text-white' : 'bg-[#FAF9F6] text-[#202124] border border-[#E8E6E1]'
              } ${previewViewport === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'}`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider block mb-2 opacity-60">
                  Placement 1: Campaign Detail Hero (Prominent Variant)
                </span>
                <div className="p-3 bg-white/10 rounded-xl flex items-center gap-2">
                  <CampaignBadge
                    type={selectedType}
                    variant="detail"
                    styleOverride={currentStyle}
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider block mb-2 opacity-60">
                  Placement 2: Homepage Card Tile (Compact Variant)
                </span>
                <div className="p-3 bg-white/10 rounded-xl flex items-center gap-2">
                  <CampaignBadge
                    type={selectedType}
                    variant="card"
                    styleOverride={currentStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Comprehensive Style Configuration Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-bold text-[#202124]">
                Editing Appearance: {currentStyle.label}
              </h2>
              <p className="text-xs text-[#555B63]">
                Adjust shape, colors, typography, and compact card overrides.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentStyle.isEnabled}
                onChange={(e) => handleUpdateCurrent({ isEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#EF4949] focus:ring-[#EF4949]"
              />
              <span className="text-xs font-semibold text-[#202124]">Badge Enabled</span>
            </label>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
            {/* 1. Label and Default Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#202124] mb-1">Badge Title / Label</label>
                <input
                  type="text"
                  value={currentStyle.label}
                  onChange={(e) => handleUpdateCurrent({ label: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#EF4949]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#202124] mb-1">Default Display Text</label>
                <input
                  type="text"
                  value={currentStyle.defaultText}
                  onChange={(e) => handleUpdateCurrent({ defaultText: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#EF4949]"
                />
              </div>
            </div>

            {/* 2. Color Palette Settings */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-[#202124]">Colors & Border</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStyle.backgroundColor}
                      onChange={(e) => handleUpdateCurrent({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-neutral-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentStyle.backgroundColor}
                      onChange={(e) => handleUpdateCurrent({ backgroundColor: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStyle.textColor}
                      onChange={(e) => handleUpdateCurrent({ textColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-neutral-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentStyle.textColor}
                      onChange={(e) => handleUpdateCurrent({ textColor: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Border Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStyle.borderColor}
                      onChange={(e) => handleUpdateCurrent({ borderColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-neutral-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentStyle.borderColor}
                      onChange={(e) => handleUpdateCurrent({ borderColor: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Shape & Geometry */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-[#202124]">Shape, Corner Radius & Shadow</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Corner Geometry</label>
                  <select
                    value={currentStyle.borderRadius}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        borderRadius: e.target.value as BadgeStyleConfig['borderRadius'],
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="pill">Pill Shape (Full Rounded)</option>
                    <option value="rounded-lg">Rounded Large (12px)</option>
                    <option value="rounded-md">Rounded Medium (6px)</option>
                    <option value="square">Square Corners (0px)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Border Width (px)</label>
                  <select
                    value={currentStyle.borderWidth}
                    onChange={(e) => handleUpdateCurrent({ borderWidth: Number(e.target.value) })}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value={0}>0px (Border None)</option>
                    <option value={1}>1px (Subtle Outline)</option>
                    <option value={2}>2px (Distinct Outline)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Drop Shadow</label>
                  <select
                    value={currentStyle.shadow}
                    onChange={(e) =>
                      handleUpdateCurrent({ shadow: e.target.value as BadgeStyleConfig['shadow'] })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="none">None</option>
                    <option value="xs">Extra Subtle (2xs)</option>
                    <option value="sm">Soft Shadow (xs)</option>
                    <option value="md">Medium Shadow (sm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Icon Customization */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-[#202124]">Icon Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Icon Selection</label>
                  <select
                    value={currentStyle.icon}
                    onChange={(e) =>
                      handleUpdateCurrent({ icon: e.target.value as BadgeStyleConfig['icon'] })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="shield">Shield Check</option>
                    <option value="flame">Flame (Urgent)</option>
                    <option value="percent">80G Badge Icon</option>
                    <option value="check">Checkmark</option>
                    <option value="sparkles">Sparkles</option>
                    <option value="award">Award Medal</option>
                    <option value="tag">Category Tag</option>
                    <option value="clock">Clock</option>
                    <option value="none">No Icon (Text Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Icon Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStyle.iconColor || currentStyle.textColor}
                      onChange={(e) => handleUpdateCurrent({ iconColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-neutral-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentStyle.iconColor || currentStyle.textColor}
                      onChange={(e) => handleUpdateCurrent({ iconColor: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Detail Icon Size (px)</label>
                  <input
                    type="number"
                    min={8}
                    max={24}
                    value={currentStyle.iconSize}
                    onChange={(e) => handleUpdateCurrent({ iconSize: Number(e.target.value) || 14 })}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 5. Typography & Padding (Detail Hero Sizing) */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-[#202124]">
                Detail Hero Sizing (Campaign Detail Page)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    min={9}
                    max={20}
                    value={currentStyle.fontSize}
                    onChange={(e) => handleUpdateCurrent({ fontSize: Number(e.target.value) || 12 })}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Font Weight</label>
                  <select
                    value={currentStyle.fontWeight}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        fontWeight: e.target.value as BadgeStyleConfig['fontWeight'],
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-xs"
                  >
                    <option value="medium">Medium</option>
                    <option value="semibold">SemiBold</option>
                    <option value="bold">Bold</option>
                    <option value="black">Black</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Padding X (px)</label>
                  <input
                    type="number"
                    min={4}
                    max={28}
                    value={currentStyle.paddingX}
                    onChange={(e) => handleUpdateCurrent({ paddingX: Number(e.target.value) || 10 })}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Padding Y (px)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={currentStyle.paddingY}
                    onChange={(e) => handleUpdateCurrent({ paddingY: Number(e.target.value) || 4 })}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 6. Card Variant Overrides (Compact Homepage / Listing Tiles) */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 p-4 bg-[#FAF9F6] rounded-2xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Compact Card Placement Overrides
                  </h3>
                  <p className="text-[11px] text-[#555B63]">
                    Used on homepage campaign cards, discovery listings, and featured grids.
                  </p>
                </div>
                <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Inherited Colors
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Card Font Size</label>
                  <input
                    type="number"
                    min={8}
                    max={14}
                    value={currentStyle.cardVariant?.fontSize || 10}
                    onChange={(e) => handleUpdateCardVariant({ fontSize: Number(e.target.value) || 10 })}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Card Icon Size</label>
                  <input
                    type="number"
                    min={8}
                    max={16}
                    value={currentStyle.cardVariant?.iconSize || 12}
                    onChange={(e) => handleUpdateCardVariant({ iconSize: Number(e.target.value) || 12 })}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Card Padding X</label>
                  <input
                    type="number"
                    min={4}
                    max={20}
                    value={currentStyle.cardVariant?.paddingX || 7}
                    onChange={(e) => handleUpdateCardVariant({ paddingX: Number(e.target.value) || 7 })}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Card Padding Y</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={currentStyle.cardVariant?.paddingY || 2}
                    onChange={(e) => handleUpdateCardVariant({ paddingY: Number(e.target.value) || 2 })}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-[#EF4949] hover:bg-[#D9363E] text-white font-bold"
              >
                Save Style Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
