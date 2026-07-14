'use client';

import { ReportView } from './report-view';
import {
  CalibrationBar,
  DistributionDonut,
  EffortBar,
  EffortByTimeline,
  FindingsByPillar,
  MaturityAcrossPillars,
  MaturityBar,
  OverallGauge,
  PillarCompareBar,
  PillarRadar,
  SeverityPie,
} from './charts';

/**
 * Print rendition rendered by the backend's puppeteer. Charts are imported
 * directly (no lazy/intersection gating) so they render as soon as the data
 * fetch resolves — puppeteer waits for networkidle0 before printing. In print
 * mode ReportView drops the tab bar and lays every tab's content out linearly.
 */
export function ReportPrint({ portalToken }: { portalToken: string }) {
  return (
    <ReportView
      portalToken={portalToken}
      print
      charts={{
        Radar: PillarRadar,
        Donut: DistributionDonut,
        Bar: MaturityBar,
        Compare: PillarCompareBar,
        MaturityAcross: MaturityAcrossPillars,
        Calibration: CalibrationBar,
        Severity: SeverityPie,
        Effort: EffortBar,
        FindingsByPillar: FindingsByPillar,
        Gauge: OverallGauge,
        EffortTimeline: EffortByTimeline,
      }}
    />
  );
}
