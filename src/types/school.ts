/**
 * স্কুল রেজিস্ট্রেশন API-র ডাটার গঠন
 *   POST school/check-subdomain   { school_name }
 *   POST school/register          { school_name, email, phone, full_address, domain, subdomain, type,
 *                                   plan, billing_cycle, active_status }
 */
import type { SCHOOL_TYPES } from '@/config/school';

export type SchoolType = (typeof SCHOOL_TYPES)[number]['value'];

export type SubdomainSuggestion = { subdomain: string; host: string };

export type SubdomainCheckResult = {
  available: boolean;
  subdomain: string;
  host: string;
  suggestions: SubdomainSuggestion[];
};

/** ফর্ম থেকে যা যায় */
export type SchoolRegistrationInput = {
  school_name: string;
  email: string;
  phone: string;
  full_address: string;
  domain: string;
  subdomain: string;
  type: string;
  /** প্ল্যানের key (basic / standard) — খালি হলে Laravel "জনপ্রিয়" প্ল্যান দেয় */
  plan: string;
  billing_cycle: BillingCycle;
};

export type BillingCycle = 'monthly' | 'yearly';

export type SchoolRegistrationField = keyof SchoolRegistrationInput;

/** সাবস্ক্রিপশনের সারাংশ — রেজিস্ট্রেশন আর পেমেন্ট পেজ দুই জায়গায় */
export type SubscriptionSummary = {
  plan_key: string | null;
  plan_name: string | null;
  billing_cycle: BillingCycle;
  cycle_label: string;
  monthly_price: number;
  cycle_price: number;
  free_months: number;
  student_limit: number | null;
  status: 'trialing' | 'active' | 'expired' | 'cancelled';
  status_label: string;
  trial_ends_at: string | null;
  trial_days_left: number;
};

/** রেজিস্ট্রেশন সফল হলে Laravel যা দেয় */
export type RegistrationResult = {
  school: { id: number; school_name: string; email: string; host: string | null };
  subscription: SubscriptionSummary;
  /** পেমেন্ট পেজের লিংকের গোপন token */
  payment: { token: string; invoice_no: string; amount: number };
};

/**
 * এই endpoint-গুলো এভাবে উত্তর দেয় (HTTP 200 হলেও status 'error' হতে পারে):
 *   { status: 'success' | 'error', message?: string, data?: {...} }
 */
export type SchoolApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T | null;
};
