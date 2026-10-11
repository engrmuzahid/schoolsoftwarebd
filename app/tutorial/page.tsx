import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ChevronRight, CircleHelp, Clapperboard, Headset, PlayCircle, RotateCcw } from 'lucide-react';
import TutorialPlayer from '@/app/components/frontend/tutorial/TutorialPlayer';
import { APP_NAME, SITE_URL } from '@/app/lib/env';
import { getFeatures } from '@/app/lib/features';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ভিডিও টিউটোরিয়াল',
  description: `${APP_NAME} কীভাবে ব্যবহার করবেন — ভর্তি, হাজিরা, ফি, রেজাল্টসহ সব কাজের ধাপে ধাপে ভিডিও গাইড।`,
};

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
const toBn = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export default async function TutorialPage() {
  const result = await getFeatures('tutorial');
  const items = result?.items ?? [];

  console.log("resulr tutorial - ",result)
  
  const jsonLd = items.length
    ? {
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
      }
    : null;

  return (
    <main>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-secondary pb-20 lg:pb-24">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[160px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-rose-500/20 blur-[160px]" />
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-x relative z-10 pt-44 text-center lg:pt-48">
          <div data-reveal>
            <nav
              aria-label="breadcrumb"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-slate-300"
            >
              <Link href="/" className="hover:text-white">
                মূল পাতা
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-500" />
              <span className="text-primary">টিউটোরিয়াল</span>
            </nav>

            <h1 className="mx-auto mt-6 max-w-3xl text-[34px] font-bold leading-[1.3] text-white sm:text-5xl sm:leading-[1.3]">
              ভিডিও দেখে শিখুন{' '}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-pink-500 bg-clip-text text-transparent">ধাপে ধাপে</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              সফটওয়্যারের প্রতিটি কাজ কীভাবে করবেন — ছোট ছোট ভিডিওতে সহজ বাংলায় দেখানো হয়েছে। যেকোনো সময়, যতবার খুশি দেখুন।
            </p>
          </div>

          {items.length > 0 && (
            <div data-reveal style={delay(120)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href="#tutorials" className="btn btn-primary">
                <PlayCircle className="h-5 w-5" /> ভিডিও দেখা শুরু করুন
              </a>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300">
                <Clapperboard className="h-4 w-4 text-pink-400" /> {toBn(items.length)}টি টিউটোরিয়াল
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ============================ প্লেয়ার ============================ */}
      <section id="tutorials" className="section dot-pattern">
        <div className="container-x">
          {result === null ? (
            <StateBox
              tone="error"
              icon={<AlertTriangle className="h-8 w-8" />}
              title="টিউটোরিয়াল লোড করা যায়নি"
              text="সার্ভারের সাথে যোগাযোগ করা যায়নি। একটু পরে আবার চেষ্টা করুন।"
              action={
                // সাধারণ <a> — পুরো পেজ রিলোড হয়ে আবার API কল হবে
                <a href="/tutorial" className="btn btn-primary">
                  <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন
                </a>
              }
            />
          ) : items.length === 0 ? (
            <StateBox
              icon={<Clapperboard className="h-8 w-8" />}
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

      {/* ============================ সাহায্য ============================ */}
      <section className="pb-20 lg:pb-24">
        <div className="container-x">
          <div
            data-reveal
            className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:py-14 lg:text-left"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold leading-[1.45] text-white sm:text-[28px]">ভিডিও দেখেও বুঝতে সমস্যা হচ্ছে?</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">
                চিন্তা নেই — আমাদের সাপোর্ট টিম ফোনে বা অনলাইনে ধাপে ধাপে দেখিয়ে দেবে।
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3 lg:mt-0 lg:shrink-0">
              <Link href="/contact-us" className="btn btn-primary">
                <Headset className="h-5 w-5" /> সাপোর্টে যোগাযোগ
              </Link>
              <Link href="/faq" className="btn btn-outline">
                <CircleHelp className="h-5 w-5" /> প্রশ্ন উত্তর
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StateBox({
  icon,
  title,
  text,
  action,
  tone = 'default',
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          tone === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </span>
      <h2 className="mt-5 text-xl font-bold text-secondary">{title}</h2>
      <p className="mt-2 max-w-md text-[15px] leading-7 text-body">{text}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
