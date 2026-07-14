'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { Finding, ReportPillar } from '@/lib/api';
import { effortCounts, findingsByPillarRows, severityCounts } from '@/lib/ui';
import type {
  ChartStrings,
  EffortBarProps,
  FindingsByPillarProps,
  SeverityPieProps,
} from '../charts';
import { FindingsSection } from '../findings-section';
import { InfoTip } from '../ui/info-tip';

/**
 * Findings tab — three summary charts (severity split, effort split, findings
 * per pillar) above the full findings list with its severity filter. Empty
 * state when nothing was flagged.
 */
export function FindingsTab({
  findings,
  pillars,
  Severity,
  Effort,
  ByPillar,
  strings,
  print,
}: {
  findings: Finding[];
  pillars: ReportPillar[];
  Severity: ComponentType<SeverityPieProps>;
  Effort: ComponentType<EffortBarProps>;
  ByPillar: ComponentType<FindingsByPillarProps>;
  strings: ChartStrings;
  print: boolean;
}) {
  const t = useTranslations('report');
  const cs = print ? undefined : strings;

  if (findings.length === 0) {
    return (
      <section className="print:break-before-page">
        <h2 className="text-xl font-semibold text-white">{t('findingsTitle')}</h2>
        <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-ink-400">
          {t('findingsEmpty')}
        </div>
      </section>
    );
  }

  const sev = severityCounts(findings);
  const eff = effortCounts(findings);
  const byPillar = findingsByPillarRows(pillars, findings);
  const hasByPillar = byPillar.some((r) => r.count > 0);

  return (
    <div className="print:break-before-page">
      <section className="print:break-inside-avoid">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl font-semibold text-white">{t('findingsChartsTitle')}</h2>
          <InfoTip label={t('findingsChartsTitle')}>{t('tipFindingsCharts')}</InfoTip>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3 print:grid-cols-3">
          <div className="surface p-5">
            <h3 className="text-sm font-medium text-ink-200">{t('bySeverityTitle')}</h3>
            <div className="mt-3">
              <Severity data={sev} animate={!print} strings={cs} />
            </div>
          </div>
          <div className="surface p-5">
            <h3 className="text-sm font-medium text-ink-200">{t('byEffortTitle')}</h3>
            <div className="mt-3">
              <Effort data={eff} animate={!print} strings={cs} />
            </div>
          </div>
          <div className="surface p-5">
            <h3 className="text-sm font-medium text-ink-200">{t('byPillarTitle')}</h3>
            <div className="mt-3">
              {hasByPillar ? (
                <ByPillar data={byPillar} animate={!print} strings={cs} />
              ) : (
                <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-white/10 text-[11px] text-ink-500">
                  {t('byPillarEmpty')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div id="findings" className="scroll-mt-24">
        <FindingsSection findings={findings} />
      </div>
    </div>
  );
}
