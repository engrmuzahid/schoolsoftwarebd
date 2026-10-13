/**
 * "Compare our plans" — প্ল্যান তুলনার টেবিল (id="comparison")
 * ডাটা: pricingService.get() → plans, comparison  (প্যানেলের মডিউল × প্ল্যান ম্যাট্রিক্স থেকে)
 * সারি না থাকলে সেকশনটাই দেখায় না।
 * মোবাইলে টেবিল পাশে স্ক্রল হয়, ফিচারের নামের কলাম জায়গায় আটকে থাকে।
 * দাম আর "শুরু করুন" বাটন আলাদা সেকশনে: PlanPricingSection.tsx
 */
import { Check, ChevronsLeftRight, Layers, Minus, Sparkles } from 'lucide-react';
import { COMPARISON_HEAD as head } from '@/config/pricing';
import type { ComparisonCell, ComparisonRow, Plan } from '@/types/pricing';

/** ঘরের ভেতরের মান */
function Cell({ cell: { value, access } }: { cell: ComparisonCell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-4 w-4" strokeWidth={3} />
        <span className="sr-only">আছে</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center text-slate-300">
        <Minus className="h-4 w-4" />
        <span className="sr-only">নেই</span>
      </span>
    );
  }
  // Add-on / On request / Priority → আলাদা ব্যাজ
  const v = value.toLowerCase();
  if (access === 'addon' || access === 'on_request' || v === 'add-on') {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        {value}
      </span>
    );
  }
  if (v === 'priority') {
    return (
      <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
        {value}
      </span>
    );
  }
  // Basic / Full / Full + Custom
  const strong = v !== 'basic';
  return <span className={`text-sm font-semibold ${strong ? 'text-primary' : 'text-body'}`}>{value}</span>;
}

type Props = { plans: Plan[]; rows: ComparisonRow[] };

export default function PlanComparison({ plans, rows }: Props) {
  if (plans.length === 0 || rows.length === 0) return null;

  return (
    <section id="comparison" className="section scroll-mt-24 bg-white">
      <div className="container-x">
        <div data-reveal className="section-head">
          <span className="eyebrow">
            <Layers className="h-4 w-4" /> {head.eyebrow}
          </span>
          <h2 className="section-title">{head.title}</h2>
          <p className="section-desc">{head.text}</p>
        </div>

        <div data-reveal className="mt-12">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-muted md:hidden">
            <ChevronsLeftRight className="h-4 w-4" /> টেবিলটি পাশে স্ক্রল করুন
          </p>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_-35px_rgba(15,23,42,0.3)]">
            {/* relative: sr-only (absolute) লেখাগুলো যেন scroller-এর বাইরে বেরিয়ে পেজকে পাশে স্ক্রল না করায় */}
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <caption className="sr-only">{head.title}</caption>

                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 w-[34%] border-b border-slate-200 bg-white px-5 py-6 text-sm font-semibold uppercase tracking-wide text-muted sm:px-7 max-md:shadow-[6px_0_10px_-8px_rgba(15,23,42,0.25)]"
                    >
                      Features
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.key}
                        scope="col"
                        className={`border-b px-4 py-6 text-center align-bottom ${
                          plan.featured ? 'border-primary/20 bg-primary/[0.06]' : 'border-slate-200'
                        }`}
                      >
                        {plan.badge && (
                          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(99,102,241,0.8)]">
                            <Sparkles className="h-3 w-3" /> {plan.badge}
                          </span>
                        )}
                        <span className={`block text-lg font-bold ${plan.featured ? 'text-primary' : 'text-secondary'}`}>
                          {plan.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="group">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b border-slate-100 bg-white px-5 py-4 text-[15px] font-medium text-secondary transition-colors group-hover:bg-slate-50 sm:px-7 max-md:shadow-[6px_0_10px_-8px_rgba(15,23,42,0.25)]"
                      >
                        {row.feature}
                      </th>
                      {plans.map((plan) => (
                        <td
                          key={plan.key}
                          className={`border-b px-4 py-4 text-center transition-colors ${
                            plan.featured
                              ? 'border-primary/10 bg-primary/[0.04] group-hover:bg-primary/[0.08]'
                              : 'border-slate-100 group-hover:bg-slate-50'
                          }`}
                        >
                          <Cell cell={row.values[plan.key] ?? { value: false, access: null }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
