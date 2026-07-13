'use client';

import { useTranslations } from 'next-intl';
import type { Finding } from '@/lib/api';
import { SEVERITY_COLORS } from '@/lib/ui';

export function FindingsSection({ findings }: { findings: Finding[] }) {
  const t = useTranslations('report');
  const ts = useTranslations('severity');

  return (
    <section className="mt-10 print:break-before-page">
      <h2 className="text-xl font-semibold text-white">{t('findingsTitle')}</h2>
      <div className="mt-4 space-y-4">
        {findings.map((f) => {
          const color = SEVERITY_COLORS[f.severity] ?? '#A3A3A3';
          return (
            <article
              key={f.id}
              className="surface p-5 print:break-inside-avoid"
              style={{ borderInlineStart: `3px solid ${color}` }}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color,
                    background: `${color}1F`,
                    border: `1px solid ${color}4D`,
                  }}
                >
                  {ts(f.severity)}
                </span>
                <h3 className="flex-1 text-base font-medium text-white">{f.title}</h3>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-300">
                <span className="rounded-full border border-white/10 px-2 py-0.5">
                  {t('effortChip', { effort: f.effort })}
                  {f.effortHours != null && (
                    <span className="text-ink-500">
                      {' '}
                      · {t('hoursSuffix', { hours: f.effortHours })}
                    </span>
                  )}
                </span>
                {f.ownerRole && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5">
                    {t('ownerChip', { role: f.ownerRole })}
                  </span>
                )}
                {f.timeline && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5">
                    {t('timelineChip', { timeline: f.timeline })}
                  </span>
                )}
              </div>

              {f.evidence && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                    {t('evidenceTitle')}
                  </div>
                  <pre
                    dir="ltr"
                    className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-md border border-white/5 bg-black/40 p-3 font-mono text-xs leading-relaxed text-ink-200"
                  >
                    {f.evidence}
                  </pre>
                </div>
              )}

              {f.businessImpact && (
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  <span className="font-medium text-ink-200">{t('impactTitle')}: </span>
                  {f.businessImpact}
                </p>
              )}

              {f.recommendation && (
                <div className="mt-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-ink-100">
                  <span className="mb-1 block text-xs font-medium text-ink-300">
                    {t('recommendationTitle')}
                  </span>
                  {f.recommendation}
                </div>
              )}

              {f.practiceCodes?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.practiceCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-400"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
