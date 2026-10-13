/**
 * রেজিস্ট্রেশনের পরের পেমেন্ট পেজ
 *   GET  school/payment/{token}
 *   POST school/payment/{token}   (multipart: payer_number, transaction_id, attachment?)
 */
import type { SubscriptionSummary } from './school';

export type InvoiceStatus = 'unpaid' | 'pending_review' | 'paid' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type PaymentPageData = {
  invoice: {
    invoice_no: string;
    status: InvoiceStatus;
    status_label: string;
    subtotal: number;
    vat: number;
    discount: number;
    total: number;
    billing_cycle: 'monthly' | 'yearly' | null;
    period_start: string | null;
    period_end: string | null;
    due_date: string | null;
    items: { description: string; amount: number }[];
  };
  school: { school_name: string | null; host: string | null };
  subscription: SubscriptionSummary | null;
  bkash: { number: string; account_type: string; instructions: string };
  currency_symbol: string;
  attachment_required: boolean;
  support_phone: string;
  latest_payment: {
    status: PaymentStatus;
    status_label: string;
    transaction_id: string;
    amount: number;
    submitted_at: string | null;
    /** বাতিল হলে কারণ */
    admin_note: string | null;
  } | null;
};

export type PaymentSubmitField = 'payer_number' | 'transaction_id' | 'attachment';
