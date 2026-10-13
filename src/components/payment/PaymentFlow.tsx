"use client";

/**
 * রেজিস্ট্রেশনের পরের পেমেন্ট — /register/payment?token=…(&welcome=1)
 * ---------------------------------------------------------------
 * ১) token দিয়ে বিল আনে (getPaymentInfo — Server Action)
 * ২) বিকাশ নম্বর, টাকার পরিমাণ, নির্দেশনা দেখায়
 * ৩) TrxID + ঐচ্ছিক রসিদ জমা (submitPayment) → অভিনন্দন
 *    অথবা "পরে পেমেন্ট করব" → অভিনন্দন (ট্রায়াল তো চালুই)
 *
 * বিল আগেই পরিশোধিত / যাচাই চলছে হলে ফর্মের বদলে সেই অবস্থা দেখায়।
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  FileText,
  Gift,
  Hash,
  Info,
  LoaderCircle,
  Paperclip,
  PartyPopper,
  Phone,
  ReceiptText,
  Send,
  Smartphone,
  X,
} from 'lucide-react';
import { getPaymentInfo, submitPayment } from '@/actions/payment.actions';
import { Skeleton } from '@/components/ui/Skeleton';
import StateBox from '@/components/ui/StateBox';
import { formatDate, toBn } from '@/lib/utils/format';
import { ATTACHMENT_ACCEPT, PAYMENT_RULES, validateAttachment } from '@/lib/validators/payment';
import type { PaymentPageData, PaymentSubmitField } from '@/types/payment';

type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: PaymentPageData };
type Finish = null | 'submitted' | 'skipped';

const money = (n: number, cur: string) => `${cur}${toBn(n.toLocaleString('en-US', { maximumFractionDigits: 2 }))}`;

const inputCls = (invalid: boolean) =>
  `w-full rounded-xl border py-3 pl-11 pr-4 text-[15px] leading-6 text-secondary transition placeholder:text-muted focus:bg-white focus:outline-none focus:ring-4 ${
    invalid
      ? 'border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/10'
      : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary focus:ring-primary/10'
  }`;

/* ------------------------------ ছোট অংশ ------------------------------ */

function CopyButton({ text, label = 'কপি' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ক্লিপবোর্ড বন্ধ থাকলে কিছু করি না */
        }
      }}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-secondary transition hover:border-primary hover:text-primary"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'কপি হয়েছে' : label}
    </button>
  );
}

function LoadingView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]" aria-busy="true">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}

/** অভিনন্দন — পেমেন্ট জমা বা "পরে করব" */
function FinishView({ data, kind, paymentUrl }: { data: PaymentPageData; kind: Exclude<Finish, null>; paymentUrl: string }) {
  const sub = data.subscription;
  const submitted = kind === 'submitted';

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:px-12" role="status" aria-live="polite">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-white shadow-[0_16px_40px_-12px_rgba(236,72,153,0.6)]">
        <PartyPopper className="h-10 w-10" />
      </span>
      <h2 className="mt-7 text-2xl font-bold text-secondary sm:text-3xl">অভিনন্দন! 🎉</h2>
      <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-body">
        <strong className="text-secondary">{data.school.school_name}</strong> এখন আমাদের পরিবারের অংশ।
        {submitted
          ? ' আপনার পেমেন্টের তথ্য আমরা পেয়েছি — যাচাই শেষে সাবস্ক্রিপশন সক্রিয় হবে। ততক্ষণ ফ্রি ট্রায়ালে সব কাজ করতে পারবেন।'
          : ' আপনার ফ্রি ট্রায়াল চালু আছে — সফটওয়্যারটি ঘুরে দেখুন, পছন্দ হলে ট্রায়াল শেষের আগে পেমেন্ট করুন।'}
      </p>

      <dl className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">
        {sub && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <dt className="text-xs text-muted">প্ল্যান</dt>
            <dd className="mt-0.5 font-semibold text-secondary">
              {sub.plan_name} · {sub.cycle_label}
            </dd>
          </div>
        )}
        {sub?.trial_ends_at && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <dt className="text-xs text-muted">ফ্রি ট্রায়াল শেষ</dt>
            <dd className="mt-0.5 font-semibold text-secondary">{formatDate(sub.trial_ends_at)}</dd>
          </div>
        )}
        {submitted && data.latest_payment && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
            <dt className="text-xs text-muted">জমা দেওয়া TrxID</dt>
            <dd className="mt-0.5 font-mono font-semibold text-secondary">{data.latest_payment.transaction_id}</dd>
          </div>
        )}
        {data.school.host && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
            <dt className="text-xs text-muted">আপনার স্কুলের ঠিকানা</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-primary">{data.school.host}</dd>
          </div>
        )}
      </dl>

      <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-muted">
        লগইনের তথ্য আপনার ইমেইলে পাঠানো হয়েছে। আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
      </p>

      {!submitted && (
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-left text-sm text-body">
          <p className="font-semibold text-secondary">পরে পেমেন্ট করবেন কীভাবে?</p>
          <p className="mt-1 leading-6">স্কুল প্যানেলের বিল পেজ থেকে, অথবা এই লিংক থেকে — লিংকটা সংরক্ষণ করে রাখুন:</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-xs text-secondary">{paymentUrl}</code>
            <CopyButton text={paymentUrl} label="লিংক কপি" />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          মূল পাতায় যান <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/tutorial" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary">
          ভিডিও টিউটোরিয়াল দেখুন
        </Link>
      </div>
    </div>
  );
}

/* ============================== Component ============================== */
export default function PaymentFlow() {
  const sp = useSearchParams();
  const token = sp.get('token') ?? '';
  const welcome = sp.get('welcome') === '1';

  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [finish, setFinish] = useState<Finish>(null);

  const [payer, setPayer] = useState('');
  const [trx, setTrx] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<PaymentSubmitField, string | null>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading' });
    getPaymentInfo(token).then((r) => {
      if (!alive) return;
      setLoad(r.ok ? { status: 'ready', data: r.data } : { status: 'error', message: r.message });
    });
    return () => {
      alive = false;
    };
  }, [token]);

  if (load.status === 'loading') return <LoadingView />;

  if (load.status === 'error') {
    return (
      <StateBox
        tone="error"
        icon={<CircleAlert />}
        title="বিলটি খুলতে পারছি না"
        text={load.message}
        action={
          <Link href="/contact-us" className="btn btn-primary">
            যোগাযোগ করুন <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  const data = load.data;
  const { invoice, bkash, subscription: sub } = data;
  const cur = data.currency_symbol || '৳';
  const paymentUrl = typeof window !== 'undefined' ? `${window.location.origin}/register/payment?token=${encodeURIComponent(token)}` : '';

  if (finish) return <FinishView data={data} kind={finish} paymentUrl={paymentUrl} />;

  const rejected = data.latest_payment?.status === 'rejected' ? data.latest_payment : null;
  const canPay = invoice.status === 'unpaid';

  const onFile = (f: File | null) => {
    setFile(f);
    setErrors((e) => ({ ...e, attachment: f ? validateAttachment(f, data.attachment_required) : null }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const next = {
      payer_number: PAYMENT_RULES.payer_number(payer),
      transaction_id: PAYMENT_RULES.transaction_id(trx),
      attachment: validateAttachment(file, data.attachment_required),
    };
    setErrors(next);
    const first = (Object.keys(next) as PaymentSubmitField[]).find((k) => next[k]);
    if (first) {
      document.getElementById(`pay-${first}`)?.focus();
      return;
    }

    const fd = new FormData();
    fd.set('token', token);
    fd.set('payer_number', payer);
    fd.set('transaction_id', trx);
    fd.set('attachment_required', data.attachment_required ? '1' : '0');
    if (file) fd.set('attachment', file);

    setSubmitting(true);
    const r = await submitPayment(fd);
    setSubmitting(false);

    if (r.ok) {
      setLoad({ status: 'ready', data: r.data });
      setFinish('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (r.fieldErrors) setErrors((prev) => ({ ...prev, ...(r.fieldErrors as Partial<Record<PaymentSubmitField, string>>) }));
    setFormError(r.message);
  };

  return (
    <div className="space-y-6">
      {/* রেজিস্ট্রেশন সফল — ট্রায়াল চালু */}
      {welcome && sub && (
        <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/5 px-5 py-4 text-sm text-body">
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-secondary">রেজিস্ট্রেশন সম্পন্ন হয়েছে!</p>
            <p className="mt-0.5 leading-6">
              <b>{data.school.school_name}</b>-এর ফ্রি ট্রায়াল চালু হয়েছে
              {sub.trial_ends_at ? ` — চলবে ${formatDate(sub.trial_ends_at)} পর্যন্ত` : ''}। চাইলে এখনই পেমেন্ট করে রাখুন, নয়তো পরে করুন।
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ---------------- বাঁ: বিল + বিকাশ নির্দেশনা ---------------- */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-secondary">
                <ReceiptText className="h-5 w-5 text-primary" /> বিল
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-secondary">
                {invoice.invoice_no} <CopyButton text={invoice.invoice_no} />
              </span>
            </div>

            <ul className="mt-5 divide-y divide-slate-100 text-[15px]">
              {invoice.items.map((it) => (
                <li key={it.description} className="flex justify-between gap-4 py-2.5">
                  <span className="text-body">{it.description}</span>
                  <span className="shrink-0 font-semibold text-secondary">{money(it.amount, cur)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t-2 border-dashed border-slate-200 pt-4">
              <span className="font-semibold text-secondary">মোট</span>
              <span className="text-3xl font-bold text-secondary">{money(invoice.total, cur)}</span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {invoice.period_start && invoice.period_end && (
                <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">মেয়াদ</dt>
                    <dd className="font-medium text-secondary">
                      {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
                    </dd>
                  </div>
                </div>
              )}
              {sub?.trial_ends_at && sub.status === 'trialing' && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
                  <Gift className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <dt className="text-xs text-emerald-700">ফ্রি ট্রায়াল</dt>
                    <dd className="font-medium text-emerald-800">
                      {formatDate(sub.trial_ends_at)} পর্যন্ত ({toBn(sub.trial_days_left)} দিন বাকি)
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              এখন পেমেন্ট করলেও ট্রায়ালের দিনগুলো নষ্ট হবে না — পেইড মেয়াদ শুরু হবে ট্রায়াল শেষ হওয়ার পর থেকে।
            </p>
          </section>

          {/* বিকাশ নির্দেশনা */}
          {canPay && (
            <section className="rounded-3xl border border-[#E2136E]/20 bg-[#E2136E]/[0.04] p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-bold text-secondary">
                <Smartphone className="h-5 w-5 text-[#E2136E]" /> বিকাশে কীভাবে পাঠাবেন
              </h2>

              {bkash.number ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#E2136E]/20">
                  <div>
                    <p className="text-xs text-muted">
                      বিকাশ নম্বর ({bkash.account_type === 'merchant' ? 'মার্চেন্ট' : bkash.account_type === 'agent' ? 'এজেন্ট' : 'পার্সোনাল'})
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-wider text-[#B0175F]">{bkash.number}</p>
                  </div>
                  <CopyButton text={bkash.number} label="নম্বর কপি" />
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
                  বিকাশ নম্বর এখনো সেট করা হয়নি — পেমেন্টের জন্য আমাদের সাথে যোগাযোগ করুন
                  {data.support_phone ? ` (${data.support_phone})` : ''}।
                </p>
              )}

              <ol className="mt-5 space-y-3 text-[15px] text-body">
                {[
                  <>বিকাশ অ্যাপ বা *247# থেকে <b>{bkash.account_type === 'merchant' ? 'Payment' : 'Send Money'}</b> বেছে নিন</>,
                  <>উপরের নম্বরে ঠিক <b className="text-secondary">{money(invoice.total, cur)}</b> পাঠান</>,
                  <>Reference-এ লিখুন <b className="font-mono text-secondary">{invoice.invoice_no}</b></>,
                  <>বিকাশের মেসেজ থেকে <b>TrxID</b> নিয়ে পাশের ফর্মে দিন</>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2136E] text-xs font-bold text-white">
                      {toBn(i + 1)}
                    </span>
                    <span className="leading-6">{step}</span>
                  </li>
                ))}
              </ol>

              {bkash.instructions && (
                <p className="mt-5 whitespace-pre-line rounded-xl bg-white px-4 py-3 text-sm leading-6 text-body ring-1 ring-slate-200">
                  {bkash.instructions}
                </p>
              )}
            </section>
          )}
        </div>

        {/* ---------------- ডান: ফর্ম / অবস্থা ---------------- */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:p-8 lg:sticky lg:top-28">
          {invoice.status === 'paid' && (
            <div className="py-6 text-center">
              <BadgeCheck className="mx-auto h-14 w-14 text-success" />
              <h2 className="mt-4 text-xl font-bold text-secondary">বিলটি পরিশোধিত</h2>
              <p className="mt-2 text-body">ধন্যবাদ! আপনার সাবস্ক্রিপশন সক্রিয় আছে।</p>
            </div>
          )}

          {invoice.status === 'pending_review' && (
            <div className="py-6 text-center">
              <Clock className="mx-auto h-14 w-14 text-amber-500" />
              <h2 className="mt-4 text-xl font-bold text-secondary">পেমেন্ট যাচাই চলছে</h2>
              <p className="mx-auto mt-2 max-w-sm leading-7 text-body">
                {data.latest_payment ? (
                  <>
                    TrxID <b className="font-mono text-secondary">{data.latest_payment.transaction_id}</b> আমরা পেয়েছি। যাচাই শেষে
                    সাবস্ক্রিপশন সক্রিয় হবে।
                  </>
                ) : (
                  'যাচাই শেষে সাবস্ক্রিপশন সক্রিয় হবে।'
                )}
              </p>
              <button type="button" onClick={() => setFinish('submitted')} className="btn btn-primary mt-6">
                ঠিক আছে <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {invoice.status === 'cancelled' && (
            <div className="py-6 text-center">
              <X className="mx-auto h-14 w-14 text-rose-500" />
              <h2 className="mt-4 text-xl font-bold text-secondary">বিলটি বাতিল করা হয়েছে</h2>
              <p className="mt-2 text-body">বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।</p>
            </div>
          )}

          {canPay && (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-xl font-bold text-secondary">পেমেন্টের তথ্য দিন</h2>
              <p className="mt-1 text-sm text-muted">টাকা পাঠানোর পর এই ফর্মটি পূরণ করুন।</p>

              {rejected && (
                <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">আগের পেমেন্টটি (TrxID {rejected.transaction_id}) গ্রহণ করা যায়নি</p>
                    {rejected.admin_note && <p className="mt-0.5">কারণ: {rejected.admin_note}</p>}
                    <p className="mt-0.5">সঠিক তথ্য দিয়ে আবার জমা দিন।</p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="pay-payer_number" className="mb-2 block text-sm font-semibold text-secondary">
                    যে বিকাশ নম্বর থেকে পাঠিয়েছেন <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-[15px] h-[18px] w-[18px] text-muted" />
                    <input
                      id="pay-payer_number"
                      type="tel"
                      inputMode="tel"
                      value={payer}
                      onChange={(e) => {
                        setPayer(e.target.value);
                        if (errors.payer_number) setErrors((er) => ({ ...er, payer_number: PAYMENT_RULES.payer_number(e.target.value) }));
                      }}
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                      className={inputCls(!!errors.payer_number)}
                      aria-invalid={!!errors.payer_number || undefined}
                    />
                  </div>
                  {errors.payer_number && <p className="mt-1.5 text-[13px] text-rose-600">{errors.payer_number}</p>}
                </div>

                <div>
                  <label htmlFor="pay-transaction_id" className="mb-2 block text-sm font-semibold text-secondary">
                    Transaction ID (TrxID) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3.5 top-[15px] h-[18px] w-[18px] text-muted" />
                    <input
                      id="pay-transaction_id"
                      value={trx}
                      onChange={(e) => {
                        setTrx(e.target.value.toUpperCase());
                        if (errors.transaction_id) setErrors((er) => ({ ...er, transaction_id: PAYMENT_RULES.transaction_id(e.target.value) }));
                      }}
                      placeholder="যেমন: 8N7A6B5C4D"
                      autoComplete="off"
                      spellCheck={false}
                      className={`${inputCls(!!errors.transaction_id)} font-mono uppercase tracking-wider`}
                      aria-invalid={!!errors.transaction_id || undefined}
                    />
                  </div>
                  {errors.transaction_id ? (
                    <p className="mt-1.5 text-[13px] text-rose-600">{errors.transaction_id}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted">বিকাশের কনফার্মেশন মেসেজে “TrxID” লেখার পরের অংশটুকু।</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pay-attachment" className="mb-2 block text-sm font-semibold text-secondary">
                    পেমেন্টের রসিদ / স্ক্রিনশট{' '}
                    {data.attachment_required ? <span className="text-rose-500">*</span> : <span className="text-xs font-normal text-muted">(ঐচ্ছিক)</span>}
                  </label>
                  <input
                    ref={fileRef}
                    id="pay-attachment"
                    type="file"
                    accept={ATTACHMENT_ACCEPT}
                    className="sr-only"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${errors.attachment ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'}`}>
                      <FileText className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-secondary">{file.name}</p>
                        <p className="text-xs text-muted">{toBn((file.size / 1024).toFixed(0))} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onFile(null);
                          if (fileRef.current) fileRef.current.value = '';
                        }}
                        className="rounded-full p-1.5 text-muted hover:bg-white hover:text-rose-600"
                        aria-label="রসিদ সরান"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="pay-attachment"
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm font-medium transition ${
                        errors.attachment ? 'border-rose-300 bg-rose-50/50 text-rose-700' : 'border-slate-200 text-body hover:border-primary hover:text-primary'
                      }`}
                    >
                      <Paperclip className="h-4 w-4" /> ছবি বা PDF বেছে নিন (২ MB পর্যন্ত)
                    </label>
                  )}
                  {errors.attachment && <p className="mt-1.5 text-[13px] text-rose-600">{errors.attachment}</p>}
                </div>
              </div>

              {formError && (
                <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary mt-7 w-full disabled:cursor-wait disabled:opacity-70">
                {submitting ? (
                  <>
                    জমা হচ্ছে… <LoaderCircle className="h-5 w-5 animate-spin" />
                  </>
                ) : (
                  <>
                    পেমেন্ট জমা দিন <Send className="h-5 w-5" />
                  </>
                )}
              </button>

              {sub?.status === 'trialing' && (
                <div className="mt-5 border-t border-slate-100 pt-5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFinish('skipped');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-sm font-semibold text-muted underline-offset-4 hover:text-primary hover:underline"
                  >
                    এখন না, পরে পেমেন্ট করব
                  </button>
                  <p className="mt-1 text-xs text-muted">ট্রায়াল চলবে; পরে স্কুল প্যানেল থেকে পেমেন্ট করা যাবে।</p>
                </div>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
