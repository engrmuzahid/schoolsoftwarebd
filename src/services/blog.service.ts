import 'server-only';
import { cache } from 'react';
import { api } from '@/lib/api/client';
import { CACHE_TAGS, REVALIDATE } from '@/lib/api/cache-tags';
import { isNotFound } from '@/lib/api/errors';
import type { ApiResponse } from '@/lib/api/types';
import { BLOG_PER_PAGE } from '@/config/blog';
import type {
  BlogCategory,
  BlogLikeResponse,
  BlogList,
  BlogListParams,
  BlogPost,
  BlogPostDetail,
  BlogTag,
} from '@/types/blog';

const listQuery = (p: BlogListParams = {}) => ({
  q: p.q,
  category: p.category,
  tags: p.tags,
  sort: p.sort,
  per_page: p.perPage ?? BLOG_PER_PAGE,
  page: p.page && p.page > 1 ? p.page : undefined,
});

async function list(params: BlogListParams = {}): Promise<BlogList> {
  const r = await api.get<BlogList>('school/blogs', {
    query: listQuery(params),
    tags: [CACHE_TAGS.blog],
  });
  return { data: r.data ?? [], meta: r.meta };
}

const getBySlug = cache(async (slug: string): Promise<BlogPostDetail | null> => {
  try {
    const r = await api.get<ApiResponse<BlogPostDetail>>(`school/blogs/${encodeURIComponent(slug)}`, {
      tags: [CACHE_TAGS.blog, CACHE_TAGS.blogPost(slug)],
    });
    return r.data;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
});

async function related(slug: string, limit = 3): Promise<BlogPost[]> {
  const r = await api.get<ApiResponse<BlogPost[]>>(`school/blogs/${encodeURIComponent(slug)}/related`, {
    query: { limit },
    revalidate: REVALIDATE.medium,
    tags: [CACHE_TAGS.blog],
  });
  return r.data ?? [];
}

async function allSlugs(maxPages = 20): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const r = await api.get<BlogList>('school/blogs', {
      query: listQuery({ page, perPage: 50 }),
      revalidate: REVALIDATE.long,
      tags: [CACHE_TAGS.blog],
    });
    slugs.push(...(r.data ?? []).map((p) => p.slug));
    if (!r.meta || page >= r.meta.last_page) break;
  }
  return slugs;
}

async function categories(): Promise<BlogCategory[]> {
  const r = await api.get<ApiResponse<BlogCategory[]>>('school/blog-categories', {
    revalidate: REVALIDATE.medium,
    tags: [CACHE_TAGS.blogTaxonomy],
  });
  return r.data ?? [];
}

async function tags(opts: { popular?: boolean; limit?: number } = {}): Promise<BlogTag[]> {
  const r = await api.get<ApiResponse<BlogTag[]>>('school/blog-tags', {
    query: { popular: opts.popular ? 1 : undefined, limit: opts.limit },
    revalidate: REVALIDATE.medium,
    tags: [CACHE_TAGS.blogTaxonomy],
  });
  return r.data ?? [];
}

async function like(slug: string): Promise<number> {
  const r = await api.post<BlogLikeResponse>(`school/blogs/${encodeURIComponent(slug)}/like`, {
    forwardClientIp: true,
  });
  return r.likes_count;
}

export const blogService = { list, getBySlug, related, allSlugs, categories, tags, like };
