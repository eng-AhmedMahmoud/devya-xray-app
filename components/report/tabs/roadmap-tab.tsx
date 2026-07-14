'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { QuickWin, RoadmapBucket } from '@/lib/api';
import { EFFORT_ORDER, effortByTimelineRows } from '@/lib/ui';
import type { ChartStrings, EffortByTimelineProps } from '../charts';
import { RoadmapSection } from '../roadmap-section';
import { QuickWinsGrid } from '../quick-wins-grid';
import { InfoTip } from '../ui/info-tip';

const BUCKET_KEYS: Record<string, string> = {
  '30 days': 'bucket30',
  '90 days': 'bucket90',
  '2 quarters': 'bucket2q',
};

/**
 * Roadmap tab — the timeline buckets, the impact×effort quick-win matrix, and a
 * new stacked "effort across the timeline" chart. Empty state when there's no
 * roadmap and no quick wins.
 */
export function RoadmapTab({
  roadmap,
  quickWins,
  EffortTimeline,
  strings,
  print,
}: {
  roadmap: RoadmapBucket[];
  quickWins: QuickWin[];
  EffortTimeline: ComponentType<EffortByTimelineProps>;
  strings: ChartStrings;
  print: boolean;
}) {
  const t = useTranslations('report');
  const cs = print ? undefined : strings;

  if (roadmap.length === 0 && quickWins.length === 0) {
    return (
      <section className="print:break-before-page">
        <h2 className="text-xl font-semibold text-white">{t('roadmapTitle')}</h2>
        <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-ink-400">
          {t('roadmapEmpty')}
        </div>
      </section>
    );
  }

  const timelineRows = effortByTimelineRows(roadmap);
  const effortsPresent = EFFORT_ORDER.filter((e) =>
    timelineRows.some((r) => (r[e] as number) > 0),
  );
  const labelOf = (raw: string) => {
    const k = BUCKET_KEYS[raw];
    return k ? t(k) : raw;
  };

  return (
    <div className="print:break-before-page">
      {roadmap.length > 0 && (
        <div id="roadmap" className="scroll-mt-24">
          <RoadmapSection roadmap={roadmap} />
        </div>
      )}

      {effortsPresent.length > 0 && (
        <section className="mt-8 print:break-inside-avoid">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-semibold text-white">{t('effortTimelineTitle')}</h2>
            <InfoTip label={t('effortTimelineTitle')}>{t('tipEffortTimeline')}</InfoTip>
          </div>
          <p className="mt-1 text-xs text-ink-500">{t('effortTimelineSubtitle')}</p>
          <div className="surface mt-4 p-5">
            <EffortTimeline
              data={timelineRows}
              efforts={effortsPresent}
              labelOf={labelOf}
              animate={!print}
              strings={cs}
            />
          </div>
        </section>
      )}

      {quickWins.length > 0 && (
        <div id="quickwins" className="scroll-mt-24">
          <QuickWinsGrid items={quickWins} />
        </div>
      )}
    </div>
  );
}
