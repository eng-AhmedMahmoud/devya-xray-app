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

/* -------------------------------------------------------------------------- */
/*  Chart derivations                                                          */
/*  Small, presentational-free reducers that turn the report payload into the  */
/*  row shapes recharts wants. Kept here so charts stay dumb and print/inter-  */
/*  active share one source of truth. Loosely typed (structural) so lib/ui     */
/*  needn't import the api types and risk a cycle.                             */
/* -------------------------------------------------------------------------- */

type DistLike = Record<string, number> | null | undefined;
type CalibLike = { overclaimed: number; calibrated: number; underclaimed: number };
type PillarLike = {
  code: string;
  name: string;
  stats: {
    healthPct: number;
    urgencyIndex: number;
    distribution: DistLike;
    calibration: CalibLike;
  };
};
type FindingLike = { severity: string; effort: string; practiceCodes?: string[] };
type RoadmapLike = { timeline: string; items: FindingLike[] };

/** Severity buckets, high → low, for finding rollups. */
export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

/** Roadmap timeline order → i18n key. Anything unknown falls through as-is. */
export const TIMELINE_ORDER: readonly string[] = ['30 days', '90 days', '2 quarters'];

/**
 * Health % vs urgency, one row per scored pillar. Feeds PillarCompareBar.
 * A pillar with nothing scored (distributionTotal === 0) is dropped so the
 * comparison never plots misleading zeros.
 */
export function pillarCompareRows(pillars: PillarLike[]) {
  return pillars
    .filter((p) => distributionTotal(p.stats.distribution) > 0)
    .map((p) => ({
      code: p.code,
      name: p.name,
      health: Math.round(p.stats.healthPct),
      urgency: Math.round(p.stats.urgencyIndex),
    }));
}

/** One stacked row per pillar with the count at each maturity level (l1–l4). */
export function maturityAcrossPillarsRows(pillars: PillarLike[]) {
  return pillars.map((p) => {
    const d = p.stats.distribution ?? {};
    return {
      code: p.code,
      name: p.name,
      l1: d['1'] ?? 0,
      l2: d['2'] ?? 0,
      l3: d['3'] ?? 0,
      l4: d['4'] ?? 0,
      total: distributionTotal(p.stats.distribution),
    };
  });
}

/**
 * Diverging calibration rows: underclaimed plots left (negative), overclaimed
 * right (positive), calibrated sits at center. One row per pillar.
 */
export function calibrationRows(pillars: PillarLike[]) {
  return pillars.map((p) => {
    const c = p.stats.calibration;
    return {
      code: p.code,
      name: p.name,
      over: c.overclaimed,
      under: -c.underclaimed,
      calibrated: c.calibrated,
    };
  });
}

/** Findings grouped by severity → [{ key, count }], ordered critical → low. */
export function severityCounts(findings: FindingLike[]) {
  const map = new Map<string, number>();
  for (const f of findings) map.set(f.severity, (map.get(f.severity) ?? 0) + 1);
  return SEVERITY_LEVELS.filter((s) => map.has(s)).map((s) => ({
    key: s,
    count: map.get(s) ?? 0,
  }));
}

/** Findings grouped by effort size → [{ key, count }], XS → XL. */
export function effortCounts(findings: FindingLike[]) {
  const map = new Map<string, number>();
  for (const f of findings) map.set(f.effort, (map.get(f.effort) ?? 0) + 1);
  return EFFORT_ORDER.filter((e) => map.has(e)).map((e) => ({
    key: e,
    count: map.get(e) ?? 0,
  }));
}

/** Extract a pillar code from a practice code ("QEN-10" → "QEN"). */
export function pillarCodeOf(practiceCode: string): string {
  return practiceCode.split(/[-.]/)[0]?.toUpperCase() ?? practiceCode;
}

/**
 * Finding counts per pillar, resolved through each finding's practiceCodes
 * (prefix → pillar code). A finding touching several pillars counts once per
 * distinct pillar it references; one with no resolvable code is skipped.
 * Rows follow the pillar display order and include zero-count pillars so the
 * bar reads as a full per-pillar comparison.
 */
export function findingsByPillarRows(pillars: PillarLike[], findings: FindingLike[]) {
  const valid = new Set(pillars.map((p) => p.code.toUpperCase()));
  const counts = new Map<string, number>();
  for (const f of findings) {
    const hit = new Set<string>();
    for (const code of f.practiceCodes ?? []) {
      const pc = pillarCodeOf(code);
      if (valid.has(pc)) hit.add(pc);
    }
    for (const pc of hit) counts.set(pc, (counts.get(pc) ?? 0) + 1);
  }
  return pillars.map((p) => ({
    code: p.code,
    name: p.name,
    count: counts.get(p.code.toUpperCase()) ?? 0,
  }));
}

/**
 * Effort spread across the roadmap timeline buckets: one row per bucket with a
 * count per effort size (l_XS … l_XL). Feeds the stacked EffortByTimeline bar.
 */
export function effortByTimelineRows(roadmap: RoadmapLike[]) {
  return roadmap.map((b) => {
    const row: Record<string, number | string> = { timeline: b.timeline };
    for (const e of EFFORT_ORDER) row[e] = 0;
    for (const item of b.items) {
      if (EFFORT_ORDER.includes(item.effort)) {
        row[item.effort] = (row[item.effort] as number) + 1;
      }
    }
    return row;
  });
}

/**
 * Overall maturity distribution as ordered [{ level, name-less }] rows for the
 * radial gauge / the top-level donut reuse. (The gauge itself only needs a
 * single value, but keeping the reducer here documents the shape.)
 */
export function overallGaugeValue(healthPct: number | null | undefined): number {
  const v = Number(healthPct);
  return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
}

/**
 * A muted silver ramp for categorical chart series that are NOT maturity or
 * severity (e.g. effort sizes) — stays strictly on the silver-on-black brand,
 * darkest → lightest across five steps. No blue.
 */
export const SILVER_RAMP: readonly string[] = [
  '#525252',
  '#737373',
  '#A3A3A3',
  '#D4D4D4',
  '#F5F5F5',
];

/** Map an effort size (XS…XL) to a silver ramp step. */
export function effortColor(effort: string): string {
  const i = EFFORT_ORDER.indexOf(effort);
  return SILVER_RAMP[i] ?? ACCENT;
}
