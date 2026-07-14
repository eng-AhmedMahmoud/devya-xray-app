'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { ReportPayload } from '@/lib/api';
import {
  SEVERITY_COLORS,
  SEVERITY_ORDER,
  calibrationRows,
  distributionTotal,
  overallGaugeValue,
} from '@/lib/ui';
import type {
  CalibrationProps,
  ChartStrings,
  DonutProps,
  OverallGaugeProps,
  RadarProps,
  RadarPoint,
} from '../charts';
import { ReportHero } from '../report-hero';
import { ReportGuide } from '../report-guide';
import { InfoTip } from '../ui/info-tip';
import type { TabId } from '../report-tabs';

/**
 * Overview tab — the executive at-a-glance view: header + KPI cards, the pillar
 * radar, overall maturity donut + gauge, a calibration summary chart, the exec
 * summary, the "how to read" guide, and compact top-findings / quick-wins
 * teasers that link into the Findings / Roadmap tabs.
 */
export function OverviewTab({
  data,
  radarData,
  Radar,
  Donut,
  Gauge,
  Calibration,
  strings,
  print,
  onGoto,
}: {
  data: ReportPayload;
  radarData: RadarPoint[];
  Radar: ComponentType<RadarProps>;
  Donut: ComponentType<DonutProps>;
  Gauge: ComponentType<OverallGaugeProps>;
  Calibration: ComponentType<CalibrationProps>;
  strings: ChartStrings;
  print: boolean;
  /** Jump to another tab (no-op in print). */
  onGoto?: (id: TabId) => void;
}) {
  const t = useTranslations('report');
  const tm = useTranslations('maturity');
  const cs = print ? undefined : strings;

  const overallScored = distributionTotal(data.overall.distribution) > 0;
  const hasRadar = radarData.length > 0;
  const calibData = calibrationRows(data.pillars);
  const hasCalibration = calibData.some((r) => r.over !== 0 || r.under !== 0);

  const maturityLabels: Record<number, string> = {
    1: tm('m1'),
    2: tm('m2'),
    3: tm('m3'),
    4: tm('m4'),
  };

  // Teasers: top 3 findings by severity, top 4 quick wins.
  const topFindings = [...data.findings]
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9))
    .slice(0, 3);
  const topWins = data.quickWins.slice(0, 4);

  return (
    <>
      <div id="overview" className="scroll-mt-24">
        <ReportHero meta={data.meta} overall={data.overall} />
      </div>

      {/* Overall distribution donut + gauge */}
      {overallScored && (
        <section className="mt-6 grid gap-4 lg:grid-cols-3 print:grid-cols-3 print:break-inside-avoid">
          <div className="surface p-5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-medium text-ink-200">{t('overallHealthTitle')}</h2>
              <InfoTip label={t('overallHealthTitle')}>{t('tipOverallHealth')}</InfoTip>
            </div>
            <div className="mt-3">
              <Gauge value={overallGaugeValue(data.overall.healthPct)} animate={!print} strings={cs} />
            </div>
          </div>
          <div className="surface p-5 lg:col-span-2">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-medium text-ink-200">{t('overallDistributionTitle')}</h2>
              <InfoTip label={t('overallDistributionTitle')}>{t('tipDistribution')}</InfoTip>
            </div>
            <div className="mt-3">
              <Donut
                distribution={data.overall.distribution}
                labels={maturityLabels}
                animate={!print}
                strings={cs}
              />
            </div>
          </div>
        </section>
      )}

      {/* Pillar radar */}
      {hasRadar && (
        <section className="surface mt-6 p-6 print:break-inside-avoid">
          <h2 className="text-sm font-medium text-ink-200">{t('radarTitle')}</h2>
          <p className="mt-0.5 text-xs text-ink-500">{t('radarSubtitle')}</p>
          <div className="mt-3">
            <Radar data={radarData} animate={!print} showSelf strings={cs} />
          </div>
        </section>
      )}

      {/* Calibration summary */}
      {hasCalibration && (
        <section className="surface mt-6 p-6 print:break-inside-avoid">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-medium text-ink-200">{t('calibrationSummaryTitle')}</h2>
            <InfoTip label={t('calibrationSummaryTitle')}>{t('tipCalibrationSummary')}</InfoTip>
          </div>
          <p className="mt-0.5 text-xs text-ink-500">{t('calibrationSummarySubtitle')}</p>
          <div className="mt-3">
            <Calibration data={calibData} animate={!print} strings={cs} />
          </div>
        </section>
      )}

      {/* Executive summary */}
      {data.execSummary && (
        <section className="surface mt-6 p-6">
          <h2 className="text-xl font-semibold text-white">{t('execSummaryTitle')}</h2>
          <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-200">
            {data.execSummary}
          </div>
        </section>
      )}

      {/* How to read */}
      <ReportGuide print={print} />

      {/* Teasers — hidden in print (the full lists render later in the linear doc) */}
      {!print && (topFindings.length > 0 || topWins.length > 0) && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {topFindings.length > 0 && (
            <section className="surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-ink-200">{t('topFindingsTitle')}</h2>
                {onGoto && (
                  <TeaserLink label={t('seeAllFindings')} onClick={() => onGoto('findings')} />
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {topFindings.map((f) => {
                  const color = SEVERITY_COLORS[f.severity] ?? '#A3A3A3';
                  return (
                    <li key={f.id} className="flex items-start gap-2.5 text-sm text-ink-200">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="flex-1 leading-snug">{f.title}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {topWins.length > 0 && (
            <section className="surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-ink-200">{t('topQuickWinsTitle')}</h2>
                {onGoto && (
                  <TeaserLink label={t('seeAllRoadmap')} onClick={() => onGoto('roadmap')} />
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {topWins.map((w) => {
                  const color = SEVERITY_COLORS[w.severity] ?? '#A3A3A3';
                  return (
                    <li key={w.id} className="flex items-start gap-2.5 text-sm text-ink-200">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="flex-1 leading-snug">{w.title}</span>
                      <span className="font-mono text-[10px] text-ink-500">{w.effort}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function TeaserLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-ink-300 transition-colors hover:text-white ring-focus"
    >
      {label}
      <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
    </button>
  );
}
