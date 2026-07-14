'use client';

import { useTranslations } from 'next-intl';
import type { RoadmapBucket } from '@/lib/api';
import { SEVERITY_COLORS } from '@/lib/ui';

const BUCKET_KEYS: Record<string, string> = {
  '30 days': 'bucket30',
  '90 days': 'bucket90',
  '2 quarters': 'bucket2q',
};

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function RoadmapSection({ roadmap }: { roadmap: RoadmapBucket[] }) {
  const t = useTranslations('report');
  const ts = useTranslations('severity');

  return (
    <section className="mt-12 print:break-before-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{t('roadmapTitle')}</h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-400">
          {SEVERITIES.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SEVERITY_COLORS[s] }}
              />
              {ts(s)}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-1 text-xs text-ink-500">{t('roadmapSubtitle')}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3 print:grid-cols-3">
        {roadmap.map((bucket) => {
          const key = BUCKET_KEYS[bucket.timeline];
          return (
            <div key={bucket.timeline} className="surface p-5 print:break-inside-avoid">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-ink-100">
                  {key ? t(key) : bucket.timeline}
                </h3>
                <span className="font-mono text-[10px] text-ink-500">
                  {bucket.items.length}
                </span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {bucket.items.map((f) => (
                  <li
                    key={f.id}
                    title={`${ts(f.severity)} · ${t('effortChip', { effort: f.effort })}`}
                    className="flex items-start gap-2 rounded-md px-1 py-1 text-sm text-ink-200 transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: SEVERITY_COLORS[f.severity] ?? '#A3A3A3' }}
                    />
                    <span className="flex-1 leading-snug">{f.title}</span>
                    <span className="font-mono text-[10px] text-ink-500">{f.effort}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
