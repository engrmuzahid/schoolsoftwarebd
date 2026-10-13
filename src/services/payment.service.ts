/**
 * রেজিস্ট্রেশনের পরের পেমেন্ট — শুধু server-এ চলে
 *   GET  school/payment/{token}   বিল, বিকাশ নম্বর, নির্দেশনা
 *   POST school/payment/{token}   TrxID (+ রসিদ) জমা
 *
 * ব্রাউজার সরাসরি ডাকে না — actions/payment.actions.ts হয়ে আসে।
 * এই ডাটা cache হয় না (প্রতিটি বিল আলাদা, অবস্থা বদলায়)।
 */
import 'server-only';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { unwrap } from './school.service';
import type { SchoolApiEnvelope } from '@/types/school';
import type { PaymentPageData } from '@/types/payment';

const path = (token: string) => `school/payment/${encodeURIComponent(token)}`;

function ensure(data: PaymentPageData | null): PaymentPageData {
  if (!data?.invoice?.invoice_no) {
    throw new ApiError('বিলের তথ্য পাওয়া যায়নি।', { code: 'INVALID_RESPONSE' });
  }
  return data;
}

async function get(token: string): Promise<PaymentPageData> {
  const r = await api.get<SchoolApiEnvelope<PaymentPageData>>(path(token), { revalidate: false });
  return ensure(unwrap(r, 'বিলের তথ্য পাওয়া যায়নি।'));
}

/** body: FormData (payer_number, transaction_id, attachment?) */
async function submit(token: string, body: FormData): Promise<PaymentPageData & { message: string | null }> {
  const r = await api.post<SchoolApiEnvelope<PaymentPageData>>(path(token), {
    body,
    forwardClientIp: true,
    timeout: 30_000,
  });
  return { ...ensure(unwrap(r, 'পেমেন্ট জমা দেওয়া যায়নি, আবার চেষ্টা করুন।')), message: r.message ?? null };
}

export const paymentService = { get, submit };
