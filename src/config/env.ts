const trimSlash = (url: string) => url.replace(/\/+$/, '');

function required(name: string, value: string | undefined, devFallback: string): string {
  if (value && value.trim()) return trimSlash(value.trim());
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    throw new Error(`[env] ${name} সেট করা নেই — .env.production-এ যোগ করুন।`);
  }
  if (typeof window === 'undefined') console.warn(`[env] ${name} সেট করা নেই, "${devFallback}" ব্যবহার হচ্ছে।`);
  return devFallback;
}

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'School SoftwareBD';

export type AppEnv = 'development' | 'staging' | 'production';
export const APP_ENV: AppEnv = (['development', 'staging', 'production'] as const).includes(
  process.env.NEXT_PUBLIC_APP_ENV as AppEnv,
)
  ? (process.env.NEXT_PUBLIC_APP_ENV as AppEnv)
  : 'development';

export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_DEVELOPMENT = APP_ENV === 'development';

export const API_URL = required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL, 'http://127.0.0.1:8000');

export const API_BASE_URL = required(
  'NEXT_PUBLIC_API_BASE_URL',
  process.env.NEXT_PUBLIC_API_BASE_URL,
  `${API_URL}/api`,
);

export const apiUrl = (path: string) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;

export const assetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${API_URL}/${path.replace(/^\/+/, '')}`;
};

const SCHOOL_TLD = IS_PRODUCTION ? 'com' : 'test';
const SCHOOL_PROTOCOL = IS_PRODUCTION ? 'https' : 'http';
export const SCHOOL_DOMAIN = `schoolsoftwarebd.${SCHOOL_TLD}`;

export const schoolSiteUrl = (subdomain: string, path = '') =>
  `${SCHOOL_PROTOCOL}://${subdomain ? `${subdomain}.` : ''}${SCHOOL_DOMAIN}${path}`;

export const SITE_URL = schoolSiteUrl('');

export const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() ?? '';