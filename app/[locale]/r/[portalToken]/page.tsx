import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ReportInteractive } from '@/components/report/report-interactive';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; portalToken: string }>;
}) {
  const { locale, portalToken } = await params;
  setRequestLocale(locale);
  return <ReportInteractive portalToken={portalToken} />;
}
