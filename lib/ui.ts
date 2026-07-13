/** Maturity level colors (1 Absent → 4 Established): red → amber → lime → green. */
export const MATURITY_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#84CC16',
  4: '#10B981',
};

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#A3A3A3',
};

/** X-Ray primary accent — silver (reads on the black surface). */
export const ACCENT = '#D4D4D4';

/** Pick the Arabic variant when the locale is ar and the field is present. */
export function loc(locale: string, en: string, ar?: string | null): string {
  return locale === 'ar' && ar ? ar : en;
}

export function formatDate(locale: string, iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    dateStyle: 'medium',
  }).format(d);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export function clampRank(n: number | null | undefined, max: number): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 1;
  return Math.min(Math.max(v, 1), max);
}
