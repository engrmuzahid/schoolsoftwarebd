import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import type { Metadata } from 'next';
import { APP_NAME, IS_PRODUCTION, SITE_URL } from '@/config/env';

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${APP_NAME} - School Management Software`, template: `%s - ${APP_NAME}` },
  description: 'স্কুল, কলেজ ও মাদ্রাসার আধুনিক সমাধান',
  applicationName: APP_NAME,
  openGraph: { siteName: APP_NAME, locale: 'bn_BD', type: 'website' },
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={notoBengali.variable}>
      <head>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="font-bn bg-light text-body antialiased relative overflow-x-clip">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}