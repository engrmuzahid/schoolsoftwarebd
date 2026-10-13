/**
 * প্রাইসিং-এর চারটা সেকশন একসাথে — যেকোনো পেজে বসানো যায়:
 *   <PricingSections />                               → সব (প্ল্যান, অফার, তুলনা, অ্যাড-অন)
 *   <PricingSections only={['plans', 'addons']} />    → বেছে বেছে
 *
 * ডাটা: pricingService.get() → GET school/pricing (৫ মিনিট cache, একই রিকোয়েস্টে একবারই কল)
 * API না পেলে: build-এর সময় খালি ডাটা (প্ল্যানের জায়গায় "যোগাযোগ করুন"), চালু সাইটে error.tsx
 *
 * ⚠️ শুধু Server Component-এ বসানো যায় (যে পেজের উপরে "use client" নেই)।
 */
import 'server-only';
import AddonsSection from './AddonsSection';
import AnnualOfferBanner from './AnnualOfferBanner';
import PlanComparison from './PlanComparison';
import PlanPricingSection from './PlanPricingSection';
import { buildSafe } from '@/lib/api/client';
import { EMPTY_PRICING, pricingService } from '@/services/pricing.service';

type Section = 'plans' | 'offer' | 'comparison' | 'addons';

export default async function PricingSections({ only }: { only?: Section[] }) {
  const { settings, plans, comparison, addons } = await buildSafe(pricingService.get(), EMPTY_PRICING);
  const show = (s: Section) => !only || only.includes(s);
  const hasComparison = show('comparison') && plans.length > 0 && comparison.length > 0;

  return (
    <>
      {show('plans') && <PlanPricingSection plans={plans} settings={settings} showCompareLink={hasComparison} />}
      {show('offer') && <AnnualOfferBanner freeMonths={settings.freeMonths} paidMonths={settings.paidMonths} />}
      {show('comparison') && <PlanComparison plans={plans} rows={comparison} />}
      {show('addons') && <AddonsSection addons={addons} currencySymbol={settings.currencySymbol} />}
    </>
  );
}
