import 'server-only';
import { apiUrl } from '@/config/env';
import { REVALIDATE } from './cache-tags';
import { ApiError, apiErrorFromResponse, toApiError } from './errors';
import type { Query } from './types';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiFetchOptions = {
  method?: Method;
  query?: Query;
  body?: unknown;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  headers?: Record<string, string>;
  forwardClientIp?: boolean;
};

function buildUrl(path: string, query?: Query) {
  const url = apiUrl(path);
  if (!query) return url;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) sp.set(key, value.join(','));
    } else {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString().replace(/%2C/g, ',');
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

async function clientIpHeaders(): Promise<Record<string, string>> {
  const { headers } = await import('next/headers');
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || '';
  return ip ? { 'X-Forwarded-For': ip, 'X-Real-IP': ip } : {};
}

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const revalidate = opts.revalidate ?? (method === 'GET' ? REVALIDATE.short : false);
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.forwardClientIp ? await clientIpHeaders() : {}),
    ...opts.headers,
  };

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body === undefined ? undefined : isFormData ? (opts.body as FormData) : JSON.stringify(opts.body),
      ...(revalidate === false ? { cache: 'no-store' as const } : { next: { revalidate, tags: opts.tags } }),
      signal: AbortSignal.timeout(opts.timeout ?? 10_000),
    });
  } catch (e) {
    const err = toApiError(e);
    console.error(`[api] ${method} ${path} → ${err.code}`);
    throw err;
  }

  if (!res.ok) {
    const err = await apiErrorFromResponse(res);
    if (err.code !== 'NOT_FOUND' && err.code !== 'VALIDATION') {
      console.error(`[api] ${method} ${path} → ${res.status} ${err.code}`);
    }
    throw err;
  }

  if (res.status === 204) return undefined as T;
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('সার্ভার থেকে অপ্রত্যাশিত উত্তর এসেছে।', { status: res.status, code: 'INVALID_RESPONSE' });
  }
}

export const api = {
  get: <T>(path: string, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, opts?: Omit<ApiFetchOptions, 'method'>) => apiFetch<T>(path, { ...opts, method: 'POST' }),
  put: <T>(path: string, opts?: Omit<ApiFetchOptions, 'method'>) => apiFetch<T>(path, { ...opts, method: 'PUT' }),
  patch: <T>(path: string, opts?: Omit<ApiFetchOptions, 'method'>) => apiFetch<T>(path, { ...opts, method: 'PATCH' }),
  delete: <T>(path: string, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) => apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};

const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

export async function buildSafe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (IS_BUILD) {
      console.warn('[api] build-এর সময় API পাওয়া যায়নি — খালি ডাটা দিয়ে পেজ তৈরি হলো');
      return fallback;
    }
    throw e;
  }
}

export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}