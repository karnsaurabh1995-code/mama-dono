import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ChevronRight, ArrowRight, Heart } from 'lucide-react';

export default function StoriesDirectoryPage() {
  const stories = db.getStories();

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Impact Stories</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Stories of Hope, Healing & Humanity
          </h1>
          <p className="text-sm text-[#555B63] max-w-2xl leading-relaxed">
            Read first-hand accounts of patients who received bone marrow transplants, children who returned to school, and villages that received clean drinking water.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-md capitalize">
                      {story.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-[#202124] group-hover:text-[#E84B45] transition-colors leading-snug">
                    <Link href={`/stories/${story.slug}`}>{story.title}</Link>
                  </h3>
                  <p className="text-xs text-[#555B63] line-clamp-2 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 mt-2">
                <div className="grid grid-cols-3 gap-1 py-3 text-center bg-[#FAF9F6] rounded-xl text-[11px]">
                  {story.impactMetrics.map((m, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-[#202124]">{m.value}</div>
                      <div className="text-[10px] text-neutral-400">{m.label}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/stories/${story.slug}`}
                  className="mt-3 flex items-center justify-between text-xs font-semibold text-[#E84B45] hover:underline"
                >
                  <span>Read Full Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
