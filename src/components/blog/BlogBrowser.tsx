"use client";

/**
 * /blog-এর সার্চ, ফিল্টার, সর্ট, পেজিনেশন — URL (?q=&category=…) পড়ে ব্রাউজার থেকে
 * সরাসরি Laravel API কল করে। ফিল্টার ছাড়া প্রথম পাতা server থেকে আগেই আসে (initial)।
 *
 * TODO(ধাপ ২): ব্রাউজার থেকে সরাসরি API কল বাদ দিয়ে server-এ (blogService) নেওয়া হবে।
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogListView, { type BlogListState } from './BlogListView';
import { blogHref, parseBlogQuery } from './blog-query';
import { smoothScrollTo } from '@/components/layout/SmoothScroll';
import { BLOG_PER_PAGE, BLOG_SORTS } from '@/config/blog';
import { API_BASE_URL } from '@/config/env';
import { apiErrorFromResponse, toApiError } from '@/lib/api/errors';
import type { BlogCategory, BlogList, BlogTag } from '@/types/blog';

const SORT_VALUES = BLOG_SORTS.map((s) => s.value);

type Props = {
  initial: BlogList | null;
  categories: BlogCategory[];
  popularTags: BlogTag[];
};

export default function BlogBrowser({ initial, categories, popularTags }: Props) {
  const searchParams = useSearchParams();
  const query = useMemo(() => parseBlogQuery(Object.fromEntries(searchParams), SORT_VALUES), [searchParams]);
  const key = blogHref(query, { page: query.page }); // blogHref নিজে page ১-এ ফেরায়, তাই page আলাদা করে দিই
  const isDefault = key === '/blog';

  const [state, setState] = useState<BlogListState>(() =>
    isDefault && initial ? { status: 'ok', list: initial } : { status: 'loading' },
  );
  const [retry, setRetry] = useState(0);

  /* ডাটা আনা */
  useEffect(() => {
    if (isDefault && initial && retry === 0) {
      setState({ status: 'ok', list: initial });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });

    const sp = new URLSearchParams({ sort: query.sort, per_page: String(BLOG_PER_PAGE) });
    if (query.q) sp.set('q', query.q);
    if (query.category) sp.set('category', query.category);
    if (query.tags.length) sp.set('tags', query.tags.join(','));
    if (query.page > 1) sp.set('page', String(query.page));

    fetch(`${API_BASE_URL}/school/blogs?${sp}`, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw await apiErrorFromResponse(res);
        const r = (await res.json()) as BlogList;
        setState({ status: 'ok', list: { data: r.data ?? [], meta: r.meta } });
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setState({ status: 'error', message: toApiError(e).message });
      });

    return () => ctrl.abort();
    // key-তেই পুরো query আছে
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retry]);

  /* পাতা/ফিল্টার বদলালে লিস্টের শুরুতে স্ক্রল (লিস্টের শুরু স্ক্রিনের উপরে চলে গেলে) */
  const prevKey = useRef(key);
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    // skeleton বসে পেজের উচ্চতা বদলানোর পর স্ক্রল শুরু করি
    const t = window.setTimeout(() => {
      const el = document.getElementById('posts');
      if (el && el.getBoundingClientRect().top < 0) smoothScrollTo(el);
    }, 60);
    return () => window.clearTimeout(t);
  }, [key]);

  return (
    <BlogListView
      query={query}
      categories={categories}
      popularTags={popularTags}
      state={state}
      onRetry={() => setRetry((n) => n + 1)}
    />
  );
}
