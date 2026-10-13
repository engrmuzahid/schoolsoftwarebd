import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/config/env';
import JsonLd from '@/components/shared/JsonLd';

export type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items, className = '' }: { items: BreadcrumbItem[]; className?: string }) {
  const all: BreadcrumbItem[] = [{ label: 'মূল পাতা', href: '/' }, ...items];

  return (
    <>
      <nav
        aria-label="breadcrumb"
        className={`inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-slate-300 ${className}`}
      >
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <span key={`${item.label}-${i}`} className={`flex items-center gap-2 ${last ? 'min-w-0' : 'shrink-0'}`}>
              {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className="truncate text-primary">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
