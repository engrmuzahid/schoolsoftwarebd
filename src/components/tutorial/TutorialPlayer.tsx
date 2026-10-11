"use client";

/**
 * টিউটোরিয়াল প্লেয়ার — বাঁয়ে বড় ভিডিও + বিস্তারিত, ডানে প্লেলিস্ট (সার্চ সহ)
 * - ভিডিও শুধু ক্লিক করলে লোড হয় (তার আগে thumbnail) — পেজ দ্রুত খোলে
 * - URL-এ #slug থাকে: /tutorial#how-to-add-student → সরাসরি ওই ভিডিও খোলে, শেয়ার করা যায়
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clapperboard,
  Copy,
  ListVideo,
  Play,
  Search,
  X,
} from 'lucide-react';
import { smoothScrollTo } from '@/components/layout/SmoothScroll';
import type { FeatureItem } from '@/types/feature';
import { formatDate, toBn } from '@/lib/utils/format';


/** YouTube লোগো (lucide-এ brand আইকন নেই) */
const YoutubeIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"
    />
  </svg>
);

const embedSrc = (item: FeatureItem) => {
  const id = item.video?.youtube_id;
  // youtube-nocookie: ভিজিটর play না করা পর্যন্ত YouTube cookie বসায় না
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  const url = item.video?.embed_url;
  return url ? `${url}${url.includes('?') ? '&' : '?'}autoplay=1&rel=0` : null;
};

/** thumbnail — ছবি না থাকলে বা লোড না হলে gradient */
function Thumb({ src, eager = false }: { src: string | null; eager?: boolean }) {
  const [failed, setFailed] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => setFailed(!src), [src]);
  // hydration-এর আগেই লোড ফেল করলে onError ধরা পড়ে না
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary via-violet-600 to-pink-600">
        <Clapperboard className="h-1/4 w-1/4 text-white/40" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src!}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/* ============================ ভিডিও (lite embed) ============================ */
function VideoFrame({ item, playing, onPlay }: { item: FeatureItem; playing: boolean; onPlay: () => void }) {
  const src = embedSrc(item);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary shadow-[0_40px_80px_-30px_rgba(15,23,42,0.6)] ring-1 ring-white/10">
      {playing && src ? (
        <iframe
          key={item.id}
          src={src}
          title={item.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={onPlay}
          disabled={!src}
          aria-label={`ভিডিও চালান: ${item.title}`}
          className="group absolute inset-0 flex h-full w-full items-center justify-center disabled:cursor-default"
        >
          <Thumb key={item.id} src={item.image_url} eager />
          <span className="absolute inset-0 bg-secondary/20 transition group-hover:bg-secondary/35" />

          {src && (
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-2xl transition duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.2s]" />
              <Play className="relative ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}

/* ============================ বিস্তারিত ============================ */
function Details({
  item,
  index,
  total,
  onPrev,
  onNext,
}: {
  item: FeatureItem;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const long = (item.description?.length ?? 0) > 320;

  useEffect(() => {
    setExpanded(false);
  }, [item.id]);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${item.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard বন্ধ থাকলে কিছু করার নেই */
    }
  };

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        {item.badge && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.badge}</span>
        )}
        {total > 1 && (
          <span>
            পর্ব {toBn(index + 1)} / {toBn(total)}
          </span>
        )}
        {formatDate(item.updated_at) && <span>আপডেট: {formatDate(item.updated_at)}</span>}
      </div>

      <h2 className="mt-3 text-2xl font-bold leading-[1.45] text-secondary sm:text-[28px]">{item.title}</h2>

      {item.description && (
        <div className="mt-4">
          <p className={`whitespace-pre-line text-[16px] leading-8 text-body ${long && !expanded ? 'line-clamp-4' : ''}`}>
            {item.description}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              {expanded ? 'কম দেখান' : 'আরও দেখুন'}
            </button>
          )}
        </div>
      )}

      {item.points.length > 0 && (
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-bold text-secondary">এই ভিডিওতে যা আছে</h3>
          <ul className="mt-4 grid gap-3">
            {item.points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-7 text-body">
                <CircleCheck className="mt-1 h-5 w-5 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {item.video?.watch_url && (
          <a
            href={item.video.watch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF0000] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(255,0,0,0.7)] hover:-translate-y-0.5 hover:bg-[#e00000]"
          >
            <YoutubeIcon className="h-5 w-5" /> YouTube-এ দেখুন
          </a>
        )}
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? 'লিংক কপি হয়েছে' : 'লিংক কপি করুন'}
        </button>

        {total > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              aria-label="আগের ভিডিও"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={index === total - 1}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-secondary"
            >
              পরের ভিডিও <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ প্লেলিস্ট ============================ */
function NowPlaying() {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-primary motion-safe:animate-[eq_1s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.18}s`, height: '100%' }}
        />
      ))}
    </span>
  );
}

function Playlist({
  items,
  activeId,
  onSelect,
}: {
  items: FeatureItem[];
  activeId: number;
  onSelect: (id: number) => void;
}) {
  const [q, setQ] = useState('');
  const listRef = useRef<HTMLOListElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => `${i.title} ${i.description ?? ''} ${i.points.join(' ')}`.toLowerCase().includes(s));
  }, [items, q]);

  // active ভিডিও লিস্টে দেখা যায় এমনভাবে রাখি (শুধু লিস্টের ভেতরে স্ক্রল, পুরো পেজ না)
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    if (!list || !el) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - 8, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-secondary">
          <ListVideo className="h-5 w-5 text-primary" /> সব টিউটোরিয়াল
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-muted">
            {toBn(items.length)}টি ভিডিও
          </span>
        </h2>

        {items.length > 4 && (
          <label className="relative mt-4 block">
            <span className="sr-only">টিউটোরিয়াল খুঁজুন</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ভিডিও খুঁজুন..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="সার্চ মুছুন"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        )}
      </div>

      {/* data-lenis-prevent: লিস্টের ভেতরে mouse wheel দিলে Lenis পুরো পেজ স্ক্রল করবে না */}
      <ol ref={listRef} data-lenis-prevent className="max-h-[420px] overflow-y-auto overscroll-contain p-2 lg:max-h-[560px]">
        {filtered.map((item) => {
          const active = item.id === activeId;
          const n = items.indexOf(item) + 1;
          return (
            <li key={item.id} data-id={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? 'true' : undefined}
                className={`group flex w-full items-start gap-3 rounded-2xl p-2.5 text-left transition-colors ${
                  active ? 'bg-primary/[0.08] ring-1 ring-primary/25' : 'hover:bg-slate-50'
                }`}
              >
                <span className="w-5 shrink-0 pt-6 text-center text-xs font-semibold text-muted">
                  {active ? <NowPlaying /> : toBn(n)}
                </span>
                <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  <Thumb src={item.image_url} />
                  <span
                    className={`absolute inset-0 flex items-center justify-center bg-secondary/40 transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Play className="h-6 w-6 fill-white text-white" />
                  </span>
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span
                    className={`line-clamp-2 text-sm font-semibold leading-6 ${
                      active ? 'text-primary' : 'text-secondary group-hover:text-primary'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.badge && <span className="mt-1 block text-xs text-muted">{item.badge}</span>}
                </span>
              </button>
            </li>
          );
        })}
        {!filtered.length && <li className="px-4 py-10 text-center text-sm text-muted">“{q}” লিখে কোনো ভিডিও পাওয়া যায়নি।</li>}
      </ol>
    </div>
  );
}

/* ============================ মূল কম্পোনেন্ট ============================ */
export default function TutorialPlayer({ items }: { items: FeatureItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const index = Math.max(0, items.findIndex((i) => i.id === activeId));
  const active = items[index];
  const single = items.length === 1;

  // #slug দিয়ে এলে সেই ভিডিও (ব্রাউজারের back/forward-এও)
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const found = slug && items.find((i) => i.slug === slug);
      if (found) {
        setActiveId(found.id);
        setPlaying(false);
        window.setTimeout(() => playerRef.current && smoothScrollTo(playerRef.current), 80);
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [items]);

  const select = (id: number, autoplay = true) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setActiveId(id);
    setPlaying(autoplay);
    window.history.replaceState(null, '', `#${item.slug}`);
    // মোবাইলে প্লেয়ার স্ক্রিনের বাইরে থাকলে উপরে নিয়ে যাই
    const top = playerRef.current?.getBoundingClientRect().top ?? 0;
    if (playerRef.current && (top < 0 || top > window.innerHeight * 0.6)) smoothScrollTo(playerRef.current);
  };

  if (!active) return null;

  return (
    <div className={single ? 'mx-auto max-w-4xl' : 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10'}>
      <style>{`@keyframes eq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}`}</style>

      <div ref={playerRef} className="min-w-0">
        <VideoFrame item={active} playing={playing} onPlay={() => setPlaying(true)} />
        <Details
          item={active}
          index={index}
          total={items.length}
          onPrev={() => index > 0 && select(items[index - 1].id)}
          onNext={() => index < items.length - 1 && select(items[index + 1].id)}
        />
      </div>

      {!single && (
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Playlist items={items} activeId={active.id} onSelect={(id) => select(id)} />
        </aside>
      )}
    </div>
  );
}
