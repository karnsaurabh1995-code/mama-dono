'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ArrowLeft, Clock, Calendar, Share2, Tag } from 'lucide-react';

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = db.getBlogBySlug(slug);

  if (!post) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-xl font-bold text-[#202124]">Article Not Found</h1>
        <Link href="/blog">
          <Button variant="primary">Browse All Articles</Button>
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
          <Link href="/blog" className="hover:text-[#202124]">
            Blog & Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Body */}
        <article className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3">
            <span className="bg-[#FFF0EF] text-[#E84B45] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#202124] leading-tight">
              {post.title}
            </h1>

            {/* Author Bar */}
            <div className="flex items-center justify-between border-y border-neutral-100 py-3 text-xs text-[#555B63] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-[#202124]">{post.author.name}</div>
                  <div className="text-[11px] text-[#555B63]">{post.author.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#555B63]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{formatDate(post.publishedAt)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{post.readTime}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Markdown-like formatted Content */}
          <div className="prose max-w-none text-sm sm:text-base leading-relaxed text-[#33353A] whitespace-pre-line space-y-4">
            {post.content}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-neutral-400" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#FAF9F6] border border-[#E8E6E1] text-[#555B63] text-xs px-2.5 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                All Articles
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="primary" size="sm">
                Explore Campaigns
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
