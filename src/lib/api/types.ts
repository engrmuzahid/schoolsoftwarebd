/**
 * Laravel API-র রেসপন্সের সাধারণ গঠন + Server Action-এর ফলাফল
 */
import type { FieldErrors } from './errors';

/** JsonResource:  { data: T, success: true } */
export type ApiResponse<T> = { data: T; success?: boolean };

/** Laravel paginate()-এর meta */
export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

/** ResourceCollection + paginate():  { data: T[], meta, links } */
export type Paginated<T> = { data: T[]; meta: PaginationMeta };

/** query string-এর মান — undefined / null / '' / [] বাদ যায় */
export type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export type Query = Record<string, QueryValue>;

/**
 * Server Action সবসময় এটাই ফেরত দেয় — কখনো throw করে না,
 * তাই client-এ try/catch লাগে না:
 *   const r = await likeBlog(slug);
 *   if (!r.ok) toast(r.message);
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: FieldErrors; status?: number };
