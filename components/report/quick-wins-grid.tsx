'use client';

import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { QuickWin } from '@/lib/api';
import { SEVERITY_COLORS, clampRank } from '@/lib/ui';

const COLS = 5; // effortRank 1 (XS) → 5 (XL)
const ROWS = 4; // impactRank 1 (highest impact) → 4 (lowest)

export function QuickWinsGrid({ items }: { items: QuickWin[] }) {
  const t = useTranslations('report');
  const ts = useTranslations('severity');

  // Bucket items into a ROWS×COLS matrix so colliding ranks stack in one cell.
  const cells: QuickWin[][][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => []),
  );
  for (const win of items) {
    const row = clampRank(win.impactRank, ROWS) - 1;
    const col = clampRank(win.effortRank, COLS) - 1;
    cells[row][col].push(win);
  }

  return (
    <section className="mt-10 print:break-before-page">
      <h2 className="text-xl font-semibold text-white">{t('quickWinsTitle')}</h2>
      <div className="mt-4 flex gap-3">
        <div className="flex flex-col justify-between py-1 text-[10px] uppercase tracking-wide text-ink-500">
          <span>{t('highImpact')}</span>
          <span>{t('lowImpact')}</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 grid-rows-4 gap-1.5">
            {cells.flatMap((rowItems, r) =>
              rowItems.map((cellItems, c) => (
                <div
                  key={`${r}-${c}`}
                  className={clsx(
                    'min-h-[64px] space-y-1 rounded-md border p-1.5',
                    r < 2 && c < 2
                      ? 'border-white/25 bg-white/5'
                      : 'border-white/5 bg-white/[0.02]',
                  )}
                >
                  {cellItems.map((win) => (
                    <div
                      key={win.id}
                      title={ts(win.severity)}
                      className="rounded border border-white/10 bg-ink-800/80 px-2 py-1 text-[11px] leading-snug text-ink-100"
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
    </section>
  );
}
