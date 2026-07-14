'use client';

import { useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { ReportPillar } from '@/lib/api';
import {
  distributionTotal,
  maturityAcrossPillarsRows,
  pillarCompareRows,
} from '@/lib/ui';
import type {
  ChartStrings,
  DonutProps,
  MaturityAcrossProps,
  MaturityBarProps,
  PillarCompareProps,
} from '../charts';
import { PillarSection } from '../pillar-section';
import { InfoTip } from '../ui/info-tip';

/**
 * Pillars tab. Opens with a "Compare all pillars" sub-view (health-vs-urgency
 * grouped bar + cross-pillar maturity stack), then a chip picker to drill into
 * one pillar's full detail. In print, the picker collapses and every pillar
 * renders expanded, one after another.
 */
export function PillarsTab({
  pillars,
  Donut,
  Bar,
  Compare,
  MaturityAcross,
  strings,
  print,
}: {
  pillars: ReportPillar[];
  Donut: ComponentType<DonutProps>;
  Bar: ComponentType<MaturityBarProps>;
  Compare: ComponentType<PillarCompareProps>;
  MaturityAcross: ComponentType<MaturityAcrossProps>;
  strings: ChartStrings;
  print: boolean;
}) {
  const t = useTranslations('report');
  const cs = print ? undefined : strings;
  const [activeKey, setActiveKey] = useState<string>(pillars[0]?.key ?? '');

  const compareData = pillarCompareRows(pillars);
  const maturityData = maturityAcrossPillarsRows(pillars);
  const hasCompare = compareData.length > 0;

  const selected = pillars.find((p) => p.key === activeKey) ?? pillars[0];

  return (
    <>
      {/* Compare all pillars */}
      {hasCompare && (
        <section className="print:break-inside-avoid">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-semibold text-white">{t('compareTitle')}</h2>
            <InfoTip label={t('compareTitle')}>{t('tipCompare')}</InfoTip>
          </div>
          <p className="mt-1 text-xs text-ink-500">{t('compareSubtitle')}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface p-5">
              <h3 className="text-sm font-medium text-ink-200">{t('compareHealthUrgencyTitle')}</h3>
              <div className="mt-3">
                <Compare data={compareData} animate={!print} strings={cs} />
              </div>
            </div>
            <div className="surface p-5">
              <h3 className="text-sm font-medium text-ink-200">{t('compareMaturityTitle')}</h3>
              <div className="mt-3">
                <MaturityAcross data={maturityData} animate={!print} strings={cs} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive: picker + one pillar. Print: all pillars, expanded. */}
      {print ? (
        <div className="mt-10">
          {pillars.map((pillar) => (
            <PillarSection
              key={pillar.key}
              pillar={pillar}
              Donut={Donut}
              Bar={Bar}
              print
            />
          ))}
        </div>
      ) : (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">{t('pillarDetailTitle')}</h2>
          <div
            role="tablist"
            aria-label={t('pillarPickerLabel')}
            className="scrollbar-none mt-3 flex flex-wrap gap-2"
          >
            {pillars.map((p) => {
              const on = p.key === selected?.key;
              const scored = distributionTotal(p.stats.distribution) > 0;
              return (
                <button
                  key={p.key}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setActiveKey(p.key)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ring-focus',
                    on
                      ? 'border-white/25 bg-white/10 text-white'
                      : 'border-white/10 text-ink-400 hover:text-ink-100',
                  )}
                >
                  <span className="font-mono text-[10px] text-ink-500">{p.code}</span>
                  <span>{p.name}</span>
                  {!scored && (
                    <span className="text-[9px] uppercase tracking-wide text-ink-600">
                      {t('notScoredShort')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="tab-fade-in mt-2" key={selected.key}>
              <PillarSection
                pillar={selected}
                Donut={Donut}
                Bar={Bar}
                print={false}
              />
            </div>
          )}
        </section>
      )}
    </>
  );
}
