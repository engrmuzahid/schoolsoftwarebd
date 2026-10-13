/**
 * স্কুল রেজিস্ট্রেশন service — শুধু server-এ চলে
 *   POST school/check-subdomain   স্কুলের নাম থেকে সাবডোমেইন available কিনা + suggestion
 *   POST school/register          নতুন স্কুল রেজিস্ট্রেশন (+ ট্রায়াল + প্রথম বিল)
 *
 * ব্রাউজার এগুলো সরাসরি ডাকে না — actions/school.actions.ts হয়ে আসে।
 */
import 'server-only';
import { api } from '@/lib/api/client';
import { ApiError, pickFieldErrors } from '@/lib/api/errors';
import { ACTIVE_STATUS_DEFAULT } from '@/config/school';
import type {
  RegistrationResult,
  SchoolApiEnvelope,
  SchoolRegistrationInput,
  SubdomainCheckResult,
} from '@/types/school';

/**
 * এই API HTTP 200 দিয়েও { status: 'error' } পাঠাতে পারে — সেটাকেও error ধরি।
 * (HTTP 4xx/5xx হলে lib/api/client নিজেই ApiError দেয়)
 */
export function unwrap<T>(r: SchoolApiEnvelope<T> & { errors?: Record<string, string[]> }, fallback: string): T | null {
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

/**
 * রেজিস্ট্রেশন — Laravel স্কুল তৈরি করে, ট্রায়াল চালু করে, প্রথম বিল বানায়।
 * উত্তরে পেমেন্ট পেজের token আসে।
 */
async function register(input: SchoolRegistrationInput): Promise<RegistrationResult & { message: string | null }> {
  console.log("What is the register - ",input)
  const r = await api.post<SchoolApiEnvelope<RegistrationResult>>('school/register', {
    body: { ...input, plan: input.plan || undefined, active_status: ACTIVE_STATUS_DEFAULT },
    forwardClientIp: true,
    timeout: 20_000,
  });
  console.log("What is the response - ",r)
  const data = unwrap(r, 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন।');
  if (!data?.payment?.token) {
    throw new ApiError('রেজিস্ট্রেশন হয়েছে, কিন্তু পেমেন্টের তথ্য পাওয়া যায়নি। আমাদের সাথে যোগাযোগ করুন।', {
      code: 'INVALID_RESPONSE',
    });
  }
  return { ...data, message: r.message ?? null };
}

export const schoolService = { checkSubdomain, register };
