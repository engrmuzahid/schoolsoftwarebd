/**
 * "Extend your school software" — অ্যাড-অন কার্ড (id="addons")
 * ডাটা: pricingService.get() → addons (প্যানেলের Add-ons পেজ থেকে)   লেখা: config/pricing.ts → ADDONS_HEAD
 * অ্যাড-অন না থাকলে সেকশনটাই দেখায় না।
 */
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import { ArrowRight, Info, PackagePlus, type LucideIcon } from 'lucide-react';
import { ADDONS_HEAD as head, ADDON_TONES, type AddonTone } from '@/config/pricing';
import { toBn } from '@/lib/utils/format';
import type { Addon } from '@/types/pricing';

/**
 * প্যানেল থেকে আসা আইকনের নাম (যেমন CreditCard) → lucide কম্পোনেন্ট।
 * Server Component, তাই সব আইকন import করলেও ব্রাউজারে কিছু যায় না।
 * নাম না মিললে PackagePlus।
 */
function iconFor(name: string | null): LucideIcon {
  const C = name ? (Lucide as unknown as Record<string, unknown>)[name] : null;
  return C && typeof C === 'object' && 'render' in C ? (C as unknown as LucideIcon) : PackagePlus;
}

/* Tailwind-কে পুরো class নাম লিখে দিতে হয় (জোড়া লাগানো নাম চিনতে পারে না) */
const TONES: Record<AddonTone, string> = {
  sky: 'bg-sky-500/10 text-sky-600 group-hover:bg-sky-500',
  emerald: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500',
  violet: 'bg-violet-500/10 text-violet-600 group-hover:bg-violet-500',
  amber: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-500',
  rose: 'bg-rose-500/10 text-rose-600 group-hover:bg-rose-500',
  indigo: 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500',
  green: 'bg-green-500/10 text-green-600 group-hover:bg-green-500',
  primary: 'bg-primary/10 text-primary group-hover:bg-primary',
};

const TYPE_BADGE: Record<Addon['type'], string> = {
  addon: 'border-primary/20 bg-primary/5 text-primary',
  integration: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  usage: 'border-amber-200 bg-amber-50 text-amber-700',
  custom: 'border-violet-200 bg-violet-50 text-violet-700',
};

/** 12000 → ১২,০০০ ; 0.35 → ০.৩৫ */
const money = (n: number) => toBn(n.toLocaleString('en-US', { maximumFractionDigits: 2 }));

function Price({ price, dark, cur }: { price: Addon['price']; dark?: boolean; cur: string }) {
  if (price.amount === null) {
    return <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-secondary'}`}>আলোচনা সাপেক্ষে</span>;
  }
  return (
    <div className="leading-tight">
      <div className="flex items-baseline gap-1.5">
        {price.from && <span className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-muted'}`}>শুরু</span>}
        <span className={`text-[26px] font-bold ${dark ? 'text-white' : 'text-secondary'}`}>{cur}{money(price.amount)}</span>
      </div>
      {price.unit && <span className={`mt-1 block text-[13px] ${dark ? 'text-slate-400' : 'text-muted'}`}>{price.unit}</span>}
    </div>
  );
}

function AddonCard({ addon, tone, cur }: { addon: Addon; tone: AddonTone; cur: string }) {
  const Icon = iconFor(addon.icon);
  const dark = addon.highlight;

  return (
    <article
      data-reveal
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 hover:-translate-y-1 ${
        dark
          ? 'border-transparent bg-secondary text-white shadow-[0_24px_50px_-20px_rgba(15,23,42,0.6)]'
          : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-[0_24px_50px_-24px_rgba(99,102,241,0.35)]'
      }`}
    >
      {dark && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-pink-500/25 blur-3xl" />
        </>
      )}

      <div className="relative flex flex-1 flex-col">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 group-hover:text-white ${
            dark ? 'bg-white/10 text-white ring-1 ring-white/20' : TONES[tone]
          }`}
        >
          <Icon className="h-6 w-6" />
        </span>

        <h3 className={`mt-5 text-lg font-semibold leading-7 ${dark ? 'text-white' : 'text-secondary'}`}>{addon.title}</h3>
        <p className={`mt-2 flex-1 text-[15px] leading-7 ${dark ? 'text-slate-300' : 'text-body'}`}>{addon.description}</p>

        <div className={`mt-6 border-t pt-5 ${dark ? 'border-white/10' : 'border-slate-100'}`}>
          <Price price={addon.price} dark={dark} cur={cur} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                dark ? 'border-white/15 bg-white/10 text-white' : (TYPE_BADGE[addon.type] ?? TYPE_BADGE.addon)
              }`}
            >
              {addon.typeLabel}
            </span>
            {dark && (
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-secondary hover:bg-primary hover:text-white"
              >
                কোটেশন নিন <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

type Props = { addons: Addon[]; currencySymbol: string };

export default function AddonsSection({ addons, currencySymbol }: Props) {
  if (addons.length === 0) return null;

  return (
    <section id="addons" className="section scroll-mt-24 dot-pattern">
      <div className="container-x">
        <div data-reveal className="section-head">
          <span className="eyebrow">
            <PackagePlus className="h-4 w-4" /> {head.eyebrow}
          </span>
          <h2 className="section-title">{head.title}</h2>
          <p className="section-desc">{head.text}</p>
        </div>

        <div data-stagger="4" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {addons.map((addon, i) => (
            <AddonCard key={addon.key} addon={addon} tone={ADDON_TONES[i % ADDON_TONES.length]} cur={currencySymbol} />
          ))}
        </div>

        <p data-reveal className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted">
          <Info className="h-4 w-4 shrink-0" /> {head.note}
        </p>
      </div>
    </section>
  );
}
