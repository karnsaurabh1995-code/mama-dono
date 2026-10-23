'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { ChevronRight, ArrowLeft, Heart, Calendar, User } from 'lucide-react';

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const story = db.getStoryBySlug(slug);

  if (!story) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-xl font-bold text-[#202124]">Story Not Found</h1>
        <Link href="/stories">
          <Button variant="primary">Browse Impact Stories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/stories" className="hover:text-[#202124]">
            Stories
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold truncate max-w-xs">{story.title}</span>
        </nav>

        {/* Story Article Card */}
        <article className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3">
            <span className="bg-[#FFF0EF] text-[#E84B45] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full capitalize">
              {story.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#202124] leading-tight">
              {story.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#555B63] pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Documented by {story.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Published {formatDate(story.publishedAt)}</span>
              </span>
            </div>
          </div>

          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
          </div>

          {/* Metrics Box */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] text-center">
            {story.impactMetrics.map((m, idx) => (
              <div key={idx}>
                <div className="text-base sm:text-xl font-black text-[#202124]">{m.value}</div>
                <div className="text-xs text-[#555B63] font-medium">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Narrative Content */}
          <div className="prose max-w-none text-sm sm:text-base leading-relaxed text-[#33353A] whitespace-pre-line space-y-4">
            {story.content}
          </div>

          {/* CTA Bottom */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
            <Link href="/stories">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                All Impact Stories
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="primary" size="sm">
                Support a Similar Cause
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
