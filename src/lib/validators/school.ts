/**
 * রেজিস্ট্রেশন ফর্মের validation — ব্রাউজার (সাথে সাথে error দেখাতে) আর
 * Server Action (কেউ ব্রাউজার এড়িয়ে পাঠালেও আটকাতে) — দুই জায়গাতেই একই নিয়ম।
 */
import { SCHOOL_TYPES } from '@/config/school';
import type { SchoolRegistrationField, SchoolRegistrationInput } from '@/types/school';

/** বাংলা অঙ্ক → ইংরেজি:  ০১৭১২ → 01712 */
export const toEnDigits = (v: string) => v.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

/** '০১৭১২-৩৪৫ ৬৭৮' → '01712345678' */
export const normalizePhone = (v: string) => toEnDigits(v).replace(/[\s\-()]/g, '');

type Rule = (value: string) => string | null;

export const SCHOOL_FIELD_RULES: Partial<Record<SchoolRegistrationField, Rule>> = {
  school_name: (v) => {
    const t = v.trim();
    if (t.length < 3) return 'স্কুলের পূর্ণ নাম লিখুন।';
    if (t.length > 150) return 'স্কুলের নাম ১৫০ অক্ষরের মধ্যে লিখুন।';
    return null;
  },
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'সঠিক ইমেইল ঠিকানা দিন।'),
  phone: (v) => (/^(?:\+?88)?01[3-9]\d{8}$/.test(normalizePhone(v)) ? null : 'সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)।'),
  domain: (v) =>
    !v.trim() || /^https?:\/\/[^\s/$.?#]+\.[^\s]{2,}$/i.test(v.trim()) ? null : 'ডোমেইন সম্পূর্ণ লিখুন, যেমন: https://example.com',
  full_address: (v) => (v.trim().length > 500 ? 'ঠিকানা ৫০০ অক্ষরের মধ্যে লিখুন।' : null),
  type: (v) => (SCHOOL_TYPES.some((t) => t.value === v) ? null : 'স্কুলের ধরন বেছে নিন।'),
};

export const SUBDOMAIN_REQUIRED_MESSAGE =
  'নিজের ডোমেইন না থাকলে "সাবডোমেইন চেক করুন" বাটনে ক্লিক করে একটি সাবডোমেইন বেছে নিন।';

/** পুরো ফর্ম যাচাই — কোনো error না থাকলে খালি object */
export function validateSchoolRegistration(input: SchoolRegistrationInput) {
  const errors: Partial<Record<SchoolRegistrationField, string>> = {};
  for (const [field, rule] of Object.entries(SCHOOL_FIELD_RULES) as [SchoolRegistrationField, Rule][]) {
    const msg = rule(input[field] ?? '');
    if (msg) errors[field] = msg;
  }
  // নিজের ডোমেইন না থাকলে সাবডোমেইন লাগবেই
  if (!input.domain?.trim() && !input.subdomain?.trim()) errors.subdomain = SUBDOMAIN_REQUIRED_MESSAGE;
  if (input.subdomain && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(input.subdomain)) {
    errors.subdomain = 'সাবডোমেইনটি সঠিক নয়, আবার চেক করুন।';
  }
  return errors;
}

/** পাঠানোর আগে তথ্য গুছিয়ে নেওয়া (ফাঁকা জায়গা বাদ, ফোন নম্বর ইংরেজি অঙ্কে) */
export const cleanSchoolRegistration = (input: SchoolRegistrationInput): SchoolRegistrationInput => ({
  school_name: input.school_name.trim(),
  email: input.email.trim().toLowerCase(),
  phone: normalizePhone(input.phone),
  full_address: input.full_address.trim(),
  domain: input.domain.trim(),
  subdomain: input.subdomain.trim(),
  type: input.type,
});
