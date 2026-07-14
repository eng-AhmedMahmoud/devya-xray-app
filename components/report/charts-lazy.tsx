'use client';

import dynamic from 'next/dynamic';

/**
 * recharts is ~400KB of client JS — load it lazily and only in the browser
 * so the interactive report shell renders instantly. The print rendition
 * imports ./charts directly instead (puppeteer needs charts immediately).
 */
export const PillarRadarLazy = dynamic(
  () => import('./charts').then((m) => m.PillarRadar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] animate-pulse rounded-md bg-white/[0.03]" />
    ),
  },
);

export const DistributionDonutLazy = dynamic(
  () => import('./charts').then((m) => m.DistributionDonut),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] animate-pulse rounded-md bg-white/[0.03]" />
    ),
  },
);

export const MaturityBarLazy = dynamic(
  () => import('./charts').then((m) => m.MaturityBar),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 animate-pulse rounded-md bg-white/[0.03]" />
    ),
  },
);

/* -------------------------------------------------------------------------- */
/*  Aggregate / cross-view charts — all lazy for the interactive report.       */
/*  The print rendition imports the eager exports from ./charts directly.      */
/* -------------------------------------------------------------------------- */

function skeleton(h: number) {
  const Skeleton = () => (
    <div className="animate-pulse rounded-md bg-white/[0.03]" style={{ height: h }} />
  );
  Skeleton.displayName = `ChartSkeleton(${h})`;
  return Skeleton;
}

export const PillarCompareBarLazy = dynamic(
  () => import('./charts').then((m) => m.PillarCompareBar),
  { ssr: false, loading: skeleton(300) },
);

export const MaturityAcrossPillarsLazy = dynamic(
  () => import('./charts').then((m) => m.MaturityAcrossPillars),
  { ssr: false, loading: skeleton(300) },
);

export const CalibrationBarLazy = dynamic(
  () => import('./charts').then((m) => m.CalibrationBar),
  { ssr: false, loading: skeleton(300) },
);

export const SeverityPieLazy = dynamic(
  () => import('./charts').then((m) => m.SeverityPie),
  { ssr: false, loading: skeleton(210) },
);

export const EffortBarLazy = dynamic(
  () => import('./charts').then((m) => m.EffortBar),
  { ssr: false, loading: skeleton(240) },
);

export const FindingsByPillarLazy = dynamic(
  () => import('./charts').then((m) => m.FindingsByPillar),
  { ssr: false, loading: skeleton(240) },
);

export const OverallGaugeLazy = dynamic(
  () => import('./charts').then((m) => m.OverallGauge),
  { ssr: false, loading: skeleton(200) },
);

export const EffortByTimelineLazy = dynamic(
  () => import('./charts').then((m) => m.EffortByTimeline),
  { ssr: false, loading: skeleton(260) },
);
