export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'RATE_LIMIT'
  | 'SERVER'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, opts: { status?: number; code?: ApiErrorCode; fieldErrors?: FieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status ?? 0;
    this.code = opts.code ?? 'UNKNOWN';
    this.fieldErrors = opts.fieldErrors ?? {};
  }
}

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'VALIDATION',
  429: 'RATE_LIMIT',
};

export const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK: 'সার্ভারের সাথে যোগাযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।',
  TIMEOUT: 'সার্ভার সময়মতো উত্তর দেয়নি। একটু পরে আবার চেষ্টা করুন।',
  BAD_REQUEST: 'অনুরোধটি সঠিক নয়।',
  UNAUTHORIZED: 'এই কাজের জন্য লগইন করতে হবে।',
  FORBIDDEN: 'এই কাজের অনুমতি নেই।',
  NOT_FOUND: 'খুঁজে পাওয়া যায়নি।',
  VALIDATION: 'দেওয়া তথ্যে কিছু ভুল আছে, ঠিক করে আবার চেষ্টা করুন।',
  RATE_LIMIT: 'অনেকবার চেষ্টা হয়েছে, এক মিনিট পর আবার চেষ্টা করুন।',
  SERVER: 'সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।',
  INVALID_RESPONSE: 'সার্ভার থেকে অপ্রত্যাশিত উত্তর এসেছে।',
  UNKNOWN: 'অপ্রত্যাশিত সমস্যা হয়েছে।',
};

export const codeFromStatus = (status: number): ApiErrorCode =>
  CODE_BY_STATUS[status] ?? (status >= 500 ? 'SERVER' : 'UNKNOWN');

type RawErrors = Record<string, string[] | string>;
type LaravelErrorBody = { message?: string; errors?: RawErrors; data?: { errors?: RawErrors } | null };

export function pickFieldErrors(body: LaravelErrorBody | null | undefined): FieldErrors {
  const raw = body?.errors ?? body?.data?.errors ?? {};
  const out: FieldErrors = {};
  for (const [field, msgs] of Object.entries(raw)) {
    const first = Array.isArray(msgs) ? msgs[0] : msgs;
    if (first) out[field] = String(first);
  }
  return out;
}

export async function apiErrorFromResponse(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as LaravelErrorBody;
  const code = codeFromStatus(res.status);

  const fieldErrors = pickFieldErrors(body);

  const message =
    (code === 'VALIDATION' && Object.values(fieldErrors)[0]) ||
    (code !== 'SERVER' && code !== 'NOT_FOUND' && code !== 'RATE_LIMIT' && body.message) ||
    DEFAULT_MESSAGES[code];

  return new ApiError(message, { status: res.status, code, fieldErrors });
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
    return new ApiError(DEFAULT_MESSAGES.TIMEOUT, { code: 'TIMEOUT' });
  }
  if (e instanceof TypeError) return new ApiError(DEFAULT_MESSAGES.NETWORK, { code: 'NETWORK' });
  return new ApiError(DEFAULT_MESSAGES.UNKNOWN);
}

export const isNotFound = (e: unknown) => e instanceof ApiError && e.code === 'NOT_FOUND';