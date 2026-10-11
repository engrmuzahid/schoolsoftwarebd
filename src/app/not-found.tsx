/**
 * ভুল URL বা notFound() — সাইট-জুড়ে 404 পেজ
 * (route group-এর বাইরে, তাই Navbar/Footer এখানে নিজে বসানো)
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Compass, Home, PhoneCall, Search, FileQuestion, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = { 
  title: 'পেজটি পাওয়া যায়নি | 404', 
  robots: { index: false } 
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[85vh] overflow-hidden bg-secondary py-16 lg:py-24">
        {/* Background Glows (Original Colors Preserved) */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[160px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-rose-500/20 blur-[160px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[180px]" />

        <div className="container-x relative z-10 mx-auto max-w-5xl px-4 pt-16 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Content Column */}
            <div className="text-center lg:col-span-7 lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>ত্রুটি ৪০৪</span>
              </div>

              {/* Big Gradient 404 & Heading */}
              <h1 className="mt-4 text-7xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="bg-gradient-to-r from-primary via-violet-400 to-pink-500 bg-clip-text text-transparent">
                  ৪০৪
                </span>
              </h1>

              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                আহা! পেজটি খুঁজে পাওয়া যাচ্ছে না
              </h2>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                আপনি যে লিঙ্কটি খুঁজছেন তা হয়তো পরিবর্তিত হয়েছে, মুছে ফেলা হয়েছে অথবা ভুল ইউআরএল (URL) টাইপ করা হয়েছে।
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link href="/" className="btn btn-primary inline-flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" /> 
                  <span>মূল পাতায় ফিরুন</span>
                </Link>

                <Link href="/contact-us" className="btn btn-outline inline-flex items-center gap-2">
                  <Compass className="h-5 w-5" /> 
                  <span>যোগাযোগ করুন</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Interactive Illustration */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
                
                {/* Outer Rotating/Pulse Rings */}
                <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/30" />
                <div className="absolute inset-6 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-3xl" />
                <div className="absolute inset-16 rounded-full border border-rose-500/20 bg-rose-500/5" />

                {/* Center Floating Icon Card */}
                <div className="relative z-10 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-secondary/80 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-105">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-500 text-white shadow-lg shadow-primary/30">
                    <Compass className="h-10 w-10 animate-bounce" />
                  </div>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    হারিয়ে গেছেন?
                  </span>
                  <span className="mt-1 text-sm text-slate-300">
                    দিকনির্দেশনা পেতে নিচে দেখুন
                  </span>
                </div>

                {/* Floating Orbit Dots */}
                <div className="absolute top-4 left-10 h-3 w-3 rounded-full bg-pink-500 animate-ping" />
                <div className="absolute bottom-8 right-8 h-4 w-4 rounded-full bg-primary/80 blur-[1px]" />
                <div className="absolute top-1/2 -right-2 h-2.5 w-2.5 rounded-full bg-violet-400" />
              </div>
            </div>

          </div>

          {/* Quick Helpful Navigation Links */}
          <div className="mt-16 border-t border-white/10 pt-10 lg:mt-24">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-400 lg:text-left">
              অথবা এই লিংকগুলোতে চেষ্টা করে দেখতে পারেন:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/"
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-primary">হোম পেজ</h3>
                  <p className="text-xs text-slate-400">আমাদের মূল ওয়েবসাইট ব্রাউজ করুন</p>
                </div>
              </Link>

              <Link 
                href="/about-us"
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400 transition-colors group-hover:bg-violet-500 group-hover:text-white">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-violet-400">আমাদের সম্পর্কে</h3>
                  <p className="text-xs text-slate-400">আমাদের লক্ষ্য ও উদ্দেশ্য জানুন</p>
                </div>
              </Link>

              <Link 
                href="/contact-us"
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:border-pink-500/40 hover:bg-white/[0.06] sm:col-span-2 lg:col-span-1"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 transition-colors group-hover:bg-pink-500 group-hover:text-white">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-pink-400">সাপোর্ট / যোগাযোগ</h3>
                  <p className="text-xs text-slate-400">সরাসরি আমাদের টিমের সাথে কথা বলুন</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}