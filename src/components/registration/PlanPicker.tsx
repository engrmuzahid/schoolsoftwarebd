"use client";

/**
 * রেজিস্ট্রেশন ফর্মের উপরের প্ল্যান বাছাই — মাসিক/বাৎসরিক + প্ল্যান কার্ড (radio)
 *
 * URL থেকে আগে থেকে বাছাই:  /register?plan=standard&cycle=yearly#register
 *   (প্রাইসিং কার্ডের "শুরু করুন" বাটন এই লিংক বানায়)
 * URL-এ না থাকলে "জনপ্রিয়" (featured) প্ল্যান, বাৎসরিক।
 */
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Gift, Sparkles, Users } from 'lucide-react';
import { toBn } from '@/lib/utils/format';
import type { Plan } from '@/types/pricing';
import type { BillingCycle } from '@/types/school';

type Props = {
  plans: Plan[];
  plan: string;
  cycle: BillingCycle;
  onChange: (plan: string, cycle: BillingCycle) => void;
  trialDays: number;
  freeMonths: number;
  currencySymbol: string;
};

const money = (n: number) => toBn(n.toLocaleString('en-US', { maximumFractionDigits: 2 }));

/** রেজিস্ট্রেশনে ডিফল্ট প্ল্যান — featured, না থাকলে প্রথমটা */
export const defaultPlanKey = (plans: Plan[]) => (plans.find((p) => p.featured) ?? plans[0])?.key ?? '';

/**
 * URL-এর ?plan= &cycle= পড়ে একবার বসিয়ে দেয়।
 * useSearchParams static পেজে Suspense-এর ভেতরে থাকতে হয় — তাই আলাদা ছোট component,
 * যাতে পুরো ফর্ম অপেক্ষায় না থাকে।
 */
function UrlSync({ plans, onPick }: { plans: Plan[]; onPick: (plan: string | null, cycle: BillingCycle | null) => void }) {
  const sp = useSearchParams();
  const planParam = sp.get('plan') ?? sp.get('plan_id');
  const cycleParam = sp.get('cycle') ?? sp.get('billing_cycle');

  useEffect(() => {
    const plan = plans.some((p) => p.key === planParam) ? planParam : null;
    const cycle = cycleParam === 'monthly' || cycleParam === 'yearly' ? cycleParam : null;
    if (plan || cycle) onPick(plan, cycle);
    // শুধু URL বদলালে
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planParam, cycleParam]);

  return null;
}

export default function PlanPicker({ plans, plan, cycle, onChange, trialDays, freeMonths, currencySymbol }: Props) {
  const selected = plans.find((p) => p.key === plan) ?? null;
  const priceOf = (p: Plan) => (p.price ? (cycle === 'yearly' ? p.price.yearly : p.price.monthly) : null);

  const cycleBtn = (c: BillingCycle, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={cycle === c}
      onClick={() => onChange(plan, c)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        cycle === c ? 'bg-secondary text-white shadow' : 'text-body hover:text-secondary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div id="reg-plan-area" className="mb-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <Suspense fallback={null}>
        <UrlSync plans={plans} onPick={(p, c) => onChange(p ?? plan, c ?? cycle)} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-secondary">
          প্ল্যান বাছাই করুন <span className="font-normal text-muted">(পরে বদলানো যাবে)</span>
        </p>
        <div role="radiogroup" aria-label="বিলিং" className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {cycleBtn('monthly', 'মাসিক')}
          {cycleBtn('yearly', 'বাৎসরিক')}
        </div>
      </div>

      <div role="radiogroup" aria-label="প্ল্যান" className={`mt-4 grid gap-3 ${plans.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {plans.map((p) => {
          const active = p.key === plan;
          const price = priceOf(p);
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p.key, cycle)}
              className={`relative rounded-xl border-2 bg-white p-4 text-left transition ${
                active
                  ? 'border-primary shadow-[0_10px_30px_-14px_rgba(99,102,241,0.7)]'
                  : 'border-slate-200 hover:border-primary/40'
              }`}
            >
              <span
                className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  active ? 'border-primary bg-primary text-white' : 'border-slate-300'
                }`}
              >
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>

              <span className="flex items-center gap-2 pr-7">
                <span className="text-base font-bold text-secondary">{p.name}</span>
                {p.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> {p.badge}
                  </span>
                )}
              </span>

              <span className="mt-2 block">
                {price !== null ? (
                  <>
                    <span className="text-xl font-bold text-secondary">
                      {currencySymbol}
                      {money(price)}
                    </span>
                    <span className="text-sm text-muted"> / {cycle === 'yearly' ? 'বছর' : 'মাস'}</span>
                  </>
                ) : (
                  <span className="text-base font-semibold text-secondary">আলোচনা সাপেক্ষে</span>
                )}
              </span>

              {p.price?.maxStudents ? (
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted">
                  <Users className="h-3.5 w-3.5" /> {toBn(p.price.maxStudents)} শিক্ষার্থী পর্যন্ত
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ট্রায়ালের কথা — এখন কোনো টাকা লাগবে না */}
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[13px] leading-6 text-emerald-800 ring-1 ring-emerald-200">
        <Gift className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {trialDays > 0 ? (
            <>
              <b>{toBn(trialDays)} দিন ফ্রি ট্রায়াল</b> — এখন কোনো টাকা লাগবে না।{' '}
            </>
          ) : null}
          {selected?.price ? (
            <>
              ট্রায়াল শেষে বিল {currencySymbol}
              {money(cycle === 'yearly' ? selected.price.yearly : selected.price.monthly)} / {cycle === 'yearly' ? 'বছর' : 'মাস'}
              {cycle === 'yearly' && freeMonths > 0 ? ` (${toBn(freeMonths)} মাস ফ্রি)` : ''}। চাইলে এখনই পেমেন্ট করে রাখতে পারবেন।
            </>
          ) : (
            'পেমেন্ট এখন বা ট্রায়াল শেষে স্কুল প্যানেল থেকে করা যাবে।'
          )}
        </span>
      </p>
    </div>
  );
}
