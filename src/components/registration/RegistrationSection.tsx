/**
 * রেজিস্ট্রেশন ফর্ম + সার্ভার থেকে প্ল্যানের তালিকা — হোম পেজ আর /register দুই জায়গায় এটাই বসান:
 *   <RegistrationSection />
 *
 * প্ল্যান আসে pricingService থেকে (একই রিকোয়েস্টে প্রাইসিং সেকশন থাকলে API কল একবারই)।
 * API না পেলে প্ল্যান বাছাইয়ের অংশ দেখায় না — Laravel তখন "জনপ্রিয়" প্ল্যান দিয়ে ট্রায়াল চালু করে।
 *
 * ⚠️ শুধু Server Component-এ বসানো যায়।
 */
import 'server-only';
import SchoolRegistration from './SchoolRegistration';
import { safe } from '@/lib/api/client';
import { pricingService } from '@/services/pricing.service';

export default async function RegistrationSection() {
  const pricing = await safe(pricingService.get(), null);

  // Custom প্ল্যানে রেজিস্ট্রেশন হয় না (যোগাযোগ), আর দাম ছাড়া প্ল্যানও না
  const plans = (pricing?.plans ?? []).filter((p) => !p.isCustom && p.price);

  return (
    <SchoolRegistration
      plans={plans}
      trialDays={pricing?.settings.trialDays ?? 0}
      freeMonths={pricing?.settings.freeMonths ?? 0}
      currencySymbol={pricing?.settings.currencySymbol ?? '৳'}
    />
  );
}
