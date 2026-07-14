'use client';

import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { DECISION_BANDS, MATURITY_COLORS } from '@/lib/ui';

/**
 * Reusable maturity-scale legend (levels 1–4, Absent → Established). Rendered in
 * the guide and beside per-pillar charts so the four colors always carry their
 * meaning. `compact` drops the numbered chips for tight chart footers.
 */
export function MaturityLegend({ compact = false }: { compact?: boolean }) {
  const tm = useTranslations('maturity');
  const levels = [1, 2, 3, 4] as const;
  return (
    <ul
      className={clsx(
        'flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-300',
        compact && 'gap-x-3',
      )}
    >
      {levels.map((l) => (
        <li key={l} className="flex items-center gap-1.5">
          <span
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] font-mono text-[9px] font-semibold text-ink-950"
            style={{ background: MATURITY_COLORS[l] }}
          >
            {l}
          </span>
          <span className={compact ? 'text-ink-400' : ''}>{tm(`m${l}`)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Decision-band legend — the six urgency bands (Maintain → Critical) with a
 * gradient rail plus a labeled key, so the urgency index reads as a decision,
 * not a bare number.
 */
export function DecisionBandLegend({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('report');
  return (
    <div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full"
        aria-hidden
      >
        {DECISION_BANDS.map((b) => (
          <span key={b.key} className="flex-1" style={{ background: b.color }} />
        ))}
      </div>
      <ul
        className={clsx(
          'mt-2 grid gap-x-4 gap-y-1 text-[11px] text-ink-300',
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3',
        )}
      >
        {DECISION_BANDS.map((b) => (
          <li key={b.key} className="flex items-baseline gap-1.5">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ background: b.color }}
            />
            <span>
              <span className="text-ink-100">{t(`band${b.key}`)}</span>
              {!compact && (
                <span className="block text-[10px] text-ink-500">
                  {t(`band${b.key}Desc`)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
