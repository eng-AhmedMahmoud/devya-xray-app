'use client';

import { useTranslations } from 'next-intl';
import type { RoadmapBucket } from '@/lib/api';
import { SEVERITY_COLORS } from '@/lib/ui';

const BUCKET_KEYS: Record<string, string> = {
  '30 days': 'bucket30',
  '90 days': 'bucket90',
  '2 quarters': 'bucket2q',
};

export function RoadmapSection({ roadmap }: { roadmap: RoadmapBucket[] }) {
  const t = useTranslations('report');

  return (
    <section className="mt-10 print:break-before-page">
      <h2 className="text-xl font-semibold text-white">{t('roadmapTitle')}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3 print:grid-cols-3">
        {roadmap.map((bucket) => {
          const key = BUCKET_KEYS[bucket.timeline];
          return (
            <div key={bucket.timeline} className="surface p-5 print:break-inside-avoid">
              <h3 className="text-sm font-medium text-ink-100">
                {key ? t(key) : bucket.timeline}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {bucket.items.map((f) => (
                  <li key={f.id} className="flex items-start gap-2 text-sm text-ink-200">
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
