/**
 * বাংলা ফরম্যাটিং — server ও client দুই জায়গাতেই চলে
 */

/** 2026 → ২০২৬ */
export const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const dateFmt = new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });

/** '2026-10-04T10:30:00+06:00' → ৪ অক্টোবর, ২০২৬ (ভুল তারিখ হলে '') */
export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d);
};

/** ১২৩৪ → ১,২৩৪ ; ১৫০০০ → ১৫ হা. */
export const formatCount = (n: number) =>
  n >= 10000 ? `${toBn(Math.round(n / 1000))} হা.` : toBn(n.toLocaleString('en-US'));
