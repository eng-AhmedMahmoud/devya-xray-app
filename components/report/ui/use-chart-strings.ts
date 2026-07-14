'use client';

import { useTranslations } from 'next-intl';
import type { ChartStrings } from '../charts';

/** Build the localized copy the presentational charts need for tooltips/legends. */
export function useChartStrings(): ChartStrings {
  const t = useTranslations('report');
  const tm = useTranslations('maturity');
  const ts = useTranslations('severity');
  return {
    verified: t('chartVerified'),
    selfReported: t('chartSelfReported'),
    health: t('healthLabel'),
    urgency: t('urgencyLabel'),
    scored: t('chartScored'),
    total: t('chartTotal'),
    practices: t('chartPractices'),
    ofPillar: t('chartOfPillar'),
    notScored: t('notScored'),
    findings: t('findingsTitle'),
    overclaimed: t('overclaimed'),
    calibrated: t('calibrated'),
    underclaimed: t('underclaimed'),
    overallHealth: t('overallHealthLabel'),
    maturity: { 1: tm('m1'), 2: tm('m2'), 3: tm('m3'), 4: tm('m4') },
    severity: {
      CRITICAL: ts('CRITICAL'),
      HIGH: ts('HIGH'),
      MEDIUM: ts('MEDIUM'),
      LOW: ts('LOW'),
    },
  };
}
