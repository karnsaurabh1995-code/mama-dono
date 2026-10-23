'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { ThemeConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Palette,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  Type,
  Square,
  Sun,
  Layout,
  Megaphone,
  Eye,
  Sliders,
} from 'lucide-react';

export default function ThemeAppearancePage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeConfig>(db.getThemeConfig());
  const [toastMessage, setToastMessage] = useState<string>('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdate = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateThemeConfig(theme, user?.name || 'Admin');
    notify('Theme & design tokens successfully updated and saved across the platform.');
  };

  const handleReset = () => {
    if (confirm('Reset all theme settings to the original brand defaults?')) {
      const reset = db.resetThemeConfig(user?.name || 'Admin');
      setTheme(reset);
      notify('Theme reset to initial SevaSetu design system specifications.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Palette className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Appearance Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Global Theme, Typography & Design Tokens
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Configure platform branding, color contrast, component corner radiuses, and announcements without redeploying code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs text-neutral-600">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs bg-[#E84B45] hover:bg-[#BD302D] text-white">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save & Apply
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand Colors */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#E84B45]" />
                <span>Brand Color Palette (WCAG Compliant)</span>
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono">CSS Variables</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Primary Color (Actions)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Primary Dark (Hover/Focus)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryDarkColor}
                    onChange={(e) => handleUpdate({ primaryDarkColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.primaryDarkColor}
                    onChange={(e) => handleUpdate({ primaryDarkColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Heading Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.headingColor}
                    onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.headingColor}
                    onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Body Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.bodyColor}
                    onChange={(e) => handleUpdate({ bodyColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.bodyColor}
                    onChange={(e) => handleUpdate({ bodyColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Page Background (Warm Ivory)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Card Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.cardBackgroundColor}
                    onChange={(e) => handleUpdate({ cardBackgroundColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.cardBackgroundColor}
                    onChange={(e) => handleUpdate({ cardBackgroundColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Verified / Success Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.successColor}
                    onChange={(e) => handleUpdate({ successColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.successColor}
                    onChange={(e) => handleUpdate({ successColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Emergency / Urgent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.urgentColor}
                    onChange={(e) => handleUpdate({ urgentColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.urgentColor}
                    onChange={(e) => handleUpdate({ urgentColor: e.target.value })}
                    className="flex-1 bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Shape Geometry */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Type className="w-4 h-4 text-[#E84B45]" />
                <span>Typography & Corner Radius</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Primary Font Family</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => handleUpdate({ fontFamily: e.target.value as any })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800"
                >
                  <option value="Inter">Inter (Clean, Legible, Indian Tech Standard)</option>
                  <option value="Manrope">Manrope (Modern Geometric Sans)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
                  <option value="Outfit">Outfit (Warm & Expressive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Button Corner Radius</label>
                <select
                  value={theme.buttonRadius}
                  onChange={(e) => handleUpdate({ buttonRadius: e.target.value as any })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800"
                >
                  <option value="none">Sharp (0px)</option>
                  <option value="sm">Subtle (4px)</option>
                  <option value="md">Rounded (8px)</option>
                  <option value="lg">Soft Curved (12px)</option>
                  <option value="full">Pill (9999px - Default)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Card Border Radius</label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => handleUpdate({ borderRadius: e.target.value as any })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800"
                >
                  <option value="none">Sharp Square (0px)</option>
                  <option value="sm">Small (6px)</option>
                  <option value="md">Medium (10px)</option>
                  <option value="lg">Large (16px - Default)</option>
                  <option value="xl">Extra Large (24px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Header Style</label>
                <select
                  value={theme.headerStyle}
                  onChange={(e) => handleUpdate({ headerStyle: e.target.value as any })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800"
                >
                  <option value="sticky">Sticky with Background Blur (Recommended)</option>
                  <option value="static">Static (Scrolls away)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top Announcement Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#E84B45]" />
                <span>Global Site Announcement Bar</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-neutral-600">Enabled</span>
                <input
                  type="checkbox"
                  checked={theme.announcementBarVisible}
                  onChange={(e) => handleUpdate({ announcementBarVisible: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
              </label>
            </div>

            {theme.announcementBarVisible && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Announcement Message</label>
                  <input
                    type="text"
                    value={theme.announcementText || ''}
                    onChange={(e) => handleUpdate({ announcementText: e.target.value })}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Link Target</label>
                    <input
                      type="text"
                      placeholder="/causes/medical"
                      value={theme.announcementLink || ''}
                      onChange={(e) => handleUpdate({ announcementLink: e.target.value })}
                      className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Background Tint</label>
                    <input
                      type="text"
                      placeholder="#FEF2F2"
                      value={theme.announcementBg || ''}
                      onChange={(e) => handleUpdate({ announcementBg: e.target.value })}
                      className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Visual Simulation Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs sticky top-4 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Design Token Preview</span>
              </h3>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Dynamic Canvas</span>
            </div>

            {/* Simulated Live Announcement */}
            {theme.announcementBarVisible && (
              <div
                className="p-2.5 rounded-xl border text-center text-xs font-semibold"
                style={{
                  backgroundColor: theme.announcementBg || '#FEF2F2',
                  borderColor: theme.borderColor,
                  color: theme.primaryColor,
                }}
              >
                {theme.announcementText || 'Alert Banner'}
              </div>
            )}

            {/* Simulated Card with Tokens */}
            <div
              className="p-5 border transition-all"
              style={{
                backgroundColor: theme.cardBackgroundColor,
                borderColor: theme.borderColor,
                borderRadius:
                  theme.borderRadius === 'full'
                    ? '9999px'
                    : theme.borderRadius === 'xl'
                    ? '24px'
                    : theme.borderRadius === 'lg'
                    ? '16px'
                    : theme.borderRadius === 'md'
                    ? '10px'
                    : '4px',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                  }}
                >
                  Verified Medical
                </span>
                <span
                  className="text-[10px] font-bold flex items-center gap-1"
                  style={{ color: theme.successColor }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>80G Eligible</span>
                </span>
              </div>

              <h4
                className="text-base font-black mt-3 leading-snug"
                style={{ color: theme.headingColor, fontFamily: theme.fontFamily }}
              >
                Pediatric Heart Surgery for 4-Year-Old Ananya
              </h4>

              <p
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: theme.bodyColor, fontFamily: theme.fontFamily }}
              >
                AIIMS Hospital cardiac recovery ward. Medical billing estimate confirmed by Chief Cardiac Surgeon.
              </p>

              {/* Progress bar with theme */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span style={{ color: theme.primaryColor }}>₹3,50,000</span>
                  <span style={{ color: theme.bodyColor }}>Goal: ₹5,00,000</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: theme.primaryColor }} />
                </div>
              </div>

              {/* Action Buttons with Button Radius */}
              <div className="mt-5 flex items-center gap-2">
                <button
                  className="flex-1 py-2.5 px-4 text-white text-xs font-bold transition-all shadow-sm"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius:
                      theme.buttonRadius === 'full'
                        ? '9999px'
                        : theme.buttonRadius === 'lg'
                        ? '12px'
                        : theme.buttonRadius === 'md'
                        ? '8px'
                        : '4px',
                  }}
                >
                  Donate ₹1,000
                </button>

                <button
                  className="py-2.5 px-4 border text-xs font-bold transition-all"
                  style={{
                    borderColor: theme.borderColor,
                    color: theme.headingColor,
                    borderRadius:
                      theme.buttonRadius === 'full'
                        ? '9999px'
                        : theme.buttonRadius === 'lg'
                        ? '12px'
                        : theme.buttonRadius === 'md'
                        ? '8px'
                        : '4px',
                  }}
                >
                  Share
                </button>
              </div>
            </div>

            {/* Token Inspect Output */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] font-mono text-neutral-600 space-y-1">
              <p>--color-primary: <span className="font-bold text-[#202124]">{theme.primaryColor}</span></p>
              <p>--color-success: <span className="font-bold text-[#202124]">{theme.successColor}</span></p>
              <p>--font-family: <span className="font-bold text-[#202124]">{theme.fontFamily}</span></p>
              <p>--radius-btn: <span className="font-bold text-[#202124]">{theme.buttonRadius}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
