/**
 * /tutorial — ভিডিও টিউটোরিয়াল
 * ডাটা: featureService.list('tutorial')  →  GET school/features?type=tutorial
 * পেজটা static (ISR) — প্রতি ৬০ সেকেন্ডে API থেকে আপডেট নেয়।
 * API কাজ না করলে → (site)/error.tsx;  ISR আপডেটের সময় API বন্ধ থাকলে আগের পেজটাই থাকে।
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clapperboard, PlayCircle } from 'lucide-react';
import TutorialPlayer from '@/components/tutorial/TutorialPlayer';
import PageHero from '@/components/ui/PageHero';
import StateBox from '@/components/ui/StateBox';
import JsonLd from '@/components/shared/JsonLd';
import SupportCta from '@/components/shared/SupportCta';
import { APP_NAME, SITE_URL } from '@/config/env';
import { buildSafe } from '@/lib/api/client';
import { toBn } from '@/lib/utils/format';
import { featureService } from '@/services/feature.service';
import type { FeatureItem } from '@/types/feature';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ভিডিও টিউটোরিয়াল',
  description: `${APP_NAME} কীভাবে ব্যবহার করবেন — ভর্তি, হাজিরা, ফি, রেজাল্টসহ সব কাজের ধাপে ধাপে ভিডিও গাইড।`,
  alternates: { canonical: '/tutorial' },
};

/** Google-এর জন্য ভিডিওর তথ্য (VideoObject) */
const videoListSchema = (items: FeatureItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${APP_NAME} ভিডিও টিউটোরিয়াল`,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}/tutorial#${item.slug}`,
    item: {
      '@type': 'VideoObject',
      name: item.title,
      description: item.description || item.title,
      thumbnailUrl: item.image_url ? [item.image_url] : undefined,
      uploadDate: item.updated_at,
      embedUrl: item.video?.embed_url || undefined,
      contentUrl: item.video?.watch_url || undefined,
    },
  })),
});

export default async function TutorialPage() {
  const { items } = await buildSafe(featureService.list('tutorial'), { items: [], counts: {} });

  return (
    <main>
      {items.length > 0 && <JsonLd data={videoListSchema(items)} />}

      <PageHero
        breadcrumb={[{ label: 'টিউটোরিয়াল' }]}
        title="ভিডিও দেখে শিখুন"
        highlight="ধাপে ধাপে"
        description="সফটওয়্যারের প্রতিটি কাজ কীভাবে করবেন — ছোট ছোট ভিডিওতে সহজ বাংলায় দেখানো হয়েছে। যেকোনো সময়, যতবার খুশি দেখুন।"
      >
        {items.length > 0 && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#tutorials" className="btn btn-primary">
              <PlayCircle className="h-5 w-5" /> ভিডিও দেখা শুরু করুন
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300">
              <Clapperboard className="h-4 w-4 text-pink-400" /> {toBn(items.length)}টি টিউটোরিয়াল
            </span>
          </div>
        )}
      </PageHero>

      <section id="tutorials" className="section dot-pattern">
        <div className="container-x">
          {items.length === 0 ? (
            <StateBox
              icon={<Clapperboard />}
              title="শিগগিরই টিউটোরিয়াল আসছে"
              text="আমরা নতুন ভিডিও তৈরি করছি। এর মধ্যে কোনো সাহায্য লাগলে আমাদের সাথে যোগাযোগ করুন।"
              action={
                <Link href="/contact-us" className="btn btn-primary">
                  যোগাযোগ করুন <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <div data-reveal>
              <TutorialPlayer items={items} />
            </div>
          )}
        </div>
      </section>

      <SupportCta />
    </main>
  );
}
