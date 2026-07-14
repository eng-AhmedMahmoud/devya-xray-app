'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { OverallStats, ReportMeta } from '@/lib/api';
import { decisionBand, formatDate, formatNumber } from '@/lib/ui';
import { InfoTip } from './ui/info-tip';

export function ReportHero({
  meta,
  overall,
}: {
  meta: ReportMeta;
  overall: OverallStats;
}) {
  const t = useTranslations('report');
  const locale = useLocale();

  const published = formatDate(locale, meta.publishedAt);
  const workshop = formatDate(locale, meta.workshopDate);
  const band = decisionBand(overall.urgencyIndex);

  return (
    <section className="pt-8">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium text-ink-200">
          {t('version', { version: String(meta.reportVersion) })}
        </span>
        {published && (
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-ink-400">
            {t('published', { date: published })}
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {meta.companyName}
      </h1>
      <p className="mt-1 text-ink-400">{meta.framework.name}</p>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-ink-400">
        {workshop && <span>{t('workshop', { date: workshop })}</span>}
        {meta.leadConsultant && (
          <span>{t('consultant', { name: meta.leadConsultant })}</span>
        )}
        {meta.teamSize != null && meta.teamSize !== '' && (
          <span>{t('teamSize', { size: String(meta.teamSize) })}</span>
        )}
        {meta.stackSummary && <span>{t('stack', { stack: meta.stackSummary })}</span>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4">
        <Kpi label={t('healthLabel')} tip={t('tipHealth')}>
          <span className="text-ink-100">{formatNumber(overall.healthPct)}%</span>
        </Kpi>
        <Kpi label={t('urgencyLabel')} tip={t('tipUrgency')}>
          <span className="flex items-baseline gap-2">
            {formatNumber(overall.urgencyIndex)}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ color: band.color, background: `${band.color}1F` }}
            >
              {t(`band${band.key}`)}
            </span>
          </span>
        </Kpi>
        <Kpi label={t('evaluatedLabel')} tip={t('tipEvaluated')}>
          {overall.evaluated}
          <span className="text-ink-500"> / </span>
          {overall.scored}
        </Kpi>
        <Kpi label={t('calibrationLabel')} tip={t('tipCalibration')}>
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base">
            <span className="text-red-400">▲ {overall.calibration.overclaimed}</span>
            <span className="text-ink-200">✓ {overall.calibration.calibrated}</span>
            <span className="text-emerald-400">▼ {overall.calibration.underclaimed}</span>
          </span>
          <span className="mt-1 block text-[10px] font-normal normal-case text-ink-500">
            {t('overclaimed')} · {t('calibrated')} · {t('underclaimed')}
          </span>
        </Kpi>
      </div>
    </section>
  );
}

function Kpi({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: ReactNode;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-500">
        {label}
        {tip && <InfoTip label={label}>{tip}</InfoTip>}
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-white">{children}</div>
    </div>
  );
}
