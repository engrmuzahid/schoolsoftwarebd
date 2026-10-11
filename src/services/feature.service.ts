/**
 * Features / Tutorial service — শুধু server-এ চলে
 *   GET school/features?type=tutorial
 *   GET school/features?type=feature
 *
 * ব্যবহার:  import { featureService } from '@/services/feature.service';
 *           const { items } = await featureService.list('tutorial');
 */
import 'server-only';
import { api } from '@/lib/api/client';
import { CACHE_TAGS } from '@/lib/api/cache-tags';
import { assetUrl } from '@/config/env';
import type { FeatureCounts, FeatureItem, FeatureList, FeatureType } from '@/types/feature';

/** API-র ডাটা গুছিয়ে নিই — ফাঁকা পয়েন্ট বাদ, ছবির পূর্ণ URL */
function normalize(item: FeatureItem): FeatureItem {
  const ytId = item.video?.youtube_id?.trim() || null;
  return {
    ...item,
    points: (item.points ?? []).map((p) => p?.trim()).filter(Boolean),
    image_url: assetUrl(item.image_url) ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
    video: item.video ? { ...item.video, youtube_id: ytId } : null,
  };
}

async function list(type: FeatureType): Promise<FeatureList> {
  const r = await api.get<{ data?: FeatureItem[]; counts?: FeatureCounts }>('school/features', {
    query: { type },
    tags: [CACHE_TAGS.features, CACHE_TAGS.featureType(type)],
  });
  const items = (r.data ?? [])
    .filter((i) => i.type === type)
    .map(normalize)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  return { items, counts: r.counts ?? {} };
}

export const featureService = { list };
