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

/** Maturity level i18n keys (maturity.m1 … m4). */
export const MATURITY_KEYS: Record<number, string> = {
  1: 'm1',
  2: 'm2',
  3: 'm3',
  4: 'm4',
};

/** X-Ray primary accent — silver (reads on the black surface). */
export const ACCENT = '#D4D4D4';

/** Secondary chart accent — a dimmer silver for the "self-reported" overlay
 *  ring so verified (bright) reads on top of claimed (muted). No blue. */
export const ACCENT_MUTED = '#8A8A8A';

/** Rank severities high → low for filtering / sorting findings. */
export const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Effort t-shirt sizes, smallest → largest. */
export const EFFORT_ORDER: readonly string[] = ['XS', 'S', 'M', 'L', 'XL'];

/**
 * Consultation decision bands, keyed off the urgency index (0–100). Each band
 * maps to an i18n key (report.band<Key>) and a silver-on-black tone color.
 * Ordered from calmest → most urgent. `min` is inclusive.
 */
export type DecisionBand = {
  key: 'Maintain' | 'Monitor' | 'Improve' | 'Prioritize' | 'Urgent' | 'Critical';
  min: number;
  color: string;
};

export const DECISION_BANDS: readonly DecisionBand[] = [
  { key: 'Maintain', min: 0, color: '#10B981' },
  { key: 'Monitor', min: 20, color: '#84CC16' },
  { key: 'Improve', min: 40, color: '#EAB308' },
  { key: 'Prioritize', min: 60, color: '#F59E0B' },
  { key: 'Urgent', min: 75, color: '#F97316' },
  { key: 'Critical', min: 90, color: '#EF4444' },
];

/** Resolve the decision band for an urgency index (null-safe). */
export function decisionBand(urgency: number | null | undefined): DecisionBand {
  const v = Number(urgency);
  if (!Number.isFinite(v)) return DECISION_BANDS[0];
  let band = DECISION_BANDS[0];
  for (const b of DECISION_BANDS) {
    if (v >= b.min) band = b;
  }
  return band;
}

/** Total scored practices across a maturity distribution (levels 1–4). */
export function distributionTotal(dist?: Record<string, number> | null): number {
  if (!dist) return 0;
  return [1, 2, 3, 4].reduce((sum, l) => sum + (dist[String(l)] ?? 0), 0);
}

/**
 * Weighted-average maturity (1–4) → health % (0–100) for a distribution.
 * Returns null when nothing is scored so callers can show a "not yet scored"
 * state instead of a misleading 0%.
 */
export function distributionHealth(
  dist?: Record<string, number> | null,
): number | null {
  const total = distributionTotal(dist);
  if (!dist || total === 0) return null;
  const weighted = [1, 2, 3, 4].reduce(
    (sum, l) => sum + l * (dist[String(l)] ?? 0),
    0,
  );
  const avg = weighted / total; // 1..4
  return Math.round(((avg - 1) / 3) * 100);
}

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
