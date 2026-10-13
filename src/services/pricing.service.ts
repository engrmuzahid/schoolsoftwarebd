/**
 * প্রাইসিং service — শুধু server-এ চলে
 *   GET school/pricing  →  প্ল্যান, তুলনার টেবিল, অ্যাড-অন, সেটিং — সব একসাথে
 *
 * ব্যবহার:  import { pricingService } from '@/services/pricing.service';
 *           const pricing = await pricingService.get();
 *
 * React cache(): একই রিকোয়েস্টে কয়েকটা সেকশন get() ডাকলেও API কল একবারই হয়।
 */
import 'server-only';
import { cache } from 'react';
import { api } from '@/lib/api/client';
import { CACHE_TAGS, REVALIDATE } from '@/lib/api/cache-tags';
import { PLAN_CTA } from '@/config/pricing';
import type {
  ApiAddon,
  ApiComparisonRow,
  ApiPlan,
  ApiPricing,
  ComparisonRow,
  PricingData,
  Addon,
  Plan,
} from '@/types/pricing';

/** খালি ডাটা — build-এর সময় API না পেলে */
export const EMPTY_PRICING: PricingData = {
  settings: { trialDays: 0, freeMonths: 0, paidMonths: 12, currencySymbol: '৳' },
  plans: [],
  comparison: [],
  addons: [],
};

function toPlan(p: ApiPlan): Plan {
  return {
    key: p.key,
    name: p.name,
    tagline: p.tagline ?? '',
    price: p.price
      ? { monthly: p.price.monthly, yearly: p.price.yearly, from: p.price.from, maxStudents: p.price.max_students }
      : null,
    featured: p.is_featured,
    isCustom: p.is_custom,
    badge: p.badge?.trim() || null,
    highlightsTitle: p.highlights_title?.trim() || 'যা যা পাবেন:',
    highlights: (p.highlights ?? []).map((h) => h?.trim()).filter(Boolean),
    // Custom প্ল্যান → যোগাযোগ; বাকিগুলোর লিংকে প্ল্যান ও মাসিক/বাৎসরিক যোগ হয় PlanCards-এ
    cta: p.is_custom ? PLAN_CTA.custom : PLAN_CTA.default,
  };
}

/** ঘরের মান: নেই → false, Full (লেখা ছাড়া) → true, বাকি → লেখা */
function toRow(r: ApiComparisonRow, planKeys: string[]): ComparisonRow {
  const values: ComparisonRow['values'] = {};
  for (const key of planKeys) {
    const cell = r.values?.[key] ?? null;
    values[key] = !cell
      ? { value: false, access: null }
      : { value: cell.text?.trim() || true, access: cell.access };
  }
  return { key: r.key, feature: r.name, values };
}

function toAddon(a: ApiAddon, categories: Record<string, string>): Addon {
  return {
    key: a.key,
    title: a.name,
    description: a.description ?? '',
    icon: a.icon,
    type: a.category,
    typeLabel: categories[a.category] ?? a.category,
    price: { amount: a.price, unit: a.unit, from: a.price !== null && a.price_from },
    highlight: a.is_featured,
  };
}

async function fetchPricing(): Promise<PricingData> {
  const r = await api.get<{ data: ApiPricing }>('school/pricing', {
    tags: [CACHE_TAGS.pricing],
    revalidate: REVALIDATE.medium,
  });
  const d = r.data;
  const plans = (d.plans ?? []).map(toPlan);
  const planKeys = plans.map((p) => p.key);
  const s = d.settings;

  return {
    settings: {
      trialDays: Number(s?.trial_days) || 0,
      freeMonths: Number(s?.annual_free_months) || 0,
      paidMonths: Number(s?.annual_paid_months) || 12,
      currencySymbol: s?.currency_symbol || '৳',
    },
    plans,
    comparison: (d.comparison ?? []).map((row) => toRow(row, planKeys)),
    addons: (d.addons ?? []).map((a) => toAddon(a, d.labels?.addon_categories ?? {})),
  };
}

export const pricingService = { get: cache(fetchPricing) };
