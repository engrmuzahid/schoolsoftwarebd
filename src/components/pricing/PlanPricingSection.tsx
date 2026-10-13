/**
 * "Simple, transparent pricing" — প্ল্যানের দামের কার্ড (id="plans")
 * ডাটা: pricingService.get() → plans, settings      লেখা: config/pricing.ts → PLAN_PRICING_HEAD
 * ফিচারের বিস্তারিত তুলনা আলাদা সেকশনে: PlanComparison.tsx (id="comparison")
 */
import Link from 'next/link';
import { ArrowDown, ArrowRight, Info, Tags } from 'lucide-react';
import PlanCards from './PlanCards';
import StateBox from '@/components/ui/StateBox';
import { PLAN_PRICING_HEAD as head } from '@/config/pricing';
import type { Plan, PricingSettings } from '@/types/pricing';

type Props = { plans: Plan[]; settings: PricingSettings; showCompareLink?: boolean };

export default function PlanPricingSection({ plans, settings, showCompareLink = true }: Props) {
  return (
    <section id="plans" className="section dot-pattern scroll-mt-24">
      <div className="container-x">
        <div data-reveal className="section-head">
          <span className="eyebrow">
            <Tags className="h-4 w-4" /> {head.eyebrow}
          </span>
          <h2 className="section-title">{head.title}</h2>
          <p className="section-desc">{head.text}</p>
        </div>

        {plans.length === 0 ? (
          <StateBox
            className="mt-10"
            icon={<Tags />}
            title="প্ল্যানের তথ্য শিগগিরই আসছে"
            text="দাম জানতে আমাদের সাথে যোগাযোগ করুন — আপনার প্রতিষ্ঠানের জন্য সঠিক প্ল্যান বেছে দিতে সাহায্য করব।"
            action={
              <Link href="/contact-us" className="btn btn-primary">
                যোগাযোগ করুন <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div data-reveal className="mt-10">
            <PlanCards plans={plans} freeMonths={settings.freeMonths} currencySymbol={settings.currencySymbol} />
          </div>
        )}

        <div data-reveal className="mt-12 flex flex-col items-center gap-3 text-center">
          {showCompareLink && plans.length > 0 && (
            <a href="#comparison" className="inline-flex items-center gap-2 text-[15px] font-semibold text-primary hover:gap-3">
              সব ফিচারের বিস্তারিত তুলনা দেখুন <ArrowDown className="h-4 w-4" />
            </a>
          )}
          <p className="flex items-center gap-2 text-sm text-muted">
            <Info className="h-4 w-4 shrink-0" /> {head.note}
          </p>
        </div>
      </div>
    </section>
  );
}
