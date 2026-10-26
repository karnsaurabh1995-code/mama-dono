'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sliders,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => db.getAnnouncements());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'info' | 'urgent' | 'success'>('urgent');
  const [placement, setPlacement] = useState<'top_banner' | 'home_hero' | 'modal'>('top_banner');

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/announcements')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted && data.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch((err) => {
        console.warn('Fallback loading announcements:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ann.id,
          updates: { isActive: !ann.isActive },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update');
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, isActive: !ann.isActive } : a))
      );
      notify(`Announcement "${ann.title}" is now ${!ann.isActive ? 'active' : 'hidden'}.`);
    } catch {
      db.updateAnnouncement(ann.id, { isActive: !ann.isActive }, user?.name || 'Admin');
      setAnnouncements([...db.getAnnouncements()]);
      notify(`Announcement "${ann.title}" is now ${!ann.isActive ? 'active' : 'hidden'}.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      notify('Announcement deleted.');
    } catch {
      db.deleteAnnouncement(id, user?.name || 'Admin');
      setAnnouncements([...db.getAnnouncements()]);
      notify('Announcement deleted.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter a title and message.');
      return;
    }

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
          type,
          placement,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create');
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setMessage('');
      setLink('');
      notify('New announcement created and broadcasted.');
    } catch {
      const created = db.createAnnouncement(
        {
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
          type,
          placement,
          isActive: true,
          startDate: new Date().toISOString(),
        },
        user?.name || 'Admin'
      );
      setAnnouncements([...db.getAnnouncements()]);
      setShowAddModal(false);
      setTitle('');
      setMessage('');
      setLink('');
      notify('New announcement created and broadcasted.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Megaphone className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Marketing & Banners</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Site Announcements & Urgent Tickers
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Broadcast emergency CSR grants, matching campaigns, and top alert banners across all pages.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create Announcement
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

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-2xl border transition-all bg-white shadow-2xs flex flex-col justify-between space-y-4 ${
              ann.isActive ? 'border-[#E2E4E9]' : 'border-neutral-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    ann.type === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : ann.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {ann.placement.replace('_', ' ')}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-neutral-600">
                  <span>{ann.isActive ? 'Active' : 'Disabled'}</span>
                  <input
                    type="checkbox"
                    checked={ann.isActive}
                    onChange={() => handleToggleActive(ann)}
                    className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                  />
                </label>
              </div>

              <h3 className="text-sm font-bold text-[#202124] mt-2">{ann.title}</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{ann.message}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              {ann.link ? (
                <span className="text-[11px] font-mono text-[#E84B45]">{ann.link}</span>
              ) : (
                <span className="text-[11px] text-neutral-400">No Target URL</span>
              )}

              <button
                onClick={() => handleDelete(ann.id)}
                className="text-neutral-400 hover:text-rose-600 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleCreateAnnouncement}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Broadcast New Site Announcement</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. CSR Matching Grant Alert"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Alert Style</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="urgent">Urgent / Emergency (Coral Red)</option>
                  <option value="info">Informational (Warm Blue)</option>
                  <option value="success">Impact / Success (Forest Green)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Display Placement</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as any)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="top_banner">Top Banner (All Pages)</option>
                  <option value="home_hero">Homepage Hero Strip</option>
                  <option value="modal">Popup Modal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Announcement Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Enter alert text visible to visitors..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Link Target URL (Optional)</label>
              <input
                type="text"
                placeholder="/causes/medical"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Broadcast Live
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
