'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { BrushStrokeFrame } from '@/components/home/BrushStrokeFrame';
import {
  Palette,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Layout,
  Sliders,
  Eye,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';

const PRESET_ARTWORK = [
  {
    name: 'Children at School',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    alt: 'Smiling Indian school children supported by grassroots campaign',
  },
  {
    name: 'Medical Care & Recovery',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    alt: 'Pediatric patient recovering after surgery with care team',
  },
  {
    name: 'Community Meal Distribution',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    alt: 'Hot nutritious meals served to elderly and families',
  },
  {
    name: 'Animal Rescue Sanctuary',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    alt: 'Rescued animals receiving shelter and medical care',
  },
];

export default function NewsletterAppearancePage() {
  const { user } = useAuth();
  const initialSettings = db.getSiteSettings();

  const [imageUrl, setImageUrl] = useState(initialSettings.newsletterImageUrl || '');
  const [imageAlt, setImageAlt] = useState(initialSettings.newsletterImageAlt || 'Children supported by dokind grassroots campaign');
  const [frameStyle, setFrameStyle] = useState<'organic_brush' | 'watercolor_edge' | 'subtle_splatter' | 'clean_rounded'>(
    initialSettings.newsletterFrameStyle || 'organic_brush'
  );
  const [focalPoint, setFocalPoint] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>(
    initialSettings.newsletterFocalPoint || 'center'
  );
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>(
    initialSettings.newsletterImagePosition || 'right'
  );
  const [frameSize, setFrameSize] = useState<'normal' | 'large' | 'compact'>(
    initialSettings.newsletterFrameSize || 'normal'
  );
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSiteSettings(
      {
        newsletterImageUrl: imageUrl.trim(),
        newsletterImageAlt: imageAlt.trim(),
        newsletterFrameStyle: frameStyle,
        newsletterFocalPoint: focalPoint,
        newsletterImagePosition: imagePosition,
        newsletterFrameSize: frameSize,
      },
      user?.name || 'Admin'
    );
    notify('Newsletter artwork and decorative brush frame styling successfully saved and published.');
  };

  const handleReset = () => {
    if (confirm('Reset newsletter artwork to the default brush-framed photo?')) {
      const defaults = {
        newsletterImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        newsletterImageAlt: 'Children supported by dokind grassroots campaign',
        newsletterFrameStyle: 'organic_brush' as const,
        newsletterFocalPoint: 'center' as const,
        newsletterImagePosition: 'right' as const,
        newsletterFrameSize: 'normal' as const,
      };
      setImageUrl(defaults.newsletterImageUrl);
      setImageAlt(defaults.newsletterImageAlt);
      setFrameStyle(defaults.newsletterFrameStyle);
      setFocalPoint(defaults.newsletterFocalPoint);
      setImagePosition(defaults.newsletterImagePosition);
      setFrameSize(defaults.newsletterFrameSize);
      db.updateSiteSettings(defaults, user?.name || 'Admin');
      notify('Newsletter section reset to default photo and organic brush stroke styling.');
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    notify('Image removed. The newsletter section will display the centered layout.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <Palette className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Marketing & Design</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Newsletter Artwork & Brush-Stroke Frame Controls
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Configure the organic decorative frame, upload story imagery, and preview responsive layouts before publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs text-neutral-600">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs bg-[#EF4949] hover:bg-[#D93838] text-white">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Artwork Image Source */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#EF4949]" />
                <span>Featured Story Artwork</span>
              </h3>
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Image Source URL
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono text-neutral-800 focus:outline-hidden focus:border-[#EF4949]"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Paste any high-resolution HTTPS image URL, or pick from curated impact presets below.
              </p>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">
                Curated High-Impact Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ARTWORK.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImageAlt(preset.alt);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      imageUrl === preset.url
                        ? 'border-[#EF4949] bg-rose-50/50 shadow-2xs ring-1 ring-[#EF4949]'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-lg overflow-hidden mb-1.5 bg-neutral-100">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] font-bold text-neutral-800 truncate">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Accessible Alt Description (SEO & A11y)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image content for screen readers"
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:border-[#EF4949]"
              />
            </div>
          </div>

          {/* Frame Style & Geometry */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#EF4949]" />
                <span>Decorative Frame & Layout Styling</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Frame Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'organic_brush', label: 'Organic Brush', desc: 'Hand-painted stroke overlay & splatters' },
                    { id: 'watercolor_edge', label: 'Watercolor Bleed', desc: 'Flowing asymmetrical soft curves' },
                    { id: 'subtle_splatter', label: 'Distressed Splatter', desc: 'Painterly splatter accent points' },
                    { id: 'clean_rounded', label: 'Modern Curved', desc: 'Minimal contemporary rounded shape' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFrameStyle(style.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        frameStyle === style.id
                          ? 'border-[#EF4949] bg-rose-50/50 shadow-2xs font-bold text-[#EF4949] ring-1 ring-[#EF4949]'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{style.label}</p>
                      <p className="text-[10px] text-neutral-500 font-normal leading-tight mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Desktop Position</label>
                  <select
                    value={imagePosition}
                    onChange={(e) => setImagePosition(e.target.value as any)}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-bold text-neutral-800"
                  >
                    <option value="right">Right Column (Default)</option>
                    <option value="left">Left Column</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Display Size</label>
                  <select
                    value={frameSize}
                    onChange={(e) => setFrameSize(e.target.value as any)}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-bold text-neutral-800"
                  >
                    <option value="normal">Standard (h-96)</option>
                    <option value="large">Prominent (h-[430px])</option>
                    <option value="compact">Compact (h-80)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Crop & Focal Point Focus
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['center', 'top', 'bottom', 'left', 'right'] as const).map((fp) => (
                    <button
                      key={fp}
                      type="button"
                      onClick={() => setFocalPoint(fp)}
                      className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold capitalize transition-all border ${
                        focalPoint === fp
                          ? 'border-[#EF4949] bg-[#EF4949] text-white shadow-xs'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Full-Width Homepage Simulation</span>
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                Responsive Preview
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-md">
              <NewsletterSection
                customImageUrl={imageUrl}
                customAlt={imageAlt}
                customFrameStyle={frameStyle}
                customFocalPoint={focalPoint}
                customImagePosition={imagePosition}
                customFrameSize={frameSize}
              />
            </div>

            {/* Frame detail isolation preview */}
            {imageUrl && (
              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Isolated Brush Frame Contour</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 capitalize">{frameStyle.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-center p-2">
                  <BrushStrokeFrame
                    imageUrl={imageUrl}
                    altText={imageAlt}
                    frameStyle={frameStyle}
                    focalPoint={focalPoint}
                    frameSize="compact"
                    className="w-full max-w-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
