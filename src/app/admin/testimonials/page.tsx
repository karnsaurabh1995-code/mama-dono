'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Testimonial } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Quote, Plus, Star, CheckCircle2, Trash2, X, RefreshCw } from 'lucide-react';

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => db.getTestimonials());
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      }
    } catch (e) {
      console.warn('Could not fetch testimonials:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleFeatured = async (id: string) => {
    const current = testimonials.find((t) => t.id === id);
    if (!current) return;
    const newFeatured = !current.featured;

    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, featured: newFeatured } : t))
    );

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { featured: newFeatured } }),
      });
      if (!res.ok) throw new Error('Failed to update testimonial');
      notify(`Testimonial featured state updated to ${newFeatured ? 'featured' : 'standard'}.`);
    } catch (err: any) {
      // rollback
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, featured: !newFeatured } : t))
      );
      notify('Failed to update testimonial on server.');
    }
  };

  const handleDelete = async (id: string) => {
    const previous = [...testimonials];
    setTestimonials((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete testimonial');
      notify('Testimonial removed.');
    } catch (err: any) {
      setTestimonials(previous);
      notify('Failed to delete testimonial on server.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quote.trim()) return;

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          role: role.trim() || 'Supporter',
          quote: quote.trim(),
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          rating: 5,
          featured: true,
          badge: 'Verified',
        }),
      });

      if (!res.ok) throw new Error('Failed to create testimonial');
      const data = await res.json();
      if (data.testimonial) {
        setTestimonials((prev) => [data.testimonial, ...prev]);
      }
      setShowAddModal(false);
      setAuthorName('');
      setRole('');
      setQuote('');
      notify('New testimonial added and persisted.');
    } catch (err: any) {
      notify('Failed to save testimonial: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Quote className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Social Proof</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Testimonials & Endorsements
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage genuine feedback from donors, healthcare workers, and recovered beneficiary families.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchTestimonials} disabled={isLoading} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-neutral-600">
                  <input
                    type="checkbox"
                    checked={t.featured}
                    onChange={() => handleToggleFeatured(t.id)}
                    className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <p className="text-xs text-neutral-700 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={t.avatarUrl} alt={t.authorName} className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
                <div>
                  <p className="text-xs font-bold text-[#202124]">{t.authorName}</p>
                  <p className="text-[10px] text-neutral-400">{t.role}</p>
                </div>
              </div>

              <button onClick={() => handleDelete(t.id)} className="text-neutral-400 hover:text-rose-600 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleCreate} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Add Testimonial</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Role / Affiliation</label>
              <input
                type="text"
                placeholder="e.g. Regular Donor or Caregiver"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Quote *</label>
              <textarea
                rows={4}
                required
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Save Testimonial
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
