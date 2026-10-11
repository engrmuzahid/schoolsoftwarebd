"use client";

/**
 * পেজ রেন্ডার করতে গিয়ে error হলে (API বন্ধ, timeout …) এটা দেখায়।
 * Navbar/Footer থেকে যায়, শুধু পেজের অংশটা বদলায়।
 * "আবার চেষ্টা করুন" → reset() পেজটা আবার server থেকে আনে।
 */
import { useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, House, LoaderCircle, RotateCcw } from 'lucide-react';
import StateBox from '@/components/ui/StateBox';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // router.refresh() নতুন করে server থেকে ডাটা আনে, reset() error অবস্থা মুছে দেয়
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <main className="bg-secondary pb-24 pt-44 lg:pt-52">
      <div className="container-x">
        <StateBox
          tone="error"
          icon={<AlertTriangle />}
          title="পেজটি লোড করা যায়নি"
          text="সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।"
          action={
            <>
              <button type="button" onClick={retry} disabled={pending} className="btn btn-primary">
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                আবার চেষ্টা করুন
              </button>
              <Link href="/" className="btn border border-slate-200 text-secondary hover:border-primary hover:text-primary">
                <House className="h-4 w-4" /> মূল পাতা
              </Link>
            </>
          }
        />
        {error.digest && <p className="mt-4 text-center text-xs text-slate-500">Error ID: {error.digest}</p>}
      </div>
    </main>
  );
}
