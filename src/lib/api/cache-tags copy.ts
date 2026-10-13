/**
 * Cache-এর নাম (tag) আর সময় — এক জায়গায়।
 * পরে Laravel থেকে webhook এলে revalidateTag(CACHE_TAGS.blog) দিয়ে সাথে সাথে মুছে ফেলা যাবে।
 */
export const CACHE_TAGS = {
  blog: 'blog', // সব ব্লগ লিস্ট
  blogPost: (slug: string) => `blog:${slug}`, // একটি পোস্ট
  blogTaxonomy: 'blog-taxonomy', // ক্যাটাগরি ও ট্যাগ
  features: 'features',
  featureType: (type: string) => `features:${type}`, // tutorial / feature
  pricing: 'pricing', // প্ল্যান, দাম, তুলনা, অ্যাড-অন
} as const;

/** কত সেকেন্ড পর পর API থেকে নতুন ডাটা আনবে */
export const REVALIDATE = {
  short: 60, // লিস্ট, ডিটেইল — নতুন পোস্ট ১ মিনিটের মধ্যে দেখা যায়
  medium: 300, // ক্যাটাগরি, ট্যাগ, related, প্রাইসিং
  long: 3600, // প্রায় বদলায় না এমন (sitemap-এর slug লিস্ট)
} as const;
