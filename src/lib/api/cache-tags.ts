export const CACHE_TAGS = {
  blog: 'blog',
  blogPost: (slug: string) => `blog:${slug}`,
  blogTaxonomy: 'blog-taxonomy',
  features: 'features',
  featureType: (type: string) => `features:${type}`,
  pricing: 'pricing', 
} as const;

export const REVALIDATE = {
  short: 60,
  medium: 300,
  long: 3600,
} as const;