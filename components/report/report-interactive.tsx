'use client';

import { ReportView } from './report-view';
import { DistributionDonutLazy, PillarRadarLazy } from './charts-lazy';

export function ReportInteractive({ portalToken }: { portalToken: string }) {
  return (
    <ReportView
      portalToken={portalToken}
      print={false}
      charts={{ Radar: PillarRadarLazy, Donut: DistributionDonutLazy }}
    />
  );
}
