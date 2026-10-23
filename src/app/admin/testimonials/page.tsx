'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Quote, Plus, Star, CheckCircle2, Trash2, X } from 'lucide-react';

interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  featured: boolean;
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 't-1',
      authorName: 'Dr. Suresh Sen, Chief Cardiac Surgeon',
      role: 'AIIMS Child Heart Centre',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      quote: 'SevaSetu has eliminated delays for underprivileged children requiring emergency heart surgery. Funds reach the hospital account directly before surgery begins.',
      rating: 5,
      featured: true,
    },
    {
      id: 't-2',
      authorName: 'Kiran Bedi Verma',
      role: 'Regular Monthly Donor (Bengaluru)',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      quote: 'Getting instant 80G tax receipts and verified video updates of children receiving books and mid-day meals gives me 100% confidence in my monthly pledge.',
      rating: 5,
      featured: true,
    },
    {
      id: 't-3',
      authorName: 'Aarav’s Father, Ramesh',
      role: 'Beneficiary Caregiver',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      quote: 'When my 3-year-old son collapsed with cardiac failure, I had no money. 24,000 generous people across India funded his surgery through SevaSetu within 48 hours.',
      rating: 5,
      featured: true,
    },
  ]);

  const [toastMessage, setToastMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleFeatured = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t))
    );
    notify('Testimonial featured state updated.');
  };

  const handleDelete = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    notify('Testimonial removed.');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quote.trim()) return;

    const newT: Testimonial = {
      id: `t-${Date.now()}`,
      authorName: authorName.trim(),
      role: role.trim() || 'Supporter',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      quote: quote.trim(),
      rating: 5,
      featured: true,
    };

    setTestimonials((prev) => [newT, ...prev]);
    setShowAddModal(false);
    setAuthorName('');
    setRole('');
    setQuote('');
    notify('New testimonial added.');
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

        <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Testimonial
        </Button>
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
