/**
 * ব্লগের সেটিং
 */

/** API-র sort মান — Laravel validation-এ যা আছে শুধু সেগুলোই রাখুন */
export const BLOG_SORTS = [
  { value: 'latest', label: 'সর্বশেষ' },
  { value: 'popular', label: 'জনপ্রিয়' },
  { value: 'oldest', label: 'পুরনো' },
] as const;

export type BlogSort = (typeof BLOG_SORTS)[number]['value'];

/** প্রতি পাতায় কয়টা পোস্ট */
export const BLOG_PER_PAGE = 9;

/** ব্লগ ডিটেইলে কয়টা related পোস্ট */
export const BLOG_RELATED_LIMIT = 3;

/** লিস্ট আর সাইডবারে কয়টা জনপ্রিয় ট্যাগ */
export const BLOG_POPULAR_TAGS_LIMIT = 12;
