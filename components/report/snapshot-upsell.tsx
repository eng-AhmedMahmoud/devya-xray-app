'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, ScanSearch } from 'lucide-react';
import { BOOK_URL } from '@/lib/links';

/**
 * Upsell card shown on a free self-serve snapshot (meta.verified === false).
 * Frames the snapshot as "what your team says" and drives a Book-a-call CTA to
 * the code-verified Full X-Ray.
 */
export function SnapshotUpsell() {
  const t = useTranslations('report');

  return (
    <section className="surface-strong relative mt-8 overflow-hidden p-8 sm:p-10 print:break-inside-avoid">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100">
          <ScanSearch className="h-5 w-5" />
        </span>
        <h2 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t('snapshotUpsellTitle')}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-300">
          {t('snapshotUpsellBody')}
        </p>
        <div className="mt-7">
          <a
            href={BOOK_URL}
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
          >
            {t('snapshotUpsellCta')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </section>
  );
}
