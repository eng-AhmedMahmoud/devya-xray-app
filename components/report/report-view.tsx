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
import type {
  CalibrationProps,
  DonutProps,
  EffortBarProps,
  EffortByTimelineProps,
  FindingsByPillarProps,
  MaturityAcrossProps,
  MaturityBarProps,
  OverallGaugeProps,
  PillarCompareProps,
  RadarPoint,
  RadarProps,
  SeverityPieProps,
} from './charts';
import { ReportTabs, useTabHash, type TabDef, type TabId } from './report-tabs';
import { OverviewTab } from './tabs/overview-tab';
import { PillarsTab } from './tabs/pillars-tab';
import { FindingsTab } from './tabs/findings-tab';
import { RoadmapTab } from './tabs/roadmap-tab';
import { SnapshotView } from './snapshot-view';
import { useChartStrings } from './ui/use-chart-strings';

/** The full set of chart implementations (lazy for web, eager for print). */
export type ChartSet = {
  Radar: ComponentType<RadarProps>;
  Donut: ComponentType<DonutProps>;
  Bar: ComponentType<MaturityBarProps>;
  Compare: ComponentType<PillarCompareProps>;
  MaturityAcross: ComponentType<MaturityAcrossProps>;
  Calibration: ComponentType<CalibrationProps>;
  Severity: ComponentType<SeverityPieProps>;
  Effort: ComponentType<EffortBarProps>;
  FindingsByPillar: ComponentType<FindingsByPillarProps>;
  Gauge: ComponentType<OverallGaugeProps>;
  EffortTimeline: ComponentType<EffortByTimelineProps>;
};

const PANEL_ID = 'report-panel';

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
  const strings = useChartStrings();
  const [data, setData] = useState<ReportPayload | null>(null);
  const [error, setError] = useState(false);

  // ONE fetch, shared across every tab — tabs switch rendered sections only.
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

  const radarData = useMemo<RadarPoint[]>(
    () =>
      pillars.map((p) => ({
        name: p.name,
        value: distributionTotal(p.stats.distribution) > 0 ? p.stats.healthPct : null,
        self: p.stats.selfHealthPct,
        urgency: distributionTotal(p.stats.distribution) > 0 ? p.stats.urgencyIndex : null,
        scored: p.stats.scored,
      })),
    [pillars],
  );

  // Which tabs actually have content (drives the tab bar + hash fallback).
  const availableTabs = useMemo<TabId[]>(() => {
    if (!data) return ['overview'];
    const tabs: TabId[] = ['overview'];
    if (pillars.length > 0) tabs.push('pillars');
    if (data.findings.length > 0) tabs.push('findings');
    if (data.roadmap.length > 0 || data.quickWins.length > 0) tabs.push('roadmap');
    return tabs;
  }, [data, pillars]);

  const { active, select } = useTabHash(availableTabs, 'overview');

  if (error) return <FriendlyError title={t('errorTitle')} body={t('errorBody')} />;
  if (!data) return <LoadingScreen label={t('loading')} />;

  const isDevya = data.meta.framework.brandKey === 'devya';
  const branding = isDevya ? <Wordmark /> : <Wordmark neutralName={data.meta.framework.name} />;

  // A free self-serve snapshot is not yet code-verified — render the
  // self-assessment framing instead of the tabbed report.
  const snapshot = data.meta.verified === false;

  const tabDefs: TabDef[] = availableTabs.map((id) => {
    if (id === 'findings') return { id, label: t('navFindings'), count: data.findings.length };
    if (id === 'pillars') return { id, label: t('navPillars') };
    if (id === 'roadmap') return { id, label: t('navRoadmap') };
    return { id, label: t('navOverview') };
  });

  const {
    Radar,
    Donut,
    Bar,
    Compare,
    MaturityAcross,
    Calibration,
    Severity,
    Effort,
    FindingsByPillar,
    Gauge,
    EffortTimeline,
  } = charts;

  // The tab panels, keyed by tab id. Print renders ALL of them in sequence.
  const overview = (
    <OverviewTab
      data={data}
      radarData={radarData}
      Radar={Radar}
      Donut={Donut}
      Gauge={Gauge}
      Calibration={Calibration}
      strings={strings}
      print={print}
      onGoto={print ? undefined : select}
    />
  );
  const pillarsPanel = pillars.length > 0 && (
    <PillarsTab
      pillars={pillars}
      Donut={Donut}
      Bar={Bar}
      Compare={Compare}
      MaturityAcross={MaturityAcross}
      strings={strings}
      print={print}
    />
  );
  const findingsPanel = data.findings.length > 0 && (
    <FindingsTab
      findings={data.findings}
      pillars={pillars}
      Severity={Severity}
      Effort={Effort}
      ByPillar={FindingsByPillar}
      strings={strings}
      print={print}
    />
  );
  const roadmapPanel = (data.roadmap.length > 0 || data.quickWins.length > 0) && (
    <RoadmapTab
      roadmap={data.roadmap}
      quickWins={data.quickWins}
      EffortTimeline={EffortTimeline}
      strings={strings}
      print={print}
    />
  );

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
        ) : print ? (
          // ---------- PRINT: linear document, every tab in sequence ----------
          <div className="min-w-0">
            {overview}
            <div className="mt-12 print:break-before-page">{pillarsPanel}</div>
            {findingsPanel}
            {roadmapPanel}
            {isDevya && (
              <footer className="mt-12 border-t border-white/5 pt-6 text-xs text-ink-500">
                {t('poweredBy')}
              </footer>
            )}
          </div>
        ) : (
          // ---------- WEB: sticky tab bar + one active panel ----------
          <div className="min-w-0">
            <div className="sticky top-[3.25rem] z-30 -mx-4 mt-4 border-b border-white/5 bg-ink-950/80 px-4 py-2 backdrop-blur">
              <ReportTabs tabs={tabDefs} active={active} onSelect={select} panelId={PANEL_ID} />
            </div>

            <div
              id={PANEL_ID}
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
              tabIndex={0}
              className="tab-fade-in mt-2 focus:outline-none"
              key={active}
            >
              {active === 'overview' && overview}
              {active === 'pillars' && pillarsPanel}
              {active === 'findings' && findingsPanel}
              {active === 'roadmap' && roadmapPanel}
            </div>

            {isDevya && (
              <footer className="mt-12 border-t border-white/5 pt-6 text-xs text-ink-500">
                {t('poweredBy')}
              </footer>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
