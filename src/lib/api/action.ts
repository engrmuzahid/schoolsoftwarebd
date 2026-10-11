/**
 * Server Action-এর ভেতরে service কল মোড়ানোর helper —
 * error হলে throw না করে { ok: false, message, fieldErrors } ফেরত দেয়।
 *
 *   'use server';
 *   export async function likeBlog(slug: string) {
 *     return runAction(() => blogService.like(slug));
 *   }
 */
import 'server-only';
import { toApiError } from './errors';
import type { ActionResult } from './types';

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    const err = toApiError(e);
    return {
      ok: false,
      message: err.message,
      status: err.status || undefined,
      ...(Object.keys(err.fieldErrors).length ? { fieldErrors: err.fieldErrors } : {}),
    };
  }
}
