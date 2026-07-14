'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { Finding } from '@/lib/api';
import { SEVERITY_COLORS, SEVERITY_ORDER } from '@/lib/ui';
import { InfoTip } from './ui/info-tip';

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function FindingsSection({ findings }: { findings: Finding[] }) {
  const t = useTranslations('report');
  const ts = useTranslations('severity');
  const [filter, setFilter] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...findings].sort(
        (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
      ),
    [findings],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of findings) c[f.severity] = (c[f.severity] ?? 0) + 1;
    return c;
  }, [findings]);

  const visible = filter ? sorted.filter((f) => f.severity === filter) : sorted;

  return (
    <section className="mt-12 print:break-before-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{t('findingsTitle')}</h2>
        {/* Severity filter — interactive only, dropped in print. */}
        <div className="flex flex-wrap gap-1.5 print:hidden">
          <FilterChip
            active={filter === null}
            onClick={() => setFilter(null)}
            label={t('filterAll')}
            count={findings.length}
          />
          {SEVERITIES.filter((s) => counts[s]).map((s) => (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
              label={ts(s)}
              count={counts[s]}
              color={SEVERITY_COLORS[s]}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {visible.map((f) => {
          const color = SEVERITY_COLORS[f.severity] ?? '#A3A3A3';
          return (
            <article
              key={f.id}
              className="surface p-5 print:break-inside-avoid"
              style={{ borderInlineStart: `3px solid ${color}` }}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1">
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
                  <InfoTip label={ts(f.severity)}>{t('tipSeverity')}</InfoTip>
                </span>
                <h3 className="flex-1 text-base font-medium text-white">{f.title}</h3>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-300">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
                  {t('effortChip', { effort: f.effort })}
                  {f.effortHours != null && (
                    <span className="text-ink-500">
                      {' '}
                      · {t('hoursSuffix', { hours: f.effortHours })}
                    </span>
                  )}
                  <InfoTip label={t('effortLabel')}>{t('tipEffort')}</InfoTip>
                </span>
                {f.ownerRole && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5">
                    {t('ownerChip', { role: f.ownerRole })}
                  </span>
                )}
                {f.timeline && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
                    {t('timelineChip', { timeline: f.timeline })}
                    <InfoTip label={t('timelineLabel')}>{t('tipTimeline')}</InfoTip>
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
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-ink-600">
                    {t('linkedPractices')}
                  </span>
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

function FilterChip({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ring-focus',
        active
          ? 'border-white/25 bg-white/10 text-white'
          : 'border-white/10 text-ink-400 hover:text-ink-100',
      )}
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      )}
      {label}
      <span className="font-mono text-ink-500">{count}</span>
    </button>
  );
}
