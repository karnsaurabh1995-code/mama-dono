'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { MediaRecognition } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { AwardsAndMediaSection } from '@/components/home/AwardsAndMediaSection';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Newspaper,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  Sliders,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  Quote,
} from 'lucide-react';

const MEDIA_PRESETS = [
  {
    outletName: 'The Times of India',
    logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=240&q=80',
    quote: 'Pioneering item-level transparency and verified hospital escrows in Indian crowdfunding.',
    articleUrl: 'https://timesofindia.indiatimes.com',
    publishedOn: 'Oct 2026',
    category: 'National Daily' as const,
  },
  {
    outletName: 'The Hindu',
    logoUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=240&q=80',
    quote: 'Directly connecting donors with critical pediatric cases with zero platform fees.',
    articleUrl: 'https://thehindu.com',
    publishedOn: 'Sep 2026',
    category: 'National Daily' as const,
  },
  {
    outletName: 'The Economic Times',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=240&q=80',
    quote: 'A trusted bridge for philanthropic capital, corporate CSR impact, and NGO governance.',
    articleUrl: 'https://economictimes.indiatimes.com',
    publishedOn: 'Aug 2026',
    category: 'Business & Finance' as const,
  },
  {
    outletName: 'NDTV India',
    logoUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=240&q=80',
    quote: 'Accelerating emergency surgical interventions for underprivileged children across India.',
    articleUrl: 'https://ndtv.com',
    publishedOn: 'Jul 2026',
    category: 'Television & Broadcast' as const,
  },
  {
    outletName: 'The Indian Express',
    logoUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=240&q=80',
    quote: 'Transforming grassroots social giving with digital receipts and live item tracking.',
    articleUrl: 'https://indianexpress.com',
    publishedOn: 'Jun 2026',
    category: 'National Daily' as const,
  },
  {
    outletName: 'Mint',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=240&q=80',
    quote: 'Setting new transparency benchmarks in Indian social impact financing.',
    articleUrl: 'https://livemint.com',
    publishedOn: 'May 2026',
    category: 'Business & Finance' as const,
  },
  {
    outletName: 'Business Standard',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=240&q=80',
    quote: 'Enabling institutional compliance and verified supply chains for charitable giving.',
    articleUrl: 'https://business-standard.com',
    publishedOn: 'Apr 2026',
    category: 'Business & Finance' as const,
  },
  {
    outletName: 'BBC News Hindi',
    logoUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=240&q=80',
    quote: 'Community philanthropy bridging the critical healthcare divide in rural districts.',
    articleUrl: 'https://bbc.com/hindi',
    publishedOn: 'Mar 2026',
    category: 'Digital Media' as const,
  },
];

export default function MediaRecognitionAdminPage() {
  const { user } = useAuth();
  const [recognitions, setRecognitions] = useState<MediaRecognition[]>(db.getMediaRecognitions());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [outletName, setOutletName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [quote, setQuote] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [publishedOn, setPublishedOn] = useState('Oct 2026');
  const [category, setCategory] = useState<'National Daily' | 'Business & Finance' | 'Television & Broadcast' | 'Digital Media' | 'Philanthropy'>('National Daily');
  const [isFeatured, setIsFeatured] = useState(true);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const reloadData = () => {
    setRecognitions(db.getMediaRecognitions());
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setOutletName('');
    setLogoUrl('');
    setQuote('');
    setArticleUrl('');
    setPublishedOn('Oct 2026');
    setCategory('National Daily');
    setIsFeatured(true);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: MediaRecognition) => {
    setEditingId(item.id);
    setOutletName(item.outletName);
    setLogoUrl(item.logoUrl || '');
    setQuote(item.quote);
    setArticleUrl(item.articleUrl || '');
    setPublishedOn(item.publishedOn || '');
    setCategory(item.category || 'National Daily');
    setIsFeatured(item.isFeatured);
    setIsFormOpen(true);
  };

  const handleApplyPreset = (preset: typeof MEDIA_PRESETS[0]) => {
    setOutletName(preset.outletName);
    setLogoUrl(preset.logoUrl);
    setQuote(preset.quote);
    setArticleUrl(preset.articleUrl);
    setPublishedOn(preset.publishedOn);
    setCategory(preset.category);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim() || !quote.trim()) {
      alert('Please fill out the publication outlet name and impact quote.');
      return;
    }

    if (editingId) {
      db.updateMediaRecognition(
        editingId,
        {
          outletName: outletName.trim(),
          logoUrl: logoUrl.trim(),
          quote: quote.trim(),
          articleUrl: articleUrl.trim(),
          publishedOn: publishedOn.trim(),
          category,
          isFeatured,
        },
        user?.name || 'Admin'
      );
      notify(`Updated media recognition for "${outletName}".`);
    } else {
      db.createMediaRecognition(
        {
          outletName: outletName.trim(),
          logoUrl: logoUrl.trim(),
          quote: quote.trim(),
          articleUrl: articleUrl.trim(),
          publishedOn: publishedOn.trim(),
          category,
          isFeatured,
          sortOrder: recognitions.length + 1,
        },
        user?.name || 'Admin'
      );
      notify(`Added new media recognition for "${outletName}".`);
    }

    setIsFormOpen(false);
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove media recognition for "${name}" from the continuous carousel?`)) {
      db.deleteMediaRecognition(id, user?.name || 'Admin');
      notify(`Deleted "${name}".`);
      reloadData();
    }
  };

  const handleToggleFeatured = (item: MediaRecognition) => {
    db.updateMediaRecognition(item.id, { isFeatured: !item.isFeatured }, user?.name || 'Admin');
    notify(`${item.outletName} ${!item.isFeatured ? 'added to' : 'removed from'} active carousel.`);
    reloadData();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= recognitions.length) return;

    const newOrder = [...recognitions];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    db.reorderMediaRecognitions(newOrder.map((r) => r.id), user?.name || 'Admin');
    reloadData();
  };

  const handleResetDefaults = () => {
    if (confirm('Reset media recognitions to the initial curated national media partners?')) {
      db.resetMediaRecognitions(user?.name || 'Admin');
      notify('Media recognition carousel reset to default national media outlets.');
      reloadData();
    }
  };

  const activeCount = recognitions.filter((r) => r.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Media & Recognition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            National Media Recognition & Press Quotes
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage media publication logos, press quotes, and coverage links featured in the continuous homepage carousel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="text-xs text-neutral-600">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleOpenAddForm} className="text-xs bg-[#EF4949] hover:bg-[#D93838] text-white">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Media Recognition
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Total Recognitions</span>
          <p className="text-xl font-black text-[#202124] mt-1">{recognitions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Active On Carousel</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">National Dailies</span>
          <p className="text-xl font-black text-[#202124] mt-1">
            {recognitions.filter((r) => r.category === 'National Daily').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Broadcast & TV</span>
          <p className="text-xl font-black text-[#202124] mt-1">
            {recognitions.filter((r) => r.category === 'Television & Broadcast').length}
          </p>
        </div>
      </div>

      {/* Live Simulation Preview */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#202124]">Live Continuous Carousel Simulation</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
            Infinite CSS Marquee
          </span>
        </div>
        <div className="rounded-2xl overflow-hidden border border-neutral-200">
          <AwardsAndMediaSection customItems={recognitions.filter((r) => r.isFeatured)} />
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border-2 border-[#EF4949]/30 shadow-md space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#EF4949]" />
              <span>{editingId ? 'Edit Media Recognition' : 'Add New Media Recognition'}</span>
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-700"
            >
              ✕ Cancel
            </button>
          </div>

          {/* Quick Presets */}
          {!editingId && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Fill from Curated Indian Media Presets</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {MEDIA_PRESETS.map((p) => (
                  <button
                    key={p.outletName}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 transition cursor-pointer"
                  >
                    {p.outletName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Publication / Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="e.g. The Times of India, NDTV India"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-hidden focus:border-[#EF4949]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Outlet Logo Image URL (or Leave blank for default icon)
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... logo image or masthead icon"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono text-neutral-800 focus:outline-hidden focus:border-[#EF4949]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Featured Impact Quote / Editorial Excerpt *
              </label>
              <textarea
                required
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="What did the publication write or say about Dokind's work?"
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:border-[#EF4949]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Article / Coverage URL
                </label>
                <input
                  type="text"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Publish Date / Edition
                </label>
                <input
                  type="text"
                  value={publishedOn}
                  onChange={(e) => setPublishedOn(e.target.value)}
                  placeholder="e.g. Oct 2026, Special Report"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-bold text-neutral-800"
                >
                  <option value="National Daily">National Daily</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Television & Broadcast">Television & Broadcast</option>
                  <option value="Digital Media">Digital Media</option>
                  <option value="Philanthropy">Philanthropy</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#EF4949] focus:ring-[#EF4949]"
                />
                <span className="text-xs font-bold text-neutral-700">Display on Continuous Homepage Carousel</span>
              </label>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-[#EF4949] hover:bg-[#D93838] text-white">
                  {editingId ? 'Update Recognition' : 'Save Recognition'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124]">All Media Recognitions ({recognitions.length})</h3>
          <span className="text-xs text-neutral-400">Drag or use arrow buttons to reorder carousel sequence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Publication / Outlet</th>
                <th className="py-3 px-4">Quote Excerpt</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recognitions.map((item, idx) => (
                <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                  {/* Order Controls */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[10px] text-neutral-500 font-bold">{idx + 1}</span>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === recognitions.length - 1}
                        className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Outlet & Logo */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {item.logoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0 p-1">
                          <img src={item.logoUrl} alt={item.outletName} className="w-full h-full object-cover rounded-lg" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                          <Newspaper className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-neutral-900">{item.outletName}</h4>
                        {item.articleUrl && (
                          <a
                            href={item.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span>View Source Article</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Quote */}
                  <td className="py-3 px-4 max-w-sm">
                    <p className="text-neutral-600 italic line-clamp-2">&ldquo;{item.quote}&rdquo;</p>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-semibold text-[10px]">
                      {item.category || 'National Daily'}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        item.isFeatured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {item.isFeatured ? 'Active on Carousel' : 'Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditForm(item)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.outletName)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
