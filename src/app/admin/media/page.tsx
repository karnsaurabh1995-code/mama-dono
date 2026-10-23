'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { MediaItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Search,
  Grid,
  List,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Tag,
  Info,
  X,
  Plus,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>(db.getMediaItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document' | 'icon'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'document' | 'icon'>('image');
  const [newAltText, setNewAltText] = useState('');
  const [newTags, setNewTags] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'all' && item.fileType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesFilename = item.filename.toLowerCase().includes(q);
      const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesFilename && !matchesTags) return false;
    }
    return true;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notify('Asset URL copied to clipboard.');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      const success = db.deleteMediaItem(id, user?.name || 'Admin');
      if (success) {
        setItems(db.getMediaItems());
        setSelectedItem(null);
        notify('Media asset deleted.');
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Please provide a title and media URL.');
      return;
    }

    const created = db.addMediaItem(
      {
        title: newTitle.trim(),
        url: newUrl.trim(),
        filename: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + (newType === 'document' ? '.pdf' : '.jpg'),
        fileType: newType,
        mimeType: newType === 'document' ? 'application/pdf' : 'image/jpeg',
        fileSizeKB: Math.floor(Math.random() * 300) + 120,
        dimensions: newType === 'image' ? '1200 x 800' : 'A4 Document',
        altText: newAltText.trim() || newTitle.trim(),
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        usedIn: [],
      },
      user?.name || 'Admin'
    );

    setItems(db.getMediaItems());
    setShowUploadModal(false);
    setNewTitle('');
    setNewUrl('');
    setNewAltText('');
    setNewTags('');
    notify(`Asset "${created.title}" successfully added to media library.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Digital Asset Manager</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Media Library & Hospital Documents
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Central repository for verified hospital bills, campaign banners, NGO certificates, and trust seals.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowUploadModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Upload className="w-3.5 h-3.5 mr-1" />
          Upload New Asset
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

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename, title, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'image', label: 'Images' },
            { id: 'document', label: 'Documents' },
            { id: 'icon', label: 'Icons' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === tab.id ? 'bg-white text-[#202124] shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-neutral-600 ${viewMode === 'grid' ? 'bg-white shadow-xs text-neutral-900' : ''}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-neutral-600 ${viewMode === 'list' ? 'bg-white shadow-xs text-neutral-900' : ''}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or List Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl border border-[#E2E4E9] overflow-hidden hover:border-[#E84B45] hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="aspect-square bg-neutral-100 relative overflow-hidden flex items-center justify-center">
                {item.fileType === 'document' ? (
                  <div className="p-4 flex flex-col items-center justify-center text-neutral-500">
                    <FileText className="w-10 h-10 text-neutral-400 group-hover:text-[#E84B45] transition-colors" />
                    <span className="text-[10px] font-mono mt-1 font-bold">PDF</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <span className="absolute top-2 right-2 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 text-white font-bold backdrop-blur-xs">
                  {item.fileType}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#202124] line-clamp-1 group-hover:text-[#E84B45]">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{item.fileSizeKB} KB</p>
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>{item.usedIn.length} usages</span>
                  <Copy
                    className="w-3.5 h-3.5 hover:text-[#E84B45]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Title & Filename</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">References</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
                      {item.fileType === 'document' ? (
                        <FileText className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-bold text-[#202124]">{item.title}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">{item.filename}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {item.fileType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-neutral-600">{item.fileSizeKB} KB</td>
                  <td className="py-2.5 px-4 text-neutral-600">{item.usedIn.length} campaigns</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url);
                      }}
                      className="p-1 rounded hover:bg-neutral-200 text-neutral-500 mr-2"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1 rounded hover:bg-rose-50 text-rose-500"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------- ASSET DETAIL DRAWER / MODAL ----------------- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Asset Metadata & Inspection</h3>
              <button onClick={() => setSelectedItem(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200">
              {selectedItem.fileType === 'document' ? (
                <div className="text-center p-6 text-neutral-500">
                  <FileText className="w-16 h-16 text-neutral-400 mx-auto" />
                  <p className="font-bold text-sm text-neutral-800 mt-2">{selectedItem.filename}</p>
                  <p className="text-xs text-neutral-400">PDF Medical Verification Certificate</p>
                </div>
              ) : (
                <img src={selectedItem.url} alt={selectedItem.altText} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Title</span>
                <p className="font-bold text-neutral-800 mt-0.5">{selectedItem.title}</p>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Dimensions & Size</span>
                <p className="font-bold text-neutral-800 mt-0.5">
                  {selectedItem.dimensions || 'N/A'} • {selectedItem.fileSizeKB} KB
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Public CDN / Storage URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedItem.url}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-700"
                />
                <Button size="sm" onClick={() => handleCopyUrl(selectedItem.url)} className="text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Asset</span>
              </button>
              <Button size="sm" variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- UPLOAD NEW ASSET MODAL ----------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleUploadSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Add Digital Asset to Library</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Asset Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AIIMS Pediatric Cardiac Estimate"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">File Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="image">Image (JPG, PNG, WebP)</option>
                  <option value="document">Document (PDF)</option>
                  <option value="icon">Icon / Emblem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="medical, aiims, pediatric"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Direct Media URL *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Accessibility Alt Text</label>
              <input
                type="text"
                placeholder="Detailed description of the image content for screen readers"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Save to Media Library
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
