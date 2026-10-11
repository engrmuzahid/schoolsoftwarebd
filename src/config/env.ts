/**
 * প্রজেক্টের সব env একটা জায়গায় — অন্য কোনো ফাইলে সরাসরি process.env লিখবেন না,
 * এখান থেকে import করুন:  import { API_BASE_URL, APP_NAME } from '@/config/env';
 * ---------------------------------------------------------------
 * .env.local (development):
 *   NEXT_PUBLIC_APP_NAME="School SoftwareBD"
 *   NEXT_PUBLIC_APP_ENV=development
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
 *
 * .env.production (server-এ):
 *   NEXT_PUBLIC_APP_ENV=production
 *   NEXT_PUBLIC_API_URL=https://cp.schoolsoftwarebd.com
 *   NEXT_PUBLIC_API_BASE_URL=https://cp.schoolsoftwarebd.com/api
 *
 * ⚠️ NEXT_PUBLIC_ মানগুলো build-এর সময় কোডে বসে যায় — .env বদলালে আবার
 *    `npm run build` (dev-এ server restart) করতে হবে।
 * ⚠️ Next শুধু `process.env.NEXT_PUBLIC_X` এভাবে সরাসরি লিখলেই মান বসায় —
 *    process.env[key] বা destructure করলে browser-এ undefined পাবেন। তাই নিচে আলাদা আলাদা লেখা।
 */

const trimSlash = (url: string) => url.replace(/\/+$/, '');

/** env না থাকলে: development-এ default মান + warning, production-এ build বন্ধ */
function required(name: string, value: string | undefined, devFallback: string): string {
  if (value && value.trim()) return trimSlash(value.trim());
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    throw new Error(`[env] ${name} সেট করা নেই — .env.production-এ যোগ করুন।`);
  }
  if (typeof window === 'undefined') console.warn(`[env] ${name} সেট করা নেই, "${devFallback}" ব্যবহার হচ্ছে।`);
  return devFallback;
}

/* ------------------------------ app ------------------------------ */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'School SoftwareBD';

export type AppEnv = 'development' | 'staging' | 'production';
export const APP_ENV: AppEnv = (['development', 'staging', 'production'] as const).includes(
  process.env.NEXT_PUBLIC_APP_ENV as AppEnv,
)
  ? (process.env.NEXT_PUBLIC_APP_ENV as AppEnv)
  : 'development';

export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_DEVELOPMENT = APP_ENV === 'development';

/* ------------------------------ API ------------------------------ */
/** Laravel-এর মূল URL (storage-এর ছবি ইত্যাদির জন্য) — http://127.0.0.1:8000 */
export const API_URL = required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL, 'http://127.0.0.1:8000');

/** Laravel API — http://127.0.0.1:8000/api */
export const API_BASE_URL = required(
  'NEXT_PUBLIC_API_BASE_URL',
  process.env.NEXT_PUBLIC_API_BASE_URL,
  `${API_URL}/api`,
);

/** apiUrl('/school/blogs') → http://127.0.0.1:8000/api/school/blogs */
export const apiUrl = (path: string) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;

/**
 * API থেকে আসা ছবি/ফাইলের লিংক পূর্ণ করে:
 *   '/storage/blogs/a.jpg' → 'http://127.0.0.1:8000/storage/blogs/a.jpg'
 *   পূর্ণ URL (http…) হলে যেমন আছে তেমনই থাকে
 */
export const assetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${API_URL}/${path.replace(/^\/+/, '')}`;
};

/* --------------------------- school domains --------------------------- */
/**
 * স্কুলের সাবডোমেইনগুলো APP_ENV অনুযায়ী:
 *   development / staging → http://xxx.schoolsoftwarebd.test
 *   production            → https://xxx.schoolsoftwarebd.com
 */
const SCHOOL_TLD = IS_PRODUCTION ? 'com' : 'test';
const SCHOOL_PROTOCOL = IS_PRODUCTION ? 'https' : 'http';
export const SCHOOL_DOMAIN = `schoolsoftwarebd.${SCHOOL_TLD}`;

/** schoolSiteUrl('admin', '/login') → http://admin.schoolsoftwarebd.test/login */
export const schoolSiteUrl = (subdomain: string, path = '') =>
  `${SCHOOL_PROTOCOL}://${subdomain ? `${subdomain}.` : ''}${SCHOOL_DOMAIN}${path}`;

/** এই ওয়েবসাইটের নিজের ঠিকানা (canonical / og:url / share লিংকের জন্য) */
export const SITE_URL = schoolSiteUrl('');

/* ------------------------------ অন্যান্য ------------------------------ */
/** Contact form যেখানে যাবে (না দিলে ফর্ম demo মোডে চলে) */
export const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() ?? '';
