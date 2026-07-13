'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { ReportPillar } from '@/lib/api';
import { MATURITY_COLORS, formatNumber } from '@/lib/ui';
import type { DonutProps } from './charts';

export function PillarSection({
  pillar,
  Donut,
  print,
}: {
  pillar: ReportPillar;
  Donut: ComponentType<DonutProps>;
  print: boolean;
}) {
  const t = useTranslations('report');
  const tm = useTranslations('maturity');
  const s = pillar.stats;
  const labels: Record<number, string> = {
    1: tm('m1'),
    2: tm('m2'),
    3: tm('m3'),
    4: tm('m4'),
  };
  const notes = pillar.notes ?? {};
  const hasNotes = Boolean(notes.strengths || notes.gaps || notes.consultantNotes);

  return (
    <section className="mt-10 print:break-before-page">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-ink-300">{pillar.code}</span>
        <h2 className="text-xl font-semibold text-white">{pillar.name}</h2>
      </div>

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
        <MiniKpi label={t('healthLabel')} value={`${formatNumber(s.healthPct)}%`} />
        <MiniKpi label={t('urgencyLabel')} value={formatNumber(s.urgencyIndex)} />
        <MiniKpi label={t('evaluatedLabel')} value={`${s.evaluated} / ${s.scored}`} />
        <div className="surface p-3.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-500">
            {t('calibrationLabel')}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-2.5 text-sm font-medium">
            <span className="text-red-400">▲ {s.calibration.overclaimed}</span>
            <span className="text-ink-200">✓ {s.calibration.calibrated}</span>
            <span className="text-emerald-400">▼ {s.calibration.underclaimed}</span>
          </div>
        </div>
      </div>

      {/* Print: stack donut above a full-width table — side-by-side clips the
          decision column on A4 (overflow-x can't scroll on paper). */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3 print:grid-cols-1">
        <div className="surface p-5">
          <h3 className="text-sm font-medium text-ink-200">{t('distributionTitle')}</h3>
          <div className="mt-3">
            <Donut distribution={s.distribution} labels={labels} animate={!print} />
          </div>
        </div>

        <div className="surface overflow-x-auto p-5 lg:col-span-2 print:col-span-1 print:overflow-visible">
          <h3 className="text-sm font-medium text-ink-200">{t('claimVsVerified')}</h3>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <Th>{t('practiceCol')}</Th>
                <Th center>{t('selfCol')}</Th>
                <Th center>{t('verifiedCol')}</Th>
                <Th center>{t('deltaCol')}</Th>
                <Th center>{t('priorityCol')}</Th>
                <Th>{t('decisionCol')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pillar.practices.map((row) => (
                <tr key={row.code}>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-ink-500">{row.code}</span>
                      <span className="text-ink-100">{row.name}</span>
                      {row.subCategory && (
                        <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-500">
                          {row.subCategory}
                        </span>
                      )}
                    </div>
                    {row.consultantNote && (
                      <p className="mt-1 text-xs text-ink-400">{row.consultantNote}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <MaturityCell value={row.selfMaturity} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <MaturityCell value={row.verifiedMaturity} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <DeltaBadge self={row.selfMaturity} verified={row.verifiedMaturity} />
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-ink-300">
                    {row.priority ?? '—'}
                  </td>
                  <td className="max-w-48 break-words px-3 py-2.5 text-xs text-ink-300">
                    {row.decision ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pillar.attention.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-5 print:break-inside-avoid">
          <h3 className="text-sm font-medium text-amber-400">{t('attentionTitle')}</h3>
          <ul className="mt-2 divide-y divide-white/5">
            {pillar.attention.map((row) => (
              <li key={row.code} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="font-mono text-[10px] text-ink-500">{row.code}</span>
                <span className="flex-1 text-sm text-ink-100">{row.name}</span>
                {row.urgency != null && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-ink-300">
                    {t('urgencyShort')}: {row.urgency}
                  </span>
                )}
                {row.decision && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-ink-200">
                    {row.decision}
                  </span>
                )}
                {row.consultantNote && (
                  <p className="w-full text-xs leading-relaxed text-ink-400">
                    {row.consultantNote}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasNotes && (
        <div className="mt-4 grid gap-3 md:grid-cols-3 print:grid-cols-3">
          {notes.strengths && (
            <NoteBox title={t('strengthsTitle')} color="text-emerald-400" text={notes.strengths} />
          )}
          {notes.gaps && (
            <NoteBox title={t('gapsTitle')} color="text-red-400" text={notes.gaps} />
          )}
          {notes.consultantNotes && (
            <NoteBox title={t('notesTitle')} color="text-ink-200" text={notes.consultantNotes} />
          )}
        </div>
      )}
    </section>
  );
}

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th
      className={`px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-ink-500 ${
        center ? 'text-center' : 'text-start'
      }`}
    >
      {children}
    </th>
  );
}

function MaturityCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-ink-600">—</span>;
  const color = MATURITY_COLORS[value] ?? '#A3A3A3';
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-medium"
      style={{ color, background: `${color}1F` }}
    >
      {value}
    </span>
  );
}

function DeltaBadge({
  self,
  verified,
}: {
  self: number | null;
  verified: number | null;
}) {
  const t = useTranslations('report');
  if (self == null || verified == null) {
    return <span className="text-ink-600">—</span>;
  }
  const delta = self - verified; // positive → company claimed higher than verified
  if (delta > 0) {
    return (
      <span
        title={t('overBadge')}
        className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"
      >
        ▲ {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span
        title={t('underBadge')}
        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
      >
        ▼ {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span
      title={t('okBadge')}
      className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-xs text-ink-300"
    >
      ✓
    </span>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-3.5">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function NoteBox({ title, color, text }: { title: string; color: string; text: string }) {
  return (
    <div className="surface p-4 print:break-inside-avoid">
      <h4 className={`text-xs font-medium ${color}`}>{title}</h4>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-300">{text}</p>
    </div>
  );
}
