'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { Practice } from '@/lib/api';
import { MATURITY_COLORS, loc } from '@/lib/ui';

export type LocalResponse = {
  selfMaturity: number | null;
  selfEvidence: string;
};

export function PracticeCard({
  practice,
  value,
  onChange,
}: {
  practice: Practice;
  value: LocalResponse | undefined;
  onChange: (patch: Partial<LocalResponse>) => void;
}) {
  const locale = useLocale();
  const t = useTranslations('assessment');
  const tm = useTranslations('maturity');
  const [showWhy, setShowWhy] = useState(false);

  const selected = value?.selfMaturity ?? null;
  const name = loc(locale, practice.name, practice.nameAr);
  const description = loc(locale, practice.description, practice.descriptionAr);
  const rubric =
    selected != null ? practice.maturityRubric?.[String(selected)] : undefined;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-ink-400">
          {practice.code}
        </span>
        {practice.subCategory && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-ink-400">
            {practice.subCategory}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-medium text-white">{name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-300">{description}</p>

      {practice.whyItMatters && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            aria-expanded={showWhy}
            className="inline-flex items-center gap-1 text-xs text-ink-300 transition-colors hover:text-ink-100"
          >
            {t('whyItMatters')}
            <ChevronDown
              className={clsx('h-3.5 w-3.5 transition-transform', showWhy && 'rotate-180')}
            />
          </button>
          {showWhy && (
            <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-relaxed text-ink-200">
              {practice.whyItMatters}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((level) => {
          const active = selected === level;
          const color = MATURITY_COLORS[level];
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ selfMaturity: level })}
              aria-pressed={active}
              className={clsx(
                'rounded-md border px-3 py-2.5 text-start text-xs transition-colors ring-focus',
                !active && 'border-white/10 text-ink-300 hover:border-white/25 hover:text-ink-100',
              )}
              style={active ? { borderColor: color, background: `${color}1F`, color } : undefined}
            >
              <span className="block font-mono text-[10px] opacity-70">{level}</span>
              <span className="block font-medium">{tm(`m${level}`)}</span>
            </button>
          );
        })}
      </div>

      {rubric && selected != null && (
        <p
          className="mt-3 border-s-2 ps-3 text-sm leading-relaxed text-ink-300"
          style={{ borderColor: MATURITY_COLORS[selected] }}
        >
          {rubric}
        </p>
      )}

      <div className="mt-4">
        <label
          htmlFor={`evidence-${practice.code}`}
          className="mb-1.5 block text-xs text-ink-400"
        >
          {t('evidenceLabel')}
        </label>
        <textarea
          id={`evidence-${practice.code}`}
          rows={2}
          value={value?.selfEvidence ?? ''}
          onChange={(e) => onChange({ selfEvidence: e.target.value })}
          placeholder={t('evidencePlaceholder')}
          className="w-full resize-y rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-white/25 focus:outline-none"
        />
      </div>
    </div>
  );
}
