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
      <div className="h-[320px] animate-pulse rounded-md bg-white/[0.03]" />
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
