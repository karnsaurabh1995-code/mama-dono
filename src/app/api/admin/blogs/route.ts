import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

function sanitizeHtmlContent(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export async function GET() {
  try {
    const session = await getServerSession();
    const authorized = ['super_admin', 'admin', 'content_writer', 'content_editor', 'marketer', 'support_admin'];
    if (!session || !authorized.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized to view blog studio' }, { status: 401 });
    }

    const blogs = db.getBlogs({ status: 'all' });
    return NextResponse.json({ success: true, blogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authorized = ['super_admin', 'admin', 'content_writer', 'content_editor', 'marketer'];
    if (!session || !authorized.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Content Editor credentials required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, slug, summary, content, category, readTime, imageUrl, tags, status } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Article title and body content are required.' }, { status: 400 });
    }

    const cleanContent = sanitizeHtmlContent(content);
    const cleanSummary = sanitizeHtmlContent(summary || title);
    const cleanTitle = title.trim();
    const cleanSlug = (slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const actorName = session.name || 'Content Editor';

    let savedBlog;
    if (id) {
      savedBlog = db.updateBlogPost(
        id,
        {
          title: cleanTitle,
          slug: cleanSlug,
          summary: cleanSummary,
          content: cleanContent,
          category: category || 'giving-guides',
          readTime: readTime || '5 min read',
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
          tags: Array.isArray(tags) ? tags : ['tax-80g', 'giving'],
          status: status === 'draft' ? 'draft' : 'published',
        },
        actorName
      );
    } else {
      savedBlog = db.createBlogPost(
        {
          title: cleanTitle,
          slug: cleanSlug,
          summary: cleanSummary,
          content: cleanContent,
          category: category || 'giving-guides',
          readTime: readTime || '5 min read',
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
          tags: Array.isArray(tags) ? tags : ['tax-80g', 'giving'],
          status: status === 'draft' ? 'draft' : 'published',
          author: {
            name: actorName,
            role: session.role === 'super_admin' ? 'Chief Administrator' : 'Editorial Lead',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
        },
        actorName
      );
    }

    try {
      revalidatePath('/blog');
      revalidatePath(`/blog/${cleanSlug}`);
      revalidatePath('/admin/blogs');
    } catch (e) {
      console.warn('Blog cache revalidation note:', e);
    }

    return NextResponse.json({
      success: true,
      blog: savedBlog,
      message: `Blog post "${cleanTitle}" saved as ${savedBlog?.status || 'published'}.`,
    });
  } catch (err: any) {
    console.error('Error saving blog post:', err);
    return NextResponse.json({ error: err.message || 'Failed to save blog post.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authorized = ['super_admin', 'admin', 'content_editor'];
    if (!session || !authorized.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized to delete blog articles' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });

    const success = db.deleteBlogPost(id, session.name || 'Admin');
    if (!success) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    try {
      revalidatePath('/blog');
      revalidatePath('/admin/blogs');
    } catch {}

    return NextResponse.json({ success: true, message: 'Blog post deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
