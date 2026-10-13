'use server';

/**
 * রেজিস্ট্রেশন ফর্মের Server Action — ব্রাউজার শুধু এগুলোই ডাকে।
 * সবসময় ActionResult ফেরত দেয় (throw করে না):
 *   const r = await registerSchool(form);
 *   if (!r.ok) { r.message; r.fieldErrors?.email }
 */
import { runAction } from '@/lib/api/action';
import type { ActionResult } from '@/lib/api/types';
import {
  SCHOOL_FIELD_RULES,
  cleanSchoolRegistration,
  validateSchoolRegistration,
} from '@/lib/validators/school';
import { schoolService } from '@/services/school.service';
import type { RegistrationResult, SchoolRegistrationInput, SubdomainCheckResult } from '@/types/school';

export async function checkSubdomain(schoolName: string): Promise<ActionResult<SubdomainCheckResult>> {
  const name = String(schoolName ?? '').trim();
  const err = SCHOOL_FIELD_RULES.school_name!(name);
  if (err) return { ok: false, message: err, fieldErrors: { school_name: err } };

  return runAction(() => schoolService.checkSubdomain(name));
}

export async function registerSchool(
  input: SchoolRegistrationInput,
): Promise<ActionResult<RegistrationResult & { message: string | null }>> {
  const data = cleanSchoolRegistration({
    school_name: String(input?.school_name ?? ''),
    email: String(input?.email ?? ''),
    phone: String(input?.phone ?? ''),
    full_address: String(input?.full_address ?? ''),
    domain: String(input?.domain ?? ''),
    subdomain: String(input?.subdomain ?? ''),
    type: String(input?.type ?? ''),
    plan: String(input?.plan ?? ''),
    billing_cycle: input?.billing_cycle === 'monthly' ? 'monthly' : 'yearly',
  });

  const fieldErrors = validateSchoolRegistration(data);
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: Object.values(fieldErrors)[0]!, fieldErrors, status: 422 };
  }

  return runAction(() => schoolService.register(data));
}
