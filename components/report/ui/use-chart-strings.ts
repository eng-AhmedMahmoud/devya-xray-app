'use client';

import { useTranslations } from 'next-intl';
import type { ChartStrings } from '../charts';

/** Build the localized copy the presentational charts need for tooltips/legends. */
export function useChartStrings(): ChartStrings {
  const t = useTranslations('report');
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
  };
}
