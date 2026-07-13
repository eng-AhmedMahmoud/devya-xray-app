'use client';

import type { ComponentType, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import type { ReportPayload } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/ui';
import type { DonutProps, RadarProps } from './charts';
import { SnapshotUpsell } from './snapshot-upsell';

/**
 * Self-assessment snapshot rendition (meta.verified === false). Everything here
 * is self-reported: no verified maturity, no calibration deltas. We surface the
 * team's self health, a self radar, and per-pillar self distribution, wrapped in
 * clear "not yet verified" framing plus a Book-a-Full-X-Ray upsell.
 */
export function SnapshotView({
  data,
  print,
  Radar,
  Donut,
}: {
  data: ReportPayload;
  print: boolean;
  Radar: ComponentType<RadarProps>;
  Donut: ComponentType<DonutProps>;
}) {
  const t = useTranslations('report');
  const tm = useTranslations('maturity');
  const locale = useLocale();

  const published = formatDate(locale, data.meta.publishedAt);
  const pillars = [...data.pillars].sort((a, b) => a.order - b.order);
  const radarData = pillars.map((p) => ({
    name: p.name,
    value: p.stats.selfHealthPct,
  }));
  const labels: Record<number, string> = {
    1: tm('m1'),
    2: tm('m2'),
    3: tm('m3'),
    4: tm('m4'),
  };

  return (
    <>
      {/* --------------------------- Snapshot hero --------------------------- */}
      <section className="pt-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-medium text-ink-100">
            <Lock className="h-3 w-3 text-ink-300" />
            {t('snapshotBadge')}
          </span>
          {published && (
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-ink-400">
              {t('published', { date: published })}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {data.meta.companyName}
        </h1>
        <p className="mt-1 text-ink-400">{data.meta.framework.name}</p>

        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 text-sm leading-relaxed text-ink-200">
          {t('snapshotDisclaimer')}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
          <Kpi label={t('selfHealthLabel')}>
            <span className="text-ink-100">{formatNumber(data.overall.selfHealthPct)}%</span>
          </Kpi>
          <Kpi label={t('evaluatedLabel')}>
            {data.overall.evaluated}
            <span className="text-ink-500"> / </span>
            {data.overall.scored}
          </Kpi>
          <Kpi label={t('snapshotNotVerified')}>
            <span className="text-sm font-normal normal-case text-ink-400">
              {t('snapshotBadge')}
            </span>
          </Kpi>
        </div>
      </section>

      {/* --------------------------- Self radar ------------------------------ */}
      {radarData.length > 0 && (
        <section className="surface mt-6 p-6 print:break-inside-avoid">
          <h2 className="text-sm font-medium text-ink-200">{t('snapshotRadarTitle')}</h2>
          <div className="mt-3">
            <Radar data={radarData} animate={!print} />
          </div>
        </section>
      )}

      {/* ------------------------ Per-pillar self view ----------------------- */}
      {pillars.map((pillar) => (
        <section key={pillar.key} className="mt-10 print:break-inside-avoid">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-300">{pillar.code}</span>
            <h2 className="text-xl font-semibold text-white">{pillar.name}</h2>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <MiniKpi
              label={t('selfHealthLabel')}
              value={`${formatNumber(pillar.stats.selfHealthPct)}%`}
            />
            <div className="surface p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-ink-200">
                {t('snapshotDistributionTitle')}
              </h3>
              <div className="mt-3">
                <Donut
                  distribution={pillar.stats.selfDistribution}
                  labels={labels}
                  animate={!print}
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ------------------------------- Upsell ------------------------------ */}
      <SnapshotUpsell />
    </>
  );
}

function Kpi({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="surface p-4">
      <div className="text-[11px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold text-white">{children}</div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
