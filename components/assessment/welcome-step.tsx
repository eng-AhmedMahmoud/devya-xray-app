'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Layers, MessageCircleQuestion, Save, Users } from 'lucide-react';
import type { AssessmentPayload } from '@/lib/api';

export function WelcomeStep({
  payload,
  answered,
  total,
  onStart,
}: {
  payload: AssessmentPayload;
  answered: number;
  total: number;
  onStart: () => void;
}) {
  const t = useTranslations('assessment');

  return (
    <div className="surface-strong p-6 animate-fade-in sm:p-8">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">
        {t('welcomeTitle', { company: payload.engagement.companyName })}
      </h1>
      <p className="mt-3 leading-relaxed text-ink-300">
        {t('welcomeIntro', { framework: payload.framework.name })}
      </p>

      <h2 className="mt-6 text-sm font-medium text-white">{t('expectTitle')}</h2>
      <ul className="mt-3 space-y-2.5 text-sm text-ink-300">
        <li className="flex items-start gap-2.5">
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
          {t('expectPillars', {
            pillars: payload.framework.pillars.length,
            practices: total,
          })}
        </li>
        <li className="flex items-start gap-2.5">
          <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
          {t('expectHonesty')}
        </li>
        <li className="flex items-start gap-2.5">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
          {t('expectVerify')}
        </li>
      </ul>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-400">
        <Save className="h-3.5 w-3.5 shrink-0" />
        {t('resumeNote')}
      </p>
      {answered > 0 && (
        <p className="mt-2 text-xs font-medium text-ink-100">
          {t('resumeProgress', { answered, total })}
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
      >
        {t('start')}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </div>
  );
}
