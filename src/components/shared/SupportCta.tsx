/**
 * "সাহায্য লাগবে?" dark CTA বক্স — টিউটোরিয়াল, ব্লগ, FAQ যেকোনো পেজের নিচে
 */
import Link from 'next/link';
import { CircleHelp, Headset } from 'lucide-react';

type Props = {
  title?: string;
  text?: string;
};

export default function SupportCta({
  title = 'ভিডিও দেখেও বুঝতে সমস্যা হচ্ছে?',
  text = 'চিন্তা নেই — আমাদের সাপোর্ট টিম ফোনে বা অনলাইনে ধাপে ধাপে দেখিয়ে দেবে।',
}: Props) {
  return (
    <section className="pb-20 lg:pb-24">
      <div className="container-x">
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:py-14 lg:text-left"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold leading-[1.45] text-white sm:text-[28px]">{title}</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">{text}</p>
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
  );
}
