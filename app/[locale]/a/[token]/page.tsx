import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AssessmentWizard } from '@/components/assessment/assessment-wizard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <AssessmentWizard token={token} />;
}
