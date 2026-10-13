/**
 * প্রাইসিং — Laravel API (GET school/pricing) আর কম্পোনেন্টের টাইপ
 */

/* ============================== API থেকে যা আসে ============================== */

export type ApiPricingSettings = {
  trial_days: number;
  annual_free_months: number;
  annual_paid_months: number;
  currency: string | null;
  currency_symbol: string | null;
  vat_percent: number;
};

export type ApiPlanTier = {
  label: string;
  min_students: number;
  max_students: number | null;
  monthly: number;
  yearly: number;
};

export type ApiPlan = {
  key: string;
  name: string;
  tagline: string | null;
  badge: string | null;
  is_featured: boolean;
  is_custom: boolean;
  highlights_title: string | null;
  highlights: string[];
  price: { monthly: number; yearly: number; from: boolean; min_students: number; max_students: number | null } | null;
  tiers: ApiPlanTier[];
};

export type ModuleAccess = 'full' | 'basic' | 'addon' | 'on_request';

export type ApiComparisonRow = {
  key: string;
  name: string;
  name_bn: string | null;
  group: string;
  /** plan key → ঘর; null = নেই */
  values: Record<string, { access: ModuleAccess; text: string | null } | null>;
};

export type AddonCategory = 'addon' | 'integration' | 'usage' | 'custom';

export type ApiAddon = {
  key: string;
  name: string;
  description: string | null;
  /** lucide আইকনের নাম, যেমন CreditCard */
  icon: string | null;
  category: AddonCategory;
  billing: string;
  price: number | null;
  price_from: boolean;
  unit: string | null;
  is_featured: boolean;
  module_key: string | null;
};

export type ApiPricing = {
  settings: ApiPricingSettings;
  plans: ApiPlan[];
  comparison: ApiComparisonRow[];
  addons: ApiAddon[];
  labels: { access: Record<string, string>; addon_categories: Record<string, string>; addon_billings: Record<string, string> };
};

/* ============================== কম্পোনেন্ট যা পায় ============================== */

export type Plan = {
  key: string;
  name: string;
  tagline: string;
  /** null = "আলোচনা সাপেক্ষে" */
  price: { monthly: number; yearly: number; from: boolean; maxStudents: number | null } | null;
  featured: boolean;
  /** Custom প্ল্যান — রেজিস্ট্রেশন না, যোগাযোগ */
  isCustom: boolean;
  badge: string | null;
  highlightsTitle: string;
  highlights: string[];
  cta: { label: string; href: string };
};

/**
 * তুলনার ঘর:
 *   true → ✓   false → —   লেখা ('Basic', 'Add-on', 'Priority' …) → ব্যাজ/লেখা
 */
export type FeatureValue = boolean | string;
export type ComparisonCell = { value: FeatureValue; access: ModuleAccess | null };
export type ComparisonRow = { key: string; feature: string; values: Record<string, ComparisonCell> };

export type Addon = {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  type: AddonCategory;
  typeLabel: string;
  price: { amount: number | null; unit: string | null; from: boolean };
  highlight: boolean;
};

export type PricingSettings = {
  trialDays: number;
  freeMonths: number;
  paidMonths: number;
  currencySymbol: string;
};

export type PricingData = {
  settings: PricingSettings;
  plans: Plan[];
  comparison: ComparisonRow[];
  addons: Addon[];
};
