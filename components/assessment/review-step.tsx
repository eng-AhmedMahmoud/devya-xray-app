'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import type { Pillar, Practice } from '@/lib/api';
import { loc } from '@/lib/ui';
import type { LocalResponse } from './practice-card';

export function ReviewStep({
  pillars,
  practicesByPillar,
  responses,
  answered,
  total,
  submitting,
  submitError,
  onJump,
  onSubmitClick,
}: {
  pillars: Pillar[];
  practicesByPillar: Record<string, Practice[]>;
  responses: Record<string, LocalResponse>;
  answered: number;
  total: number;
  submitting: boolean;
  submitError: string | null;
  onJump: (stepIndex: number) => void;
  onSubmitClick: () => void;
}) {
  const t = useTranslations('assessment');
  const locale = useLocale();

  const unanswered = pillars.flatMap((pillar, i) =>
    (practicesByPillar[pillar.key] ?? [])
      .filter((p) => responses[p.code]?.selfMaturity == null)
      .map((practice) => ({ practice, pillar, stepIndex: i + 1 })),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('reviewTitle')}</h2>
        <p className="mt-1 text-sm text-ink-400">
          {t('reviewAnswered', { answered, total })}
        </p>
      </div>

      <div className="surface divide-y divide-white/5">
        {pillars.map((pillar, i) => {
          const list = practicesByPillar[pillar.key] ?? [];
          const a = list.filter((p) => responses[p.code]?.selfMaturity != null).length;
          const complete = list.length > 0 && a === list.length;
          return (
            <button
              key={pillar.key}
              type="button"
              onClick={() => onJump(i + 1)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-start transition-colors hover:bg-white/[0.03]"
            >
              <span className="text-sm text-ink-100">
                <span className="me-2 font-mono text-[11px] text-ink-500">{pillar.code}</span>
                {pillar.name}
              </span>
              <span
                className={clsx(
                  'inline-flex items-center gap-1.5 font-mono text-xs',
                  complete ? 'text-emerald-400' : 'text-ink-400',
                )}
              >
                {complete && <Check className="h-3.5 w-3.5" />}
                {a}/{list.length}
              </span>
            </button>
          );
        })}
      </div>

      {unanswered.length > 0 ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <h3 className="text-sm font-medium text-amber-400">{t('unansweredTitle')}</h3>
          <ul className="mt-3 space-y-2">
            {unanswered.map(({ practice, pillar, stepIndex }) => (
              <li key={practice.code}>
                <button
                  type="button"
                  onClick={() => onJump(stepIndex)}
                  className="group flex w-full items-center justify-between gap-3 text-start"
                >
                  <span className="text-sm text-ink-300 transition-colors group-hover:text-white">
                    {loc(locale, practice.name, practice.nameAr)}
                  </span>
                  <span className="shrink-0 text-xs text-ink-500">{pillar.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <Check className="h-4 w-4" />
          {t('allAnswered')}
        </p>
      )}

      <div className="surface-strong p-5">
        <p className="text-sm text-ink-300">{t('submitNote')}</p>
        {answered === 0 && (
          <p className="mt-2 text-xs text-amber-400">{t('submitEmpty')}</p>
        )}
        {submitError && <p className="mt-2 text-xs text-red-400">{submitError}</p>}
        <button
          type="button"
          disabled={answered === 0 || submitting}
          onClick={onSubmitClick}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40 ring-focus"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </div>
  );
}
