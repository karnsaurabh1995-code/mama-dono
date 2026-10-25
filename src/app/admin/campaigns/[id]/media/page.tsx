'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignArtworkConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ImageIcon,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Video,
  ExternalLink,
  Sparkles,
  Upload,
  Layers,
  Eye,
} from 'lucide-react';

export default function CampaignMediaManagerPage({
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

  // Form states for artwork
  const [mainPosterUrl, setMainPosterUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [thumbnailSquareUrl, setThumbnailSquareUrl] = useState('');
  const [socialShareUrl, setSocialShareUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
      setMainPosterUrl(found.artwork?.mainPosterUrl || found.imageUrl || '');
      setHeroImageUrl(found.artwork?.heroImageUrl || found.imageUrl || '');
      setThumbnailSquareUrl(found.artwork?.thumbnailSquareUrl || found.imageUrl || '');
      setSocialShareUrl(found.artwork?.socialShareUrl || found.imageUrl || '');
      setVideoUrl(found.artwork?.videoUrl || '');
      setGallery(found.artwork?.gallery || found.galleryUrls || []);
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

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery([...gallery, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();

    const artworkConfig: CampaignArtworkConfig = {
      mainPosterUrl: mainPosterUrl.trim() || campaign.imageUrl,
      heroImageUrl: heroImageUrl.trim() || campaign.imageUrl,
      thumbnailSquareUrl: thumbnailSquareUrl.trim() || campaign.imageUrl,
      socialShareUrl: socialShareUrl.trim() || campaign.imageUrl,
      videoUrl: videoUrl.trim() || undefined,
      gallery,
    };

    try {
      const updated = db.updateCampaignMedia(
        campaign.id,
        {
          artwork: artworkConfig,
          imageUrl: mainPosterUrl.trim() || campaign.imageUrl,
          galleryUrls: gallery,
        },
        currentUser?.name || 'Administrator'
      );

      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify('Campaign poster artwork, visual media, and gallery saved successfully.');
      }
    } catch (err: unknown) {
      notify(`Error: ${(err as Error).message}`);
    }
  };

  // Helper for YouTube embed
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

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

        <span className="text-xs text-neutral-400 font-mono">
          Campaign ID: {campaign.id}
        </span>
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

      {/* ----------------- FORM CONTAINER ----------------- */}
      <form onSubmit={handleSaveMedia} className="space-y-6">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Visual Assets &amp; Posters
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
                Poster Artwork &amp; Media Manager
              </h1>
              <p className="text-xs text-[#555B63] mt-0.5">
                Configure primary campaign posters, high-resolution hero banners, social share cards, and gallery proof images.
              </p>
            </div>

            <Button type="submit" size="sm" className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white shrink-0">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Media Configuration
            </Button>
          </div>

          {/* 1. Main Campaign Poster */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Main Campaign Poster URL *
              </label>
              <input
                type="url"
                required
                value={mainPosterUrl}
                onChange={(e) => setMainPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
              />
              <p className="text-[11px] text-neutral-400">
                Recommended aspect ratio: 16:9 or 4:3. Used on homepage carousels and fundraiser cards.
              </p>
            </div>

            <div className="w-full h-36 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-2xs relative">
              {mainPosterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainPosterUrl} alt="Main Poster Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-neutral-400">No poster URL</div>
              )}
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                Poster Preview
              </span>
            </div>
          </div>

          {/* 2. Hero Banner & Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Top Hero Banner Image URL
              </label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="Wide hero banner URL..."
                className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
              />
              <div className="w-full h-28 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 mt-2">
                {heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-neutral-400">Hero banner fallback</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Square Thumbnail (1:1 Aspect Ratio)
              </label>
              <input
                type="url"
                value={thumbnailSquareUrl}
                onChange={(e) => setThumbnailSquareUrl(e.target.value)}
                placeholder="Square image URL..."
                className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
              />
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 mt-2">
                {thumbnailSquareUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailSquareUrl} alt="Square Thumbnail Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-neutral-400">1:1</div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Campaign Video Embed (YouTube / Vimeo) */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-rose-600" />
              <span>Campaign Video Proof (YouTube / Vimeo URL)</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://vimeo.com/..."
              className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
            />
            {embedUrl && (
              <div className="aspect-video w-full max-w-lg rounded-2xl overflow-hidden border border-neutral-200 bg-black mt-2">
                <iframe
                  src={embedUrl}
                  title="Video Proof"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>

          {/* 4. Supporting Gallery Images */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-neutral-800">
                  Supporting Gallery Photographs ({gallery.length})
                </label>
                <p className="text-[11px] text-neutral-400">
                  Add photos of hospital grounds, patient recovery, relief camps, or wholesale item procurement.
                </p>
              </div>
            </div>

            {/* Add new photo row */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Enter photograph image URL..."
                className="flex-1 bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddGalleryImage}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Image
              </Button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {gallery.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1.5 px-1.5 py-0.2 rounded bg-black/60 text-white text-[9px] font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
