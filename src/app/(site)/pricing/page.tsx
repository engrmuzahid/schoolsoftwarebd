/**
 * /pricing — প্ল্যান, দাম, তুলনা আর অ্যাড-অন
 * ডাটা: pricingService.get() → GET school/pricing (সুপার অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রিত)
 * পেজটা static (ISR) — প্রতি ৫ মিনিটে API থেকে আপডেট নেয়।
 */
import type { Metadata } from 'next';
import { ArrowDown, Gift } from 'lucide-react';
import PricingSections from '@/components/pricing/PricingSections';
import JsonLd from '@/components/shared/JsonLd';
import SupportCta from '@/components/shared/SupportCta';
import PageHero from '@/components/ui/PageHero';
import { APP_NAME, SITE_URL } from '@/config/env';
import { safe } from '@/lib/api/client';
import { toBn } from '@/lib/utils/format';
import { pricingService } from '@/services/pricing.service';
import type { Plan } from '@/types/pricing';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'প্ল্যান ও মূল্য',
  description: `${APP_NAME}-এর প্ল্যান ও দাম — Basic, Standard ও Customized। মাসিক বা বাৎসরিক, প্রয়োজনমতো অ্যাড-অন।`,
  alternates: { canonical: '/pricing' },
};

/** Google-এর জন্য দামের তথ্য (Product + Offer) */
const offersSchema = (plans: Plan[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: APP_NAME,
  description: 'স্কুল ম্যানেজমেন্ট সফটওয়্যার',
  url: `${SITE_URL}/pricing`,
  offers: plans
    .filter((p) => p.price)
    .map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price!.monthly,
      priceCurrency: 'BDT',
      url: `${SITE_URL}/pricing#plans`,
      availability: 'https://schema.org/InStock',
    })),
});

export default async function PricingPage() {
  // SEO আর hero-র জন্য — সেকশনগুলো নিজেরাও একই ডাটা নেয় (React cache, API কল একবারই)
  const pricing = await safe(pricingService.get(), null);
  const plans = pricing?.plans ?? [];
  const trialDays = pricing?.settings.trialDays ?? 0;

  return (
    <main>
      {plans.some((p) => p.price) && <JsonLd data={offersSchema(plans)} />}

      <PageHero
        breadcrumb={[{ label: 'প্ল্যান ও মূল্য' }]}
        title="আপনার স্কুলের জন্য"
        highlight="সঠিক প্ল্যান"
        description="ছোট-বড় সব প্রতিষ্ঠানের জন্য সহজ ও স্বচ্ছ দাম। যা দরকার শুধু তা-ই নিন, প্রতিষ্ঠান বড় হলে যেকোনো সময় প্ল্যান বদলান।"
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#plans" className="btn btn-primary">
            প্ল্যান দেখুন <ArrowDown className="h-5 w-5" />
          </a>
          {trialDays > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300">
              <Gift className="h-4 w-4 text-pink-400" /> {toBn(trialDays)} দিন ফ্রি ট্রায়াল
            </span>
          )}
        </div>
      </PageHero>

      <PricingSections />

      <SupportCta
        title="কোন প্ল্যান নেবেন, বুঝতে পারছেন না?"
        text="আপনার প্রতিষ্ঠানের শিক্ষার্থী সংখ্যা আর প্রয়োজন জানালে আমাদের টিম সঠিক প্ল্যান বেছে দিতে সাহায্য করবে।"
      />
    </main>
  );
}
