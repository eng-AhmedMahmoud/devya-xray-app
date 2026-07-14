'use client';

import { ReportView } from './report-view';
import {
  CalibrationBarLazy,
  DistributionDonutLazy,
  EffortBarLazy,
  EffortByTimelineLazy,
  FindingsByPillarLazy,
  MaturityAcrossPillarsLazy,
  MaturityBarLazy,
  OverallGaugeLazy,
  PillarCompareBarLazy,
  PillarRadarLazy,
  SeverityPieLazy,
} from './charts-lazy';

export function ReportInteractive({ portalToken }: { portalToken: string }) {
  return (
    <ReportView
      portalToken={portalToken}
      print={false}
      charts={{
        Radar: PillarRadarLazy,
        Donut: DistributionDonutLazy,
        Bar: MaturityBarLazy,
        Compare: PillarCompareBarLazy,
        MaturityAcross: MaturityAcrossPillarsLazy,
        Calibration: CalibrationBarLazy,
        Severity: SeverityPieLazy,
        Effort: EffortBarLazy,
        FindingsByPillar: FindingsByPillarLazy,
        Gauge: OverallGaugeLazy,
        EffortTimeline: EffortByTimelineLazy,
      }}
    />
  );
}
