'use client';

import { ReportView } from './report-view';
import { DistributionDonut, PillarRadar } from './charts';

/**
 * Print rendition rendered by the backend's puppeteer. Charts are imported
 * directly (no lazy/intersection gating) so they render as soon as the data
 * fetch resolves — puppeteer waits for networkidle0 before printing.
 */
export function ReportPrint({ portalToken }: { portalToken: string }) {
  return (
    <ReportView
      portalToken={portalToken}
      print
      charts={{ Radar: PillarRadar, Donut: DistributionDonut }}
    />
  );
}
