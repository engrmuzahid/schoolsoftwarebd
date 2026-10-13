import type { Paginated, PaginationMeta } from '@/lib/api/types';

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  blogs_count?: number;
};

export type BlogTag = { id: number; name: string; slug: string; blogs_count?: number };

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  is_featured: boolean;
  is_commentable: boolean;
  views_count: number;
  likes_count: number;
  reading_time: number;
  published_at: string;
  category: BlogCategory | null;
  tags: BlogTag[];
};

export type BlogPostDetail = BlogPost & {
  content: string;
  seo: {
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_image_url: string | null;
  } | null;
};

export type BlogListMeta = PaginationMeta;
export type BlogList = Paginated<BlogPost>;

/** লিস্ট API-র ফিল্টার */
export type BlogListParams = {
  q?: string;
  category?: string;
  tags?: string[];
  sort?: string;
  page?: number;
  perPage?: number;
};

/** POST /school/blogs/{slug}/like */
export type BlogLikeResponse = { success: boolean; likes_count: number };
