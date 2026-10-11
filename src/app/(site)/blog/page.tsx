/**
 * /blog — ব্লগ লিস্ট (সার্চ, ক্যাটাগরি, ট্যাগ, সর্টিং, পেজিনেশন)
 * সব ফিল্টার URL-এ থাকে:  /blog?q=exam&category=education&tags=tips,study&sort=popular&page=2
 *
 * পেজটা static (ISR) — server searchParams পড়ে না, তাই `dynamic = 'error'` থাকলেও চলে।
 * ফিল্টার ছাড়া প্রথম পাতার পোস্টগুলো HTML-এই থাকে (SEO), বাকিটা ব্রাউজারে (BlogBrowser)।
 */
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FolderOpen, Newspaper } from 'lucide-react';
import BlogBrowser from '@/components/blog/BlogBrowser';
import BlogListView from '@/components/blog/BlogListView';
import BlogToolbar, { BlogToolbarView } from '@/components/blog/BlogToolbar';
import { DEFAULT_BLOG_QUERY } from '@/components/blog/blog-query';
import PageHero from '@/components/ui/PageHero';
import { BLOG_POPULAR_TAGS_LIMIT, BLOG_SORTS } from '@/config/blog';
import { safe } from '@/lib/api/client';
import { toBn } from '@/lib/utils/format';
import { blogService } from '@/services/blog.service';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ব্লগ',
  description: 'স্কুল ম্যানেজমেন্ট, শিক্ষা ও প্রযুক্তি নিয়ে টিপস, গাইড ও সর্বশেষ খবর — School SoftwareBD ব্লগ।',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  // safe(): API বন্ধ থাকলেও পেজ তৈরি হয় — লিস্ট তখন ব্রাউজার থেকে আবার চেষ্টা করে
  const [initial, categories, popularTags] = await Promise.all([
    safe(blogService.list({ page: 1 }), null),
    safe(blogService.categories(), []),
    safe(blogService.tags({ popular: true, limit: BLOG_POPULAR_TAGS_LIMIT }), []),
  ]);
  const totalPosts = categories.reduce((sum, c) => sum + (c.blogs_count ?? 0), 0) || initial?.meta?.total || 0;

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: 'ব্লগ' }]}
        title="শিক্ষা ও প্রযুক্তির"
        highlight="ব্লগ"
        description="স্কুল ম্যানেজমেন্ট, পড়াশোনা আর ডিজিটাল শিক্ষা নিয়ে কাজের টিপস, গাইড ও সর্বশেষ খবর — সব এক জায়গায়।"
      >
        {/* useSearchParams ব্যবহার করে, তাই Suspense — static HTML-এ fallback দেখায় */}
        <Suspense fallback={<BlogToolbarView query={DEFAULT_BLOG_QUERY} sorts={BLOG_SORTS} />}>
          <BlogToolbar sorts={BLOG_SORTS} />
        </Suspense>

        {(totalPosts > 0 || categories.length > 0) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            {totalPosts > 0 && (
              <span className="inline-flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" /> {toBn(totalPosts)}টি লেখা
              </span>
            )}
            {categories.length > 0 && (
              <span className="inline-flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-pink-400" /> {toBn(categories.length)}টি ক্যাটাগরি
              </span>
            )}
          </div>
        )}
      </PageHero>

      {/* ============================ LIST ============================ */}
      <section className="section dot-pattern">
        <div className="container-x">
          <Suspense
            fallback={
              <BlogListView
                query={DEFAULT_BLOG_QUERY}
                categories={categories}
                popularTags={popularTags}
                state={initial ? { status: 'ok', list: initial } : { status: 'loading' }}
              />
            }
          >
            <BlogBrowser initial={initial} categories={categories} popularTags={popularTags} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
