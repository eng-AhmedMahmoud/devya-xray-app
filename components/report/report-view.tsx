'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { api, type ReportPayload } from '@/lib/api';
import { distributionTotal } from '@/lib/ui';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';
import { FriendlyError } from '@/components/ui/friendly-error';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Reveal } from '@/components/landing/reveal';
import type { DonutProps, MaturityBarProps, RadarProps } from './charts';
import { ReportHero } from './report-hero';
import { ReportGuide } from './report-guide';
import { SectionNav, type NavItem } from './section-nav';
import { PillarSection } from './pillar-section';
import { FindingsSection } from './findings-section';
import { RoadmapSection } from './roadmap-section';
import { QuickWinsGrid } from './quick-wins-grid';
import { SnapshotView } from './snapshot-view';
import { useChartStrings } from './ui/use-chart-strings';

export type ChartSet = {
  Radar: ComponentType<RadarProps>;
  Donut: ComponentType<DonutProps>;
  Bar: ComponentType<MaturityBarProps>;
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
  const cs = useChartStrings();
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

  const pillars = useMemo(
    () => (data ? [...data.pillars].sort((a, b) => a.order - b.order) : []),
    [data],
  );

  const navItems = useMemo<NavItem[]>(() => {
    if (!data) return [];
    const items: NavItem[] = [{ id: 'overview', label: t('navOverview') }];
    for (const p of pillars) {
      items.push({ id: `pillar-${p.key}`, label: p.name, code: p.code });
    }
    if (data.findings.length > 0) items.push({ id: 'findings', label: t('findingsTitle') });
    if (data.roadmap.length > 0) items.push({ id: 'roadmap', label: t('roadmapTitle') });
    if (data.quickWins.length > 0) items.push({ id: 'quickwins', label: t('quickWinsTitle') });
    return items;
  }, [data, pillars, t]);

  if (error) return <FriendlyError title={t('errorTitle')} body={t('errorBody')} />;
  if (!data) return <LoadingScreen label={t('loading')} />;

  const isDevya = data.meta.framework.brandKey === 'devya';
  const branding = isDevya ? (
    <Wordmark />
  ) : (
    <Wordmark neutralName={data.meta.framework.name} />
  );

  // A free self-serve snapshot is not yet code-verified — render the
  // self-assessment framing instead of the full report.
  const snapshot = data.meta.verified === false;

  // Radar data: verified health with a self-reported overlay ring. Null health
  // (a pillar with nothing scored) is surfaced by the tooltip, not dropped.
  const radarData = pillars.map((p) => ({
    name: p.name,
    value: distributionTotal(p.stats.distribution) > 0 ? p.stats.healthPct : null,
    self: p.stats.selfHealthPct,
    urgency: distributionTotal(p.stats.distribution) > 0 ? p.stats.urgencyIndex : null,
    scored: p.stats.scored,
  }));
  const hasRadar = radarData.length > 0;

  const { Radar, Donut, Bar } = charts;

  return (
    <div className="flex min-h-screen flex-col">
      {print ? (
        <div className="mx-auto w-full max-w-5xl px-8 pt-8">{branding}</div>
      ) : (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur">
          <div className="container mx-auto flex max-w-6xl items-center justify-between py-3">
            {branding}
            <div className="flex items-center gap-3">
              {!snapshot && (
                <a
                  href={api.report.pdfUrl(portalToken)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-xs font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('downloadPdf')}
                </a>
              )}
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
        {snapshot ? (
          <SnapshotView data={data} print={print} Radar={Radar} Donut={Donut} />
        ) : (
          <div className={print ? '' : 'lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8'}>
            {!print && (
              <aside className="mt-6 lg:mt-8">
                <SectionNav items={navItems} />
              </aside>
            )}

            <div className="min-w-0">
              <div id="overview" className="scroll-mt-24">
                <ReportHero meta={data.meta} overall={data.overall} />
              </div>

              <ReportGuide print={print} />

              {hasRadar && (
                <section className="surface mt-6 p-6 print:break-inside-avoid">
                  <h2 className="text-sm font-medium text-ink-200">{t('radarTitle')}</h2>
                  <p className="mt-0.5 text-xs text-ink-500">{t('radarSubtitle')}</p>
                  <div className="mt-3">
                    <Radar
                      data={radarData}
                      animate={!print}
                      showSelf
                      strings={print ? undefined : cs}
                    />
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

              {pillars.map((pillar) =>
                print ? (
                  <PillarSection
                    key={pillar.key}
                    pillar={pillar}
                    Donut={Donut}
                    Bar={Bar}
                    print
                  />
                ) : (
                  <Reveal key={pillar.key} as="section">
                    <PillarSection
                      pillar={pillar}
                      Donut={Donut}
                      Bar={Bar}
                      print={false}
                    />
                  </Reveal>
                ),
              )}

              {data.findings.length > 0 && (
                <div id="findings" className="scroll-mt-24">
                  <FindingsSection findings={data.findings} />
                </div>
              )}
              {data.roadmap.length > 0 && (
                <div id="roadmap" className="scroll-mt-24">
                  <RoadmapSection roadmap={data.roadmap} />
                </div>
              )}
              {data.quickWins.length > 0 && (
                <div id="quickwins" className="scroll-mt-24">
                  <QuickWinsGrid items={data.quickWins} />
                </div>
              )}

              {isDevya && (
                <footer className="mt-12 border-t border-white/5 pt-6 text-xs text-ink-500">
                  {t('poweredBy')}
                </footer>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
