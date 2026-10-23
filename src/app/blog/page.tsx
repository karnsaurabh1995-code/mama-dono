import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ChevronRight, ArrowRight, BookOpen, Clock } from 'lucide-react';

export default function BlogDirectoryPage() {
  const blogs = db.getBlogs();

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Educational Guides & Blog</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Crowdfunding, Tax & Giving Guides
          </h1>
          <p className="text-sm text-[#555B63] max-w-2xl leading-relaxed">
            In-depth guides on Section 80G tax deductions, navigating medical emergencies in Indian hospitals, and ensuring transparent non-profit giving.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#555B63]">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{post.readTime}</span>
                    <span>• {formatDate(post.publishedAt)}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#202124] group-hover:text-[#E84B45] transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-[#555B63] line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between text-xs pt-3">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-semibold text-[#202124]">{post.author.name}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-[#E84B45] hover:underline inline-flex items-center gap-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
