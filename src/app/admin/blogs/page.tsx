'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import DOMPurify from 'dompurify';
import {
  BookOpen,
  Plus,
  Edit3,
  ExternalLink,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  FileText,
  Save,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminBlogStudioPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('giving-guides');
  const [readTime, setReadTime] = useState('5 min read');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80');
  const [tagsInput, setTagsInput] = useState('tax-80g, crowdfunding, guide');

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  const refreshBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      if (res.ok) {
        const data = await res.json();
        if (data.blogs) setBlogs(data.blogs);
      } else {
        setBlogs(db.getBlogs({ status: 'all' }));
      }
    } catch {
      setBlogs(db.getBlogs({ status: 'all' }));
    }
  };

  useEffect(() => {
    refreshBlogs();
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setContent('');
    setCategory('giving-guides');
    setReadTime('5 min read');
    setImageUrl('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80');
    setTagsInput('tax-80g, crowdfunding, guide');
    setShowEditorModal(true);
  };

  const handleOpenEdit = (b: BlogPost) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSlug(b.slug);
    setSummary(b.summary);
    setContent(b.content);
    setCategory(b.category);
    setReadTime(b.readTime);
    setImageUrl(b.imageUrl);
    setTagsInput((b.tags || []).join(', '));
    setShowEditorModal(true);
  };

  const handleSavePost = async (targetStatus: 'published' | 'draft') => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide an article title and content.');
      return;
    }

    setIsLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))
        .filter(Boolean);

      const payload = {
        id: editingId,
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim() || title.trim(),
        content: content.trim(),
        category,
        readTime,
        imageUrl,
        tags,
        status: targetStatus,
      };

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save article');
      }

      await refreshBlogs();
      setShowEditorModal(false);
      notify(data.message || `Article "${title}" saved successfully as ${targetStatus}.`);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete article "${postTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete');
      }
      await refreshBlogs();
      notify(`Article "${postTitle}" deleted.`);
    } catch (err: any) {
      alert(err.message || 'Delete error');
    }
  };

  const handlePreviewPrivate = () => {
    const tempPost: BlogPost = {
      id: editingId || 'preview-temp',
      title: title || 'Untitled Article',
      slug: slug || 'preview-slug',
      summary: summary || title,
      content: content || '<p>No content provided yet.</p>',
      category,
      author: {
        name: user?.name || 'Dokind Editorial Team',
        role: 'Editorial Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      readTime,
      imageUrl,
      tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
      publishedAt: new Date().toISOString(),
      status: 'draft',
    };
    setPreviewPost(tempPost);
    setShowPreviewModal(true);
  };

  const filteredBlogs = blogs.filter((b) => {
    if (statusFilter !== 'all' && (b.status || 'published') !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesTitle = b.title.toLowerCase().includes(q);
      const matchesCat = b.category.toLowerCase().includes(q);
      const matchesSumm = (b.summary || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesCat && !matchesSumm) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84B45]">
            <BookOpen className="w-4 h-4" />
            <span>Editorial Studio & Public Guides</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Blog & Educational Guide Workspace
          </h1>
          <p className="text-xs text-[#555B63] mt-1 max-w-2xl">
            Draft, review, preview privately, and publish verified donor guides, tax compliance instructions, and hospital recovery reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/blog" target="_blank">
            <Button variant="outline" size="sm" className="text-xs font-bold border-[#E2E4E9] hover:bg-neutral-50">
              <Eye className="w-3.5 h-3.5 mr-1 text-neutral-500" />
              View Public Blog
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Write New Article
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* 2. Search & Status Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search articles by title, topic, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E4E9] rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
            {[
              { id: 'all', label: `All (${blogs.length})` },
              { id: 'published', label: `Published (${blogs.filter((b) => (b.status || 'published') === 'published').length})` },
              { id: 'draft', label: `Drafts (${blogs.filter((b) => b.status === 'draft').length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id as any)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === t.id
                    ? 'bg-white text-[#202124] shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-[#E2E4E9] text-center text-xs text-neutral-400 space-y-2">
            <BookOpen className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No articles found matching the current search and filter criteria.</p>
          </div>
        ) : (
          filteredBlogs.map((b) => {
            const isDraft = b.status === 'draft';
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-[#E2E4E9] overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-[#E84B45] transition-all"
              >
                <div>
                  <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-black/60 text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-xs uppercase">
                        {b.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-xs ${
                          isDraft
                            ? 'bg-amber-500/90 text-white'
                            : 'bg-emerald-600/90 text-white'
                        }`}
                      >
                        {isDraft ? 'Private Draft' : 'Live'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{b.readTime}</span>
                      <span>•</span>
                      <span>{formatDate(b.publishedAt)}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#202124] line-clamp-2 leading-snug group-hover:text-[#E84B45] transition-colors">
                      {b.title}
                    </h3>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {b.summary}
                    </p>

                    {b.tags && b.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {b.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setPreviewPost(b);
                        setShowPreviewModal(true);
                      }}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition"
                      title="Preview Article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeletePost(b.id, b.title)}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 text-rose-600 transition"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isDraft ? (
                    <Link
                      href={`/blog/${b.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-[#E84B45] hover:underline flex items-center gap-1"
                    >
                      <span>Live URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Unpublished Draft
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL: ARTICLE EDITOR */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-[#E84B45] font-bold text-sm">
                <Edit3 className="w-4 h-4" />
                <span>{editingId ? 'Edit Blog Article' : 'Write New Educational Guide'}</span>
              </div>
              <button onClick={() => setShowEditorModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How Section 80G Tax Deductions Work on Dokind"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingId && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="how-section-80g-deductions-work"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  >
                    <option value="giving-guides">Giving Guides</option>
                    <option value="tax-compliance">Tax & 80G Compliance</option>
                    <option value="medical-emergency">Medical Emergency Advice</option>
                    <option value="impact-updates">Field Impact Updates</option>
                    <option value="crowdfunding-tips">Fundraiser Tips</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Summary / Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A clear 1-2 sentence preview shown on category discovery cards."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Cover Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Article Content (Markdown / HTML Supported) *</label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full educational guide body here. Rich text, paragraphs, and markdown are formatted and sanitized."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Tags (Comma-Separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tax-80g, medical, guidance"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviewPrivate}
                className="text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Preview Privately
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditorModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleSavePost('draft')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleSavePost('published')}
                  className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
                >
                  Publish Live
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: PRIVATE PREVIEW */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span>Private Preview (Not Live)</span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <article className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E84B45]">
                {previewPost.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-[#202124] leading-tight">
                {previewPost.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-neutral-500 pb-4 border-b border-neutral-100">
                <span>By {previewPost.author.name}</span>
                <span>•</span>
                <span>{previewPost.readTime}</span>
              </div>

              {previewPost.imageUrl && (
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewPost.imageUrl} alt={previewPost.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div
                className="prose prose-sm max-w-none text-neutral-700 leading-relaxed pt-2 space-y-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(previewPost.content),
                }}
              />
            </article>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowPreviewModal(false)} className="text-xs">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
