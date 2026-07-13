import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ReportPrint } from '@/components/report/report-print';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ReportPrintPage({
  params,
}: {
  params: Promise<{ locale: string; portalToken: string }>;
}) {
  const { locale, portalToken } = await params;
  setRequestLocale(locale);
  return <ReportPrint portalToken={portalToken} />;
}
