export const BLOG_SORTS = [
  { value: 'latest', label: 'সর্বশেষ' },
  { value: 'popular', label: 'জনপ্রিয়' },
  { value: 'oldest', label: 'পুরনো' },
] as const;

export type BlogSort = (typeof BLOG_SORTS)[number]['value'];

export const BLOG_PER_PAGE = 9;
export const BLOG_RELATED_LIMIT = 3;
export const BLOG_POPULAR_TAGS_LIMIT = 12;
