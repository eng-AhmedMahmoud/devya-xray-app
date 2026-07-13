'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { api, type ReportPayload } from '@/lib/api';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';
import { FriendlyError } from '@/components/ui/friendly-error';
import { LoadingScreen } from '@/components/ui/loading-screen';
import type { DonutProps, RadarProps } from './charts';
import { ReportHero } from './report-hero';
import { PillarSection } from './pillar-section';
import { FindingsSection } from './findings-section';
import { RoadmapSection } from './roadmap-section';
import { QuickWinsGrid } from './quick-wins-grid';

export type ChartSet = {
  Radar: ComponentType<RadarProps>;
  Donut: ComponentType<DonutProps>;
};

export function ReportView({
  portalToken,
  print,
  charts,
}: {
  portalToken: string;
  print: boolean;
  charts: ChartSet;
}) {
  const t = useTranslations('report');
  const [data, setData] = useState<ReportPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.report
      .get(portalToken)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [portalToken]);

  if (error) return <FriendlyError title={t('errorTitle')} body={t('errorBody')} />;
  if (!data) return <LoadingScreen label={t('loading')} />;

  const isDevya = data.meta.framework.brandKey === 'devya';
  const branding = isDevya ? (
    <Wordmark />
  ) : (
    <Wordmark neutralName={data.meta.framework.name} />
  );

  const radarData = [...data.pillars]
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ name: p.name, value: p.stats.healthPct }));
  const pillars = [...data.pillars].sort((a, b) => a.order - b.order);
  const { Radar, Donut } = charts;

  return (
    <div className="flex min-h-screen flex-col">
      {print ? (
        <div className="mx-auto w-full max-w-5xl px-8 pt-8">{branding}</div>
      ) : (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur">
          <div className="container mx-auto flex max-w-6xl items-center justify-between py-3">
            {branding}
            <div className="flex items-center gap-3">
              <a
                href={api.report.pdfUrl(portalToken)}
                className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-xs font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
              >
                <Download className="h-3.5 w-3.5" />
                {t('downloadPdf')}
              </a>
              <LocaleToggle />
            </div>
          </div>
        </header>
      )}

      <main
        className={
          print
            ? 'mx-auto w-full max-w-5xl px-8 pb-12'
            : 'container mx-auto max-w-6xl flex-1 pb-20'
        }
      >
        <ReportHero meta={data.meta} overall={data.overall} />

        {radarData.length > 0 && (
          <section className="surface mt-6 p-6 print:break-inside-avoid">
            <h2 className="text-sm font-medium text-ink-200">{t('radarTitle')}</h2>
            <div className="mt-3">
              <Radar data={radarData} animate={!print} />
            </div>
          </section>
        )}

        {data.execSummary && (
          <section className="surface mt-6 p-6">
            <h2 className="text-xl font-semibold text-white">{t('execSummaryTitle')}</h2>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-200">
              {data.execSummary}
            </div>
          </section>
        )}

        {pillars.map((pillar) => (
          <PillarSection key={pillar.key} pillar={pillar} Donut={Donut} print={print} />
        ))}

        {data.findings.length > 0 && <FindingsSection findings={data.findings} />}
        {data.roadmap.length > 0 && <RoadmapSection roadmap={data.roadmap} />}
        {data.quickWins.length > 0 && <QuickWinsGrid items={data.quickWins} />}

        {isDevya && (
          <footer className="mt-12 border-t border-white/5 pt-6 text-xs text-ink-500">
            {t('poweredBy')}
          </footer>
        )}
      </main>
    </div>
  );
}
