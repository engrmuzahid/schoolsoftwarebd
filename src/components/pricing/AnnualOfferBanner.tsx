/**
 * "Go Annual. Get More." — বাৎসরিক প্ল্যানের অফার ব্যানার
 * লেখা: config/pricing.ts → ANNUAL_OFFER   কয় মাস ফ্রি: API (সুপার অ্যাডমিন সেটিংস)
 * ফ্রি মাস ০ হলে ব্যানারটাই দেখায় না।
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Gift } from 'lucide-react';
import { ANNUAL_OFFER } from '@/config/pricing';

const fill = (text: string, freeMonths: number, paidMonths: number) =>
  text.replace(/\{months\}/g, String(freeMonths)).replace(/\{paid\}/g, String(paidMonths));

type Props = { freeMonths: number; paidMonths: number };

export default function AnnualOfferBanner({ freeMonths, paidMonths }: Props) {
  if (freeMonths <= 0) return null;

  const o = {
    ...ANNUAL_OFFER,
    text: fill(ANNUAL_OFFER.text, freeMonths, paidMonths),
    offerTitle: fill(ANNUAL_OFFER.offerTitle, freeMonths, paidMonths),
    offerText: fill(ANNUAL_OFFER.offerText, freeMonths, paidMonths),
  };

  return (
    <section className="py-10 lg:py-14">
      <div className="container-x">
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-10 sm:px-10 lg:px-14 lg:py-14"
        >
          {/* আলো ও নকশা */}
          <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-primary/45 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-pink-500/30 blur-[110px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_right,black_10%,transparent_65%)]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            {/* বাঁ পাশ */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-sm font-semibold text-white">
                <CalendarCheck className="h-4 w-4 text-pink-300" /> {o.eyebrow}
              </span>
              <h2 className="mt-4 text-[28px] font-bold leading-[1.3] text-white md:text-4xl">
                {o.title}{' '}
                <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                  {o.highlight}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300 lg:mx-0">{o.text}</p>
            </div>

            {/* ডান পাশ: অফার কার্ড */}
            <div
              data-reveal
              style={{ '--reveal-delay': '150ms' } as CSSProperties}
              className="relative rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md sm:p-7"
            >
              <span className="absolute -top-3 right-6 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-950 shadow-lg">
                Bonus
              </span>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-pink-500 text-white shadow-[0_10px_30px_-8px_rgba(236,72,153,0.7)]">
                  <Gift className="h-6 w-6" />
                </span>
                <div>
                  <strong className="block text-xl font-bold leading-snug text-white">{o.offerTitle}</strong>
                  <span className="mt-2 block text-[15px] leading-7 text-slate-300">{o.offerText}</span>
                </div>
              </div>
              <Link
                href={o.cta.href}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-secondary hover:bg-primary hover:text-white"
              >
                {o.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
