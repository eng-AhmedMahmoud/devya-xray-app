'use client';

import { useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { ReportPillar, ReportPracticeRow } from '@/lib/api';
import {
  MATURITY_COLORS,
  decisionBand,
  distributionHealth,
  distributionTotal,
  formatNumber,
} from '@/lib/ui';
import type { DonutProps, MaturityBarProps } from './charts';
import { InfoTip } from './ui/info-tip';
import { MaturityLegend } from './ui/legends';
import { useChartStrings } from './ui/use-chart-strings';

export function PillarSection({
  pillar,
  Donut,
  Bar,
  print,
}: {
  pillar: ReportPillar;
  Donut: ComponentType<DonutProps>;
  Bar: ComponentType<MaturityBarProps>;
  print: boolean;
}) {
  const t = useTranslations('report');
  const tm = useTranslations('maturity');
  const cs = useChartStrings();
  const s = pillar.stats;
  const labels: Record<number, string> = {
    1: tm('m1'),
    2: tm('m2'),
    3: tm('m3'),
    4: tm('m4'),
  };
  const notes = pillar.notes ?? {};
  const hasNotes = Boolean(notes.strengths || notes.gaps || notes.consultantNotes);
  const scoredCount = distributionTotal(s.distribution);
  const isScored = scoredCount > 0;
  const band = decisionBand(s.urgencyIndex);

  // Group practices by sub-category so the pillar reads as an outline.
  const groups = groupBySubCategory(pillar.practices);

  return (
    <section id={`pillar-${pillar.key}`} className="mt-12 scroll-mt-24 print:break-before-page">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-ink-300">{pillar.code}</span>
        <h2 className="text-xl font-semibold text-white">{pillar.name}</h2>
      </div>

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
        <MiniKpi
          label={t('healthLabel')}
          value={isScored ? `${formatNumber(s.healthPct)}%` : t('notScoredShort')}
          tip={t('tipHealth')}
        />
        <MiniKpi
          label={t('urgencyLabel')}
          value={isScored ? formatNumber(s.urgencyIndex) : '—'}
          tip={t('tipUrgency')}
          accent={isScored ? band.color : undefined}
          sub={isScored ? t(`band${band.key}`) : undefined}
        />
        <MiniKpi
          label={t('evaluatedLabel')}
          value={`${s.evaluated} / ${s.scored}`}
          tip={t('tipEvaluated')}
        />
        <div className="surface p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-ink-500">
            {t('calibrationLabel')}
            <InfoTip label={t('calibrationLabel')}>{t('tipCalibration')}</InfoTip>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-2.5 text-sm font-medium">
            <span className="text-red-400">▲ {s.calibration.overclaimed}</span>
            <span className="text-ink-200">✓ {s.calibration.calibrated}</span>
            <span className="text-emerald-400">▼ {s.calibration.underclaimed}</span>
          </div>
        </div>
      </div>

      {!isScored && (
        <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-ink-400 print:break-inside-avoid">
          {t('pillarNotScored')}
        </div>
      )}

      {/* Strengths / gaps at a glance */}
      {(notes.strengths || notes.gaps) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {notes.strengths && (
            <Glance
              title={t('atAGlanceStrengths')}
              text={notes.strengths}
              tone="emerald"
            />
          )}
          {notes.gaps && (
            <Glance title={t('atAGlanceGaps')} text={notes.gaps} tone="red" />
          )}
        </div>
      )}

      {/* Two chart views: distribution donut + stacked maturity bar. */}
      {isScored && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3 print:grid-cols-1">
          <div className="surface p-5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-ink-200">{t('distributionTitle')}</h3>
              <InfoTip label={t('distributionTitle')}>{t('tipDistribution')}</InfoTip>
            </div>
            <div className="mt-3">
              <Donut
                distribution={s.distribution}
                labels={labels}
                animate={!print}
                strings={print ? undefined : cs}
              />
            </div>
          </div>

          <div className="surface p-5 lg:col-span-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-ink-200">{t('byLevelTitle')}</h3>
              <InfoTip label={t('byLevelTitle')}>{t('tipByLevel')}</InfoTip>
            </div>
            <div className="mt-4">
              <Bar
                distribution={s.distribution}
                labels={labels}
                animate={!print}
                strings={print ? undefined : cs}
              />
            </div>
            <div className="mt-3">
              <MaturityLegend compact />
            </div>
          </div>
        </div>
      )}

      {/* Claim-vs-verified, grouped by sub-category (collapsible). */}
      <div className="mt-4 surface p-5 print:break-inside-avoid">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-ink-200">{t('claimVsVerified')}</h3>
          <InfoTip label={t('claimVsVerified')}>{t('tipClaimVsVerified')}</InfoTip>
        </div>
        <div className="mt-3 space-y-2.5">
          {groups.map((g) => (
            <SubCategoryGroup
              key={g.name}
              group={g}
              labels={labels}
              print={print}
            />
          ))}
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

/* ------------------------------ Sub-categories ---------------------------- */

type Group = { name: string; rows: ReportPracticeRow[] };

function groupBySubCategory(rows: ReportPracticeRow[]): Group[] {
  const map = new Map<string, ReportPracticeRow[]>();
  for (const row of rows) {
    const key = row.subCategory?.trim() || '__general__';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return [...map.entries()].map(([name, r]) => ({ name, rows: r }));
}

function groupDistribution(rows: ReportPracticeRow[]): Record<string, number> {
  const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
  for (const r of rows) {
    if (r.verifiedMaturity != null) dist[String(r.verifiedMaturity)]++;
  }
  return dist;
}

function SubCategoryGroup({
  group,
  labels,
  print,
}: {
  group: Group;
  labels: Record<number, string>;
  print: boolean;
}) {
  const t = useTranslations('report');
  const [open, setOpen] = useState(true);
  const title = group.name === '__general__' ? t('generalGroup') : group.name;
  const dist = groupDistribution(group.rows);
  const avg = distributionHealth(dist);
  const scored = group.rows.filter((r) => r.verifiedMaturity != null).length;

  // In print, always render the table open (no toggling on paper).
  const expanded = print || open;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.015]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start ring-focus print:cursor-default"
      >
        {!print && (
          <ChevronDown
            className={clsx(
              'h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform',
              !expanded && '-rotate-90',
            )}
            aria-hidden
          />
        )}
        <span className="flex-1 text-sm font-medium text-ink-100">{title}</span>
        <span className="hidden items-center gap-2 sm:flex">
          <MiniDistBar dist={dist} />
        </span>
        <span className="text-[11px] text-ink-500">
          {avg == null ? t('notScoredShort') : `${avg}%`}
          <span className="text-ink-700"> · {scored}/{group.rows.length}</span>
        </span>
      </button>

      {expanded && (
        <div className="overflow-x-auto border-t border-white/5 px-1 pb-1 print:overflow-visible">
          <table className="w-full text-sm">
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
              {group.rows.map((row) => (
                <tr key={row.code}>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-ink-500">{row.code}</span>
                      <span className="text-ink-100">{row.name}</span>
                    </div>
                    {row.whyItMatters && (
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">
                        {row.whyItMatters}
                      </p>
                    )}
                    {row.consultantNote && (
                      <p className="mt-1 text-xs text-ink-400">{row.consultantNote}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <MaturityCell value={row.selfMaturity} labels={labels} print={print} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <MaturityCell value={row.verifiedMaturity} labels={labels} print={print} />
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
      )}
    </div>
  );
}

/** Tiny inline stacked bar summarizing a sub-category's verified maturity. */
function MiniDistBar({ dist }: { dist: Record<string, number> }) {
  const total = distributionTotal(dist);
  if (total === 0) return null;
  return (
    <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-white/5" dir="ltr">
      {[1, 2, 3, 4].map((l) => {
        const v = dist[String(l)] ?? 0;
        if (v === 0) return null;
        return (
          <span
            key={l}
            style={{ background: MATURITY_COLORS[l], width: `${(v / total) * 100}%` }}
          />
        );
      })}
    </span>
  );
}

/* -------------------------------- Primitives ------------------------------ */

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

function MaturityCell({
  value,
  labels,
  print,
}: {
  value: number | null;
  labels: Record<number, string>;
  print: boolean;
}) {
  const t = useTranslations('report');
  if (value == null) return <span className="text-ink-600">—</span>;
  const color = MATURITY_COLORS[value] ?? '#A3A3A3';
  const chip = (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-medium"
      style={{ color, background: `${color}1F` }}
    >
      {value}
    </span>
  );
  if (print) return chip;
  return (
    <span className="inline-flex items-center gap-1">
      {chip}
      <InfoTip label={String(labels[value] ?? value)} align="center">
        <span className="font-medium text-ink-100">
          {value} · {labels[value]}
        </span>
        <span className="mt-1 block text-ink-400">{t(`maturityHint${value}`)}</span>
      </InfoTip>
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

function MiniKpi({
  label,
  value,
  tip,
  sub,
  accent,
}: {
  label: string;
  value: string;
  tip?: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="surface p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-ink-500">
        {label}
        {tip && <InfoTip label={label}>{tip}</InfoTip>}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-white">{value}</span>
        {sub && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
            style={
              accent
                ? { color: accent, background: `${accent}1F` }
                : undefined
            }
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function Glance({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: 'emerald' | 'red';
}) {
  const border = tone === 'emerald' ? 'border-emerald-500/20' : 'border-red-500/20';
  const bg = tone === 'emerald' ? 'bg-emerald-500/[0.04]' : 'bg-red-500/[0.04]';
  const dot = tone === 'emerald' ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className={`rounded-lg border ${border} ${bg} p-3.5 print:break-inside-avoid`}>
      <h4 className={`text-xs font-semibold ${dot}`}>{title}</h4>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-300">{text}</p>
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
