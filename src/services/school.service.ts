/**
 * স্কুল রেজিস্ট্রেশন service — শুধু server-এ চলে
 *   POST school/check-subdomain   স্কুলের নাম থেকে সাবডোমেইন available কিনা + suggestion
 *   POST school/register          নতুন স্কুল রেজিস্ট্রেশন
 *
 * ব্রাউজার এগুলো সরাসরি ডাকে না — actions/school.actions.ts হয়ে আসে।
 */
import 'server-only';
import { api } from '@/lib/api/client';
import { ApiError, pickFieldErrors } from '@/lib/api/errors';
import { ACTIVE_STATUS_DEFAULT } from '@/config/school';
import type {
  SchoolApiEnvelope,
  SchoolRegistrationInput,
  SubdomainCheckResult,
} from '@/types/school';

/**
 * এই API HTTP 200 দিয়েও { status: 'error' } পাঠাতে পারে — সেটাকেও error ধরি।
 * (HTTP 4xx/5xx হলে lib/api/client নিজেই ApiError দেয়)
 */
function unwrap<T>(r: SchoolApiEnvelope<T> & { errors?: Record<string, string[]> }, fallback: string): T | null {
  if (r.status && r.status !== 'success') {
    const fieldErrors = pickFieldErrors(r as Parameters<typeof pickFieldErrors>[0]);
    const hasFields = Object.keys(fieldErrors).length > 0;
    throw new ApiError(Object.values(fieldErrors)[0] || r.message || fallback, {
      status: 422,
      code: hasFields ? 'VALIDATION' : 'BAD_REQUEST',
      fieldErrors,
    });
  }
  return r.data ?? null;
}

async function checkSubdomain(schoolName: string): Promise<SubdomainCheckResult> {
  const r = await api.post<SchoolApiEnvelope<Partial<SubdomainCheckResult>>>('school/check-subdomain', {
    body: { school_name: schoolName },
    forwardClientIp: true,
  });
  const data = unwrap(r, 'সাবডোমেইন চেক করা যায়নি, আবার চেষ্টা করুন।');
  if (!data?.host) throw new ApiError('সাবডোমেইন চেক করা যায়নি, আবার চেষ্টা করুন।', { code: 'INVALID_RESPONSE' });

  return {
    available: Boolean(data.available),
    subdomain: data.subdomain ?? '',
    host: data.host,
    suggestions: data.suggestions ?? [],
  };
}

async function register(input: SchoolRegistrationInput): Promise<{ message: string | null }> {
  const r = await api.post<SchoolApiEnvelope<unknown>>('school/register', {
    // status সবসময় server ঠিক করে — ব্রাউজার থেকে আসা মান মানা হয় না
    body: { ...input, active_status: ACTIVE_STATUS_DEFAULT },
    forwardClientIp: true,
    timeout: 15_000,
  });
  unwrap(r, 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন।');
  return { message: r.message ?? null };
}

export const schoolService = { checkSubdomain, register };
