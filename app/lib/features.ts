/**
 * Features / Tutorial API — server-side (build / ISR-এর সময় পেজ বানাতে)
 *   GET {NEXT_PUBLIC_API_BASE_URL}/school/features?type=tutorial
 *   GET {NEXT_PUBLIC_API_BASE_URL}/school/features?type=feature
 */
import 'server-only';
import { apiUrl, assetUrl } from './env.ts';

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

export type FeatureList = { items: FeatureItem[]; counts: Partial<Record<FeatureType, number>> };

/** কত সেকেন্ড পর পর API থেকে নতুন ডাটা আনবে */
const REVALIDATE = 60;

/** API-র ডাটা গুছিয়ে নিই — ফাঁকা পয়েন্ট বাদ, ছবির পূর্ণ URL, sort_order অনুযায়ী সাজানো */
function normalize(item: FeatureItem): FeatureItem {
  const ytId = item.video?.youtube_id?.trim() || null;
  return {
    ...item,
    points: (item.points ?? []).map((p) => p?.trim()).filter(Boolean),
    // ছবি না থাকলে YouTube-এর thumbnail
    image_url: assetUrl(item.image_url) ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
    video: item.video ? { ...item.video, youtube_id: ytId } : null,
  };
}

/** API কাজ না করলে null — পেজ ভাঙবে না, error বার্তা দেখাবে */
export async function getFeatures(type: FeatureType): Promise<FeatureList | null> {
  try {
    const res = await fetch(apiUrl(`school/features?type=${type}`), {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE, tags: ['features', `features-${type}`] },
      signal: AbortSignal.timeout(10000),
    });
    console.log("What is the response - ",res)
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: FeatureItem[]; counts?: FeatureList['counts'] };
    const items = (body.data ?? [])
      .filter((i) => i.type === type)
      .map(normalize)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    return { items, counts: body.counts ?? {} };
  } catch {
    return null;
  }
}
