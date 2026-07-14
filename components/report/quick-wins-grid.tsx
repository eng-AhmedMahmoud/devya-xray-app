'use client';

import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { QuickWin } from '@/lib/api';
import { SEVERITY_COLORS, clampRank } from '@/lib/ui';
import { InfoTip } from './ui/info-tip';

const COLS = 5; // effortRank 1 (XS) → 5 (XL)
const ROWS = 4; // impactRank 1 (highest impact) → 4 (lowest)

/**
 * Impact × effort matrix. The grid is split into four quadrants:
 *   high impact + low effort  → "quick wins" (do first, top-left)
 *   high impact + high effort → "major projects" (plan)
 *   low impact  + low effort  → "fill-ins"
 *   low impact  + high effort → "deprioritize"
 * Each quadrant is labeled and the top-left is highlighted.
 */
export function QuickWinsGrid({ items }: { items: QuickWin[] }) {
  const t = useTranslations('report');
  const ts = useTranslations('severity');

  const cells: QuickWin[][][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => []),
  );
  for (const win of items) {
    const row = clampRank(win.impactRank, ROWS) - 1;
    const col = clampRank(win.effortRank, COLS) - 1;
    cells[row][col].push(win);
  }

  return (
    <section className="mt-12 print:break-before-page">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-white">{t('quickWinsTitle')}</h2>
        <InfoTip label={t('quickWinsTitle')}>{t('tipQuickWins')}</InfoTip>
      </div>
      <p className="mt-1 text-xs text-ink-500">{t('quickWinsSubtitle')}</p>

      <div className="mt-4 flex gap-3">
        <div className="flex flex-col justify-between py-1 text-[10px] uppercase tracking-wide text-ink-500">
          <span>{t('highImpact')}</span>
          <span>{t('lowImpact')}</span>
        </div>
        <div className="flex-1">
          <div className="relative grid grid-cols-5 grid-rows-4 gap-1.5">
            {/* Quadrant labels — faint watermarks behind the cells. */}
            <QuadrantLabel className="left-0 top-0" text={t('quadDoFirst')} strong />
            <QuadrantLabel className="right-0 top-0" text={t('quadPlan')} />
            <QuadrantLabel className="bottom-6 left-0" text={t('quadFillIn')} />
            <QuadrantLabel className="bottom-6 right-0" text={t('quadDeprioritize')} />

            {cells.flatMap((rowItems, r) =>
              rowItems.map((cellItems, c) => (
                <div
                  key={`${r}-${c}`}
                  className={clsx(
                    'relative z-10 min-h-[64px] space-y-1 rounded-md border p-1.5',
                    r < 2 && c < 2
                      ? 'border-white/25 bg-white/5'
                      : 'border-white/5 bg-white/[0.02]',
                  )}
                >
                  {cellItems.map((win) => (
                    <div
                      key={win.id}
                      title={`${ts(win.severity)}`}
                      className="rounded border border-white/10 bg-ink-800/80 px-2 py-1 text-[11px] leading-snug text-ink-100 transition-colors hover:border-white/25 hover:bg-ink-750"
                    >
                      <span
                        className="me-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{ background: SEVERITY_COLORS[win.severity] ?? '#A3A3A3' }}
                      />
                      {win.title}
                    </div>
                  ))}
                </div>
              )),
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wide text-ink-500">
            <span>{t('lowEffort')}</span>
            <span>{t('highEffort')}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-ink-400">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_COLORS[s] }} />
            {ts(s)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuadrantLabel({
  text,
  className,
  strong = false,
}: {
  text: string;
  className: string;
  strong?: boolean;
}) {
  return (
    <span
      className={clsx(
        'pointer-events-none absolute z-0 px-1 text-[9px] font-semibold uppercase tracking-wide print:hidden',
        strong ? 'text-ink-400' : 'text-ink-600',
        className,
      )}
    >
      {text}
    </span>
  );
}
