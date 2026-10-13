export type FeatureType = 'feature' | 'tutorial';

export type FeatureVideo = {
  youtube_id: string | null;
  watch_url: string | null;
  embed_url: string | null;
};

export type FeatureItem = {
  id: number;
  type: FeatureType;
  badge: string | null;
  title: string;
  slug: string;
  description: string | null;
  points: string[];
  image_url: string | null;
  video: FeatureVideo | null;
  sort_order: number;
  updated_at: string;
};

export type FeatureCounts = Partial<Record<FeatureType, number>>;

export type FeatureList = { items: FeatureItem[]; counts: FeatureCounts };
