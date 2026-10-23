'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BlogPost, ImpactStory } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  Plus,
  Edit,
  ExternalLink,
  Search,
  Sparkles,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export default function BlogStoriesManagementPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(db.getBlogs());
  const [stories, setStories] = useState<ImpactStory[]>(db.getStories());
  const [activeTab, setActiveTab] = useState<'blogs' | 'stories'>('blogs');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Content Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Blog Posts & Beneficiary Impact Stories
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Publish educational donor guides, hospital recovery updates, and verified grassroots field narratives.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'blogs' ? 'bg-white shadow-xs text-[#202124] font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Blog Articles ({blogs.length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'stories' ? 'bg-white shadow-xs text-[#202124] font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Impact Stories ({stories.length})
          </button>
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

      {/* Grid of Articles / Stories */}
      {activeTab === 'blogs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-[#E2E4E9] overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-[#E84B45] transition-colors">
              <div className="aspect-video relative overflow-hidden bg-neutral-100">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 right-2 bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-xs">
                  {b.readTime}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#E84B45]">{b.category}</span>
                  <h3 className="text-sm font-bold text-[#202124] mt-1 line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{b.summary}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">By {b.author.name}</span>
                  <Link href={`/blog/${b.slug}`} target="_blank" className="text-xs font-semibold text-[#E84B45] hover:underline flex items-center gap-1">
                    <span>View Public</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-[#E2E4E9] overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-[#E84B45] transition-colors">
              <div className="aspect-video relative overflow-hidden bg-neutral-100">
                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700">{s.category}</span>
                  <h3 className="text-sm font-bold text-[#202124] mt-1 line-clamp-2">{s.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{s.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">Patient: {s.beneficiaryName}</span>
                  <Link href={`/stories/${s.slug}`} target="_blank" className="text-xs font-semibold text-[#E84B45] hover:underline flex items-center gap-1">
                    <span>View Public</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
