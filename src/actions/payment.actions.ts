'use server';

/**
 * পেমেন্ট পেজের Server Action — ব্রাউজার শুধু এগুলোই ডাকে।
 *   const r = await getPaymentInfo(token);
 *   const r = await submitPayment(formData);   // formData-তে token, payer_number, transaction_id, attachment?
 *
 * ⚠️ রসিদ আপলোড Server Action দিয়ে যায় — next.config-এ bodySizeLimit বাড়াতে হয় (ডিফল্ট ১ MB):
 *     experimental: { serverActions: { bodySizeLimit: '3mb' } }
 */
import { runAction } from '@/lib/api/action';
import type { ActionResult } from '@/lib/api/types';
import { PAYMENT_RULES, cleanPayerNumber, cleanTrxId, validateAttachment } from '@/lib/validators/payment';
import { paymentService } from '@/services/payment.service';
import type { PaymentPageData, PaymentSubmitField } from '@/types/payment';

const isToken = (t: string) => /^[A-Za-z0-9]{32,64}$/.test(t);
const BAD_LINK = 'পেমেন্টের লিংকটি সঠিক নয়। রেজিস্ট্রেশনের পর পাওয়া লিংকটি আবার খুলুন।';

export async function getPaymentInfo(token: string): Promise<ActionResult<PaymentPageData>> {
  const t = String(token ?? '').trim();
  if (!isToken(t)) return { ok: false, message: BAD_LINK, status: 404 };

  return runAction(() => paymentService.get(t));
}

export async function submitPayment(form: FormData): Promise<ActionResult<PaymentPageData & { message: string | null }>> {
  const token = String(form.get('token') ?? '').trim();
  if (!isToken(token)) return { ok: false, message: BAD_LINK, status: 404 };

  const payer = cleanPayerNumber(String(form.get('payer_number') ?? ''));
  const trx = cleanTrxId(String(form.get('transaction_id') ?? ''));
  const file = form.get('attachment');
  const attachment = file instanceof File && file.size > 0 ? file : null;
  const required = form.get('attachment_required') === '1';

  // ব্রাউজারে যাচাই হলেও এখানে আবার — কেউ সরাসরি পাঠালেও আটকাবে (Laravel-ও আবার যাচাই করে)
  const fieldErrors: Partial<Record<PaymentSubmitField, string>> = {};
  const p = PAYMENT_RULES.payer_number(payer);
  const x = PAYMENT_RULES.transaction_id(trx);
  const a = validateAttachment(attachment, required);
  if (p) fieldErrors.payer_number = p;
  if (x) fieldErrors.transaction_id = x;
  if (a) fieldErrors.attachment = a;
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: Object.values(fieldErrors)[0]!, fieldErrors, status: 422 };
  }

  const body = new FormData();
  body.set('payer_number', payer);
  body.set('transaction_id', trx);
  if (attachment) body.set('attachment', attachment, attachment.name);

  return runAction(() => paymentService.submit(token, body));
}
