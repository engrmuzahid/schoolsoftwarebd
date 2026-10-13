"use client";

/**
 * প্ল্যানের দামের কার্ড + মাসিক/বাৎসরিক টগল
 * দাম আর বাৎসরিক দাম দুটোই API থেকে আসে (বাৎসরিক = মাসিক × paidMonths, Laravel হিসাব করে দেয়)
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, Sparkles, Users } from 'lucide-react';
import { registerHref } from '@/config/pricing';
import type { Plan } from '@/types/pricing';
import { toBn } from '@/lib/utils/format';

type Billing = 'monthly' | 'yearly';

const money = (n: number) => toBn(n.toLocaleString('en-US', { maximumFractionDigits: 2 }));

function BillingToggle({ value, onChange, freeMonths }: { value: Billing; onChange: (b: Billing) => void; freeMonths: number }) {
  const opt = (b: Billing, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={value === b}
      onClick={() => onChange(b)}
      className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
        value === b ? 'bg-secondary text-white shadow-md' : 'text-body hover:text-secondary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div role="radiogroup" aria-label="বিলিং" className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {opt('monthly', 'মাসিক')}
        {opt('yearly', 'বাৎসরিক')}
      </div>
      {freeMonths > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <Sparkles className="h-3.5 w-3.5" /> বাৎসরিকে {toBn(freeMonths)} মাস ফ্রি
        </span>
      )}
    </div>
  );
}

function PriceBlock({ plan, billing, cur }: { plan: Plan; billing: Billing; cur: string }) {
  const dark = plan.featured;

  if (!plan.price) {
    return <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-secondary'}`}>আলোচনা সাপেক্ষে</p>;
  }

  const { monthly, yearly, from, maxStudents } = plan.price;
  const full = monthly * 12;
  const saving = full - yearly;

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        {from && <span className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-muted'}`}>শুরু</span>}
        <span className={`text-[40px] font-bold leading-none tracking-tight ${dark ? 'text-white' : 'text-secondary'}`}>
          {cur}{money(billing === 'monthly' ? monthly : yearly)}
        </span>
        <span className={`text-sm ${dark ? 'text-slate-400' : 'text-muted'}`}>/ {billing === 'monthly' ? 'মাস' : 'বছর'}</span>
      </div>
      <p className={`mt-2 h-5 text-[13px] ${dark ? 'text-slate-400' : 'text-muted'}`}>
        {billing === 'yearly' && saving > 0 ? (
          <>
            <s className="mr-1.5">{cur}{money(full)}</s>
            <span className={dark ? 'font-semibold text-emerald-300' : 'font-semibold text-emerald-600'}>
              {cur}{money(saving)} সাশ্রয়
            </span>
          </>
        ) : billing === 'yearly' ? (
          'বছরে একবার পরিশোধ'
        ) : (
          'মাসে মাসে পরিশোধ'
        )}
      </p>
      {maxStudents !== null && (
        <p
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            dark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-body'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> {toBn(maxStudents)} শিক্ষার্থী পর্যন্ত
        </p>
      )}
    </div>
  );
}

type Props = { plans: Plan[]; freeMonths: number; currencySymbol: string };

export default function PlanCards({ plans, freeMonths, currencySymbol }: Props) {
  const [billing, setBilling] = useState<Billing>('yearly');

  return (
    <>
      <BillingToggle value={billing} onChange={setBilling} freeMonths={freeMonths} />

      <div data-stagger="3" className="mt-12 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
        {plans.map((plan) => {
          const dark = plan.featured;
          return (
            <article
              key={plan.key}
              data-reveal
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-7 sm:p-8 ${
                dark
                  ? 'border-transparent bg-secondary text-white shadow-[0_40px_80px_-30px_rgba(99,102,241,0.55)] lg:-my-4 lg:py-12'
                  : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_50px_-24px_rgba(99,102,241,0.35)]'
              }`}
            >
              {dark && (
                <>
                  <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/45 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
                </>
              )}

              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-secondary'}`}>{plan.name}</h3>
                  {plan.badge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-[0_6px_16px_-6px_rgba(99,102,241,0.9)]">
                      <Sparkles className="h-3.5 w-3.5" /> {plan.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-2 min-h-[48px] text-[15px] leading-6 ${dark ? 'text-slate-300' : 'text-body'}`}>{plan.tagline}</p>

                <div className={`mt-6 border-y py-6 ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                  <PriceBlock plan={plan} billing={billing} cur={currencySymbol} />
                </div>

                <p className={`mt-6 text-sm font-semibold ${dark ? 'text-white' : 'text-secondary'}`}>{plan.highlightsTitle}</p>
                <ul className="mt-4 flex-1 space-y-3">
                  {plan.highlights.map((h) => (
                    <li key={h} className={`flex items-start gap-2.5 text-[15px] leading-6 ${dark ? 'text-slate-200' : 'text-body'}`}>
                      <CircleCheck className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? 'text-emerald-300' : 'text-success'}`} />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.isCustom ? plan.cta.href : registerHref(plan.key, billing)}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold ${
                    dark
                      ? 'bg-primary text-white shadow-[0_0_40px_rgba(99,102,241,0.55)] hover:bg-indigo-500'
                      : 'border border-slate-200 text-secondary hover:border-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {plan.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
