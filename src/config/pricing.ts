/**
 * প্রাইসিং সেকশনগুলোর শুধু লেখা (শিরোনাম, বাটন) — এখানে বদলালেই বদলাবে।
 *
 * প্ল্যান, দাম, তুলনার টেবিল, অ্যাড-অন আর "কয় মাস ফ্রি" — সব আসে Laravel থেকে:
 *   GET school/pricing  →  services/pricing.service.ts
 * সুপার অ্যাডমিন প্যানেল থেকে বদলালে ৫ মিনিটের মধ্যে ওয়েবসাইটে দেখা যায়।
 */
import type { AddonCategory } from '@/types/pricing';

/**
 * প্ল্যান কার্ডের বাটন — Custom প্ল্যানে যোগাযোগ, বাকিগুলোতে রেজিস্ট্রেশন পেজ।
 * রেজিস্ট্রেশনের লিংকে প্ল্যান আর মাসিক/বাৎসরিক যোগ হয়:  /register?plan=standard&cycle=yearly#register
 */
export const PLAN_CTA = {
  default: { label: 'শুরু করুন', href: '/register' },
  custom: { label: 'যোগাযোগ করুন', href: '/contact-us' },
};

export const PLAN_PRICING_HEAD = {
  eyebrow: 'প্ল্যান ও মূল্য',
  title: 'Simple, transparent pricing',
  text: 'Pick the plan that fits your school today — upgrade anytime as you grow.',
  note: 'দামগুলো আনুমানিক, ভ্যাট আলাদা।',
};

/** {months} → API-র annual_free_months (সুপার অ্যাডমিন সেটিংস) দিয়ে বদলে যায় */
export const ANNUAL_OFFER = {
  eyebrow: 'বাৎসরিক প্ল্যান',
  title: 'Go Annual.',
  /** রঙিন অংশ */
  highlight: 'Get More.',
  text: 'Pay once for the year and get the first {months} months with full module access absolutely free.',
  offerTitle: 'First {months} Months — FREE',
  offerText: 'Explore the complete system before settling into your annual plan.',
  cta: { label: 'অফারটি নিন', href: '/register?cycle=yearly#register' },
};

export const COMPARISON_HEAD = {
  eyebrow: 'প্ল্যান তুলনা',
  title: 'Compare our plans',
  text: "Choose the level of functionality that fits your school's current needs.",
};

export const ADDONS_HEAD = {
  eyebrow: 'অ্যাড-অন',
  title: 'Extend your school software',
  text: 'Add the services and integrations your school needs. Pay only for what you require.',
  note: 'দামগুলো আনুমানিক, ভ্যাট আলাদা। প্রতিষ্ঠানের আকার ও প্রয়োজন অনুযায়ী পরিবর্তন হতে পারে।',
};

/** অ্যাড-অন কার্ডের আইকনের রঙ — ক্রম অনুযায়ী ঘুরে ঘুরে বসে */
export const ADDON_TONES = ['sky', 'emerald', 'violet', 'amber', 'rose', 'indigo', 'green', 'primary'] as const;
export type AddonTone = (typeof ADDON_TONES)[number];

/** ক্যাটাগরি ব্যাজের লেবেল — API-তে না থাকলে এগুলো */
export const ADDON_PRICE_TYPES: Record<AddonCategory, string> = {
  addon: 'Available as Add-on',
  integration: 'Integration pricing',
  usage: 'Usage-based',
  custom: 'Custom quotation',
};

/** রেজিস্ট্রেশনের লিংক — প্ল্যান কার্ড, অফার ব্যানার সব জায়গায় একই নিয়মে */
export const registerHref = (plan?: string | null, cycle?: 'monthly' | 'yearly' | null) => {
  const q = new URLSearchParams();
  if (plan) q.set('plan', plan);
  if (cycle) q.set('cycle', cycle);
  const qs = q.toString();
  return `/register${qs ? `?${qs}` : ''}#register`;
};
