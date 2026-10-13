/**
 * /register/payment?token=… — রেজিস্ট্রেশনের পরের পেমেন্ট (বিকাশ)
 *
 * পেজটা static; token ব্রাউজারে পড়ে Server Action দিয়ে বিল আনে (PaymentFlow) —
 * তাই dynamic='error'-এও চলে, আর token কখনো HTML/cache-এ বসে না।
 * সার্চ ইঞ্জিনে দেখানোর পেজ না — noindex।
 */
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PaymentFlow from '@/components/payment/PaymentFlow';
import PageHero from '@/components/ui/PageHero';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'পেমেন্ট',
  robots: { index: false, follow: false },
};

export default function RegistrationPaymentPage() {
  return (
    <main>
      <PageHero
        breadcrumb={[{ label: 'রেজিস্ট্রেশন', href: '/register' }, { label: 'পেমেন্ট' }]}
        title="সাবস্ক্রিপশন"
        highlight="পেমেন্ট"
        description="বিকাশে টাকা পাঠিয়ে Transaction ID দিন — অথবা এখন না করে ফ্রি ট্রায়াল উপভোগ করুন, পরে পেমেন্ট করুন।"
      />

      <section className="section dot-pattern">
        <div className="container-x">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
            <PaymentFlow />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
