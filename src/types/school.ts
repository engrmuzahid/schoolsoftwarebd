/**
 * স্কুল রেজিস্ট্রেশন API-র ডাটার গঠন
 *   POST school/check-subdomain   { school_name }
 *   POST school/register          { school_name, email, phone, full_address, domain, subdomain, type, active_status }
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
};

export type SchoolRegistrationField = keyof SchoolRegistrationInput;

/**
 * এই endpoint-গুলো এভাবে উত্তর দেয় (HTTP 200 হলেও status 'error' হতে পারে):
 *   { status: 'success' | 'error', message?: string, data?: {...} }
 */
export type SchoolApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T | null;
};
