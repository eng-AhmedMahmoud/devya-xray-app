'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, ChevronDown } from 'lucide-react';
import { MaturityLegend, DecisionBandLegend } from './ui/legends';

/**
 * "How to read this report" — a concise, collapsible guide rendered right after
 * the hero. Explains the four-level maturity scale, Health %, Urgency Index,
 * the claim-vs-verified calibration delta, and the decision bands, using small
 * visual legends instead of walls of text. Uses a native <details> so it stays
 * keyboard-accessible and expands automatically in the print/PDF rendition
 * (print:open via [open] is forced below).
 */
export function ReportGuide({ print = false }: { print?: boolean }) {
  const t = useTranslations('report');

  return (
    <details
      className="surface group mt-6 overflow-hidden print:break-inside-avoid [&_summary]:list-none"
      // Open by default on paper so the PDF always includes the key.
      open={print}
    >
      <summary className="flex cursor-pointer items-center gap-3 p-5 ring-focus">
        <BookOpen className="h-4 w-4 text-ink-300" aria-hidden />
        <div className="flex-1">
          <h2 className="text-sm font-medium text-ink-100">{t('guideTitle')}</h2>
          <p className="text-xs text-ink-500">{t('guideSubtitle')}</p>
        </div>
        <ChevronDown
          className="h-4 w-4 text-ink-500 transition-transform group-open:rotate-180 print:hidden"
          aria-hidden
        />
      </summary>

      <div className="grid gap-5 border-t border-white/5 p-5 md:grid-cols-2">
        <GuideBlock title={t('guideMaturityTitle')} body={t('guideMaturityBody')}>
          <MaturityLegend />
        </GuideBlock>

        <GuideBlock title={t('guideHealthTitle')} body={t('guideHealthBody')} />

        <GuideBlock title={t('guideUrgencyTitle')} body={t('guideUrgencyBody')}>
          <DecisionBandLegend />
        </GuideBlock>

        <GuideBlock
          title={t('guideCalibrationTitle')}
          body={t('guideCalibrationBody')}
        >
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-300">
            <li className="flex items-center gap-1.5">
              <span className="text-red-400">▲</span> {t('guideOverclaimed')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-ink-200">✓</span> {t('guideCalibratedItem')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">▼</span> {t('guideUnderclaimed')}
            </li>
          </ul>
        </GuideBlock>
      </div>
    </details>
  );
}

function GuideBlock({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-200">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{body}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
