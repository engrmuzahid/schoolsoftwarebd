/**
 * পেমেন্ট ফর্মের validation — ব্রাউজার আর Server Action দুই জায়গায় একই নিয়ম
 * (Laravel-এও একই নিয়ম আছে — RegistrationPaymentController)
 */
import { normalizePhone, toEnDigits } from './school';
import type { PaymentSubmitField } from '@/types/payment';

export const ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024; // ২ MB
export const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';

/** '০১৭১২-৩৪৫৬৭৮' → '01712345678' ;  '+8801712…' → '01712…' */
export const cleanPayerNumber = (v: string) => normalizePhone(v).replace(/^\+?88/, '');

/** TrxID: ফাঁকা বাদ, বড় হাতের অক্ষর — বিকাশের মেসেজে যেমন থাকে */
export const cleanTrxId = (v: string) => toEnDigits(v).replace(/\s+/g, '').toUpperCase();

export const PAYMENT_RULES: Record<Exclude<PaymentSubmitField, 'attachment'>, (v: string) => string | null> = {
  payer_number: (v) =>
    /^01[3-9]\d{8}$/.test(cleanPayerNumber(v)) ? null : 'যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন সেটি দিন (যেমন: 01712345678)।',
  transaction_id: (v) => {
    const t = cleanTrxId(v);
    if (!t) return 'বিকাশের Transaction ID (TrxID) দিন।';
    if (!/^[A-Z0-9]{8,20}$/.test(t)) return 'Transaction ID সঠিক নয় — বিকাশের মেসেজ থেকে আবার দেখে দিন।';
    return null;
  },
};

export function validateAttachment(file: File | null | undefined, required: boolean): string | null {
  if (!file || file.size === 0) return required ? 'পেমেন্টের রসিদ/স্ক্রিনশট দিন।' : null;
  if (!ATTACHMENT_TYPES.includes(file.type)) return 'রসিদ ছবি (JPG, PNG) অথবা PDF হতে হবে।';
  if (file.size > ATTACHMENT_MAX_BYTES) return 'রসিদ ২ MB-এর বেশি হতে পারবে না।';
  return null;
}
