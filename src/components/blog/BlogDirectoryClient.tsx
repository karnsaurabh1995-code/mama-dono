'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  ChevronRight,
  ArrowRight,
  Search,
  X,
  Clock,
  Calendar,
  Tag,
  BookOpen,
  Sparkles,
  HeartPulse,
  GraduationCap,
  Utensils,
  PawPrint,
  FileText,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface BlogDirectoryClientProps {
  initialBlogs: BlogPost[];
}

interface TopicTab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryMatch?: string;
}

const TOPIC_TABS: TopicTab[] = [
  { id: 'all', name: 'All Stories', icon: Sparkles },
  { id: 'medical', name: 'Medical & ICU Care', icon: HeartPulse, categoryMatch: 'Medical & Healthcare' },
  { id: 'education', name: 'Child Education', icon: GraduationCap, categoryMatch: 'Child Education' },
  { id: 'hunger', name: 'Hunger & Food Relief', icon: Utensils, categoryMatch: 'Hunger & Food Relief' },
  { id: 'animals', name: 'Animal Welfare', icon: PawPrint, categoryMatch: 'Animal Welfare' },
  { id: 'tax-80g', name: 'Tax & 80G Benefits', icon: FileText, categoryMatch: 'Tax & Compliance' },
  { id: 'guides', name: 'Fundraiser Guides', icon: BookOpen, categoryMatch: 'Fundraiser Guides' },
  { id: 'transparency', name: 'Transparency & Impact', icon: ShieldCheck, categoryMatch: 'Transparency & Impact' },
];

export function BlogDirectoryClient({ initialBlogs }: BlogDirectoryClientProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'quick' | 'deep'>('newest');

  // Compute counts per topic
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialBlogs.length };
    TOPIC_TABS.forEach((tab) => {
      if (tab.id === 'all') return;
      const count = initialBlogs.filter(
        (b) => b.category.toLowerCase() === (tab.categoryMatch || '').toLowerCase()
      ).length;
      counts[tab.id] = count;
    });
    return counts;
  }, [initialBlogs]);

  // Extract read time minutes helper
  const getReadMinutes = (readTime: string): number => {
    const match = readTime.match(/\d+/);
    return match ? parseInt(match[0], 10) : 5;
  };

  // Filter & sort articles
  const filteredBlogs = useMemo(() => {
    let result = [...initialBlogs];

    // Filter by topic tab
    if (selectedTopic !== 'all') {
      const activeTab = TOPIC_TABS.find((t) => t.id === selectedTopic);
      if (activeTab?.categoryMatch) {
        result = result.filter(
          (b) => b.category.toLowerCase() === activeTab.categoryMatch!.toLowerCase()
        );
      }
    }

    // Filter by selected tag
    if (selectedTag) {
      result = result.filter(
        (b) => b.tags && b.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const summaryMatch = b.summary.toLowerCase().includes(q);
        const categoryMatch = b.category.toLowerCase().includes(q);
        const tagMatch = b.tags && b.tags.some((t) => t.toLowerCase().includes(q));
        const authorMatch = b.author?.name?.toLowerCase().includes(q);
        return titleMatch || summaryMatch || categoryMatch || tagMatch || authorMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (sortBy === 'quick') {
        return getReadMinutes(a.readTime) - getReadMinutes(b.readTime);
      }
      if (sortBy === 'deep') {
        return getReadMinutes(b.readTime) - getReadMinutes(a.readTime);
      }
      return 0;
    });

    return result;
  }, [initialBlogs, selectedTopic, selectedTag, searchQuery, sortBy]);

  const resetAllFilters = () => {
    setSelectedTopic('all');
    setSearchQuery('');
    setSelectedTag(null);
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedTopic !== 'all' || searchQuery.trim() !== '' || selectedTag !== null || sortBy !== 'newest';

  // Lead / Featured Story (First story when on 'all' with no search/tag filters)
  const isDefaultView = selectedTopic === 'all' && !searchQuery.trim() && !selectedTag;
  const featuredStory = isDefaultView && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const gridStories = isDefaultView ? filteredBlogs.slice(1) : filteredBlogs;

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[#202124] font-semibold">Dokind Blog & Stories</span>
        </nav>

        {/* Main Publication Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EF4949]/10 border border-[#EF4949]/20 text-[#EF4949] text-xs font-bold tracking-wide uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokind Stories & Insights • The Official Journal</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight leading-tight">
                Stories of Hope, Recovery & Giving Guides
              </h1>
              <p className="text-base sm:text-lg text-[#555B63] leading-relaxed">
                Discover real beneficiary journeys, emergency medical lifelines, child education dispatches,
                animal rescue diaries, and transparent Section 80G tax guides from across India.
              </p>
            </div>

            {/* Quick Publication Highlights */}
            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 text-xs text-[#555B63]">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E8E6E1] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span className="font-medium text-[#202124]">Verified Ground Stories</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E8E6E1] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span className="font-medium text-[#202124]">Section 80G Tax Guides</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E8E6E1] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span className="font-medium text-[#202124]">100% Direct Impact Proof</span>
              </div>
            </div>
          </div>
        </header>

        {/* TOPIC FILTER NAVIGATION BAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555B63]">
              Explore Topics & Categories
            </span>
            <span className="text-xs text-[#555B63]">
              Showing <strong className="text-[#202124]">{filteredBlogs.length}</strong> of {initialBlogs.length} articles
            </span>
          </div>

          {/* Horizontal Scrollable Topic Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TOPIC_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedTopic === tab.id;
              const count = topicCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedTopic(tab.id);
                    setSelectedTag(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EF4949] text-white shadow-sm border border-[#EF4949]'
                      : 'bg-white text-[#555B63] hover:text-[#202124] hover:bg-neutral-50 border border-[#E8E6E1]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#EF4949]'}`} />
                  <span>{tab.name}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-neutral-100 text-[#555B63]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH & CONTROLS TOOLBAR */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-3 sm:p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories by topic, surgery, school, tax guide, or keyword..."
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl focus:outline-none focus:border-[#EF4949] focus:ring-1 focus:ring-[#EF4949] text-[#202124] placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#555B63] hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs sm:text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[#202124] focus:outline-none focus:border-[#EF4949] cursor-pointer"
              >
                <option value="newest">Latest Published</option>
                <option value="oldest">Oldest First</option>
                <option value="quick">Quick Reads (&lt; 6 min)</option>
                <option value="deep">In-Depth Guides (6+ min)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#555B63] font-medium">Active filters:</span>

                {selectedTopic !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-[#EF4949]/10 text-[#EF4949] font-medium px-2.5 py-1 rounded-md">
                    <span>Topic: {TOPIC_TABS.find((t) => t.id === selectedTopic)?.name}</span>
                    <button
                      onClick={() => setSelectedTopic('all')}
                      className="hover:text-red-700 ml-0.5"
                      aria-label="Remove topic filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedTag && (
                  <span className="inline-flex items-center gap-1 bg-[#202124] text-white font-medium px-2.5 py-1 rounded-md">
                    <span>Tag: #{selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="hover:text-neutral-300 ml-0.5"
                      aria-label="Remove tag filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-neutral-100 text-[#202124] font-medium px-2.5 py-1 rounded-md border border-neutral-200">
                    <span>Keyword: &quot;{searchQuery}&quot;</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-neutral-600 ml-0.5"
                      aria-label="Clear keyword"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#EF4949] hover:underline cursor-pointer ml-auto"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* FEATURED / LEAD STORY SPOTLIGHT (Shown in Default / All view) */}
        {featuredStory && (
          <section className="space-y-3" aria-labelledby="featured-story-heading">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EF4949]">
              <Sparkles className="w-4 h-4" />
              <span id="featured-story-heading">Editor&apos;s Pick • Featured Story</span>
            </div>

            <article className="bg-white rounded-3xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Image Column */}
                <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-neutral-100 min-h-[280px] lg:min-h-[380px]">
                  <img
                    src={featuredStory.imageUrl}
                    alt={featuredStory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#202124]/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {featuredStory.category}
                    </span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-[#555B63]">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{featuredStory.readTime}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formatDate(featuredStory.publishedAt)}</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#202124] group-hover:text-[#EF4949] transition-colors leading-tight">
                      <Link href={`/blog/${featuredStory.slug}`}>{featuredStory.title}</Link>
                    </h2>

                    <p className="text-sm text-[#555B63] leading-relaxed line-clamp-4">
                      {featuredStory.summary}
                    </p>

                    {/* Tag chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {featuredStory.tags?.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="text-[11px] bg-[#FAF9F6] border border-[#E8E6E1] text-[#555B63] hover:text-[#202124] hover:border-[#EF4949] px-2 py-0.5 rounded-md transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredStory.author.avatar}
                        alt={featuredStory.author.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#202124]">{featuredStory.author.name}</div>
                        <div className="text-[11px] text-[#555B63]">{featuredStory.author.role}</div>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredStory.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EF4949] hover:bg-[#E84B45] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* ARTICLES GRID SECTION */}
        <section className="space-y-6" aria-labelledby="all-stories-heading">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 id="all-stories-heading" className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
              {selectedTopic === 'all' && !searchQuery && !selectedTag
                ? 'More Stories & Giving Guides'
                : `Articles in ${TOPIC_TABS.find((t) => t.id === selectedTopic)?.name || 'Filtered Results'}`}
            </h2>
            <span className="text-xs text-[#555B63]">
              {gridStories.length} {gridStories.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {/* Empty State */}
          {gridStories.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-12 text-center max-w-md mx-auto space-y-4 my-8">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#202124]">No stories found</h3>
              <p className="text-xs text-[#555B63] leading-relaxed">
                We couldn&apos;t find any articles matching your search query or topic filter. Try broadening
                your terms or clearing filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EF4949] text-white text-xs font-bold rounded-xl hover:bg-[#E84B45] transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Grid of articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridStories.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#202124]/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-2xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#555B63]">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#202124] group-hover:text-[#EF4949] transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-[#555B63] line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Tag Badges */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="text-[10px] bg-[#FAF9F6] border border-[#E8E6E1] text-[#555B63] hover:text-[#202124] hover:border-[#EF4949] px-2 py-0.5 rounded-md transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-5 sm:p-6 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between text-xs pt-3.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                    />
                    <span className="font-semibold text-[#202124] text-[11px] truncate max-w-[120px]">
                      {post.author.name}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-bold text-[#EF4949] hover:underline inline-flex items-center gap-1 group/link text-xs"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* READER CALLOUT BANNER */}
        <section className="bg-gradient-to-r from-[#202124] to-[#2D3139] text-white rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-[#EF4949] text-xs font-bold uppercase tracking-wider">
              Stay Inspired by Real Change
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Get Weekly Impact Dispatches & Tax Guides
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Read real-world recovery stories from government hospitals, field updates from rural schools,
              and step-by-step Section 80G tax saving tutorials delivered once a week.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full sm:w-80 px-4 py-2.5 text-xs sm:text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#EF4949]"
              />
              <button
                type="button"
                onClick={() => alert('Thank you for subscribing to Dokind Stories!')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#EF4949] hover:bg-[#E84B45] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Subscribe Free
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              No spam, ever. Unsubscribe anytime with a single click.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
