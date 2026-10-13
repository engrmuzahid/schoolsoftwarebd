/**
 * /register — স্কুল রেজিস্ট্রেশন
 *   /register?plan=standard&cycle=yearly#register   ← প্রাইসিং কার্ডের "শুরু করুন"
 *   /register                                        ← সরাসরি ("জনপ্রিয়" প্ল্যান আগে থেকে বাছাই)
 *
 * পেজটা static (ISR); URL-এর প্ল্যান ব্রাউজারে পড়া হয় (PlanPicker), তাই dynamic='error'-এও চলে।
 * রেজিস্টার → /register/payment?token=…
 */
import type { Metadata } from 'next';
import { ArrowDown, Gift, Globe, Headset } from 'lucide-react';
import RegistrationSection from '@/components/registration/RegistrationSection';
import PageHero from '@/components/ui/PageHero';
import { APP_NAME } from '@/config/env';
import { safe } from '@/lib/api/client';
import { toBn } from '@/lib/utils/format';
import { pricingService } from '@/services/pricing.service';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'স্কুল রেজিস্ট্রেশন',
  description: `${APP_NAME}-এ আপনার স্কুল রেজিস্টার করুন — প্ল্যান বেছে নিন, ফ্রি ট্রায়াল সাথে সাথে চালু।`,
  alternates: { canonical: '/register' },
};

export default async function RegisterPage() {
  const pricing = await safe(pricingService.get(), null);
  const trialDays = pricing?.settings.trialDays ?? 0;

  const perks = [
    trialDays > 0 ? { icon: Gift, text: `${toBn(trialDays)} দিন ফ্রি ট্রায়াল` } : null,
    { icon: Globe, text: 'ফ্রি সাবডোমেইন' },
    { icon: Headset, text: 'বাংলায় সাপোর্ট' },
  ].filter(Boolean) as { icon: typeof Gift; text: string }[];

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: 'রেজিস্ট্রেশন' }]}
        title="আপনার স্কুলকে"
        highlight="ডিজিটাল করুন"
        description="প্ল্যান বেছে নিন, স্কুলের তথ্য দিন — কয়েক মিনিটেই আপনার স্কুলের সফটওয়্যার ও ওয়েবসাইট তৈরি।"
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#register" className="btn btn-primary">
            রেজিস্ট্রেশন শুরু করুন <ArrowDown className="h-5 w-5" />
          </a>
          {perks.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300"
            >
              <Icon className="h-4 w-4 text-pink-400" /> {text}
            </span>
          ))}
        </div>
      </PageHero>

      <RegistrationSection />
    </main>
  );
}
