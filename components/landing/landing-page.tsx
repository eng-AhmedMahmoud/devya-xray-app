'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  CalendarClock,
  Check,
  ClipboardList,
  FileText,
  GaugeCircle,
  GitBranch,
  Layers,
  ListChecks,
  Map as MapIcon,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';
import { BOOK_URL, demoReportPath } from '@/lib/links';
import { Reveal } from './reveal';
import { FxPrice } from './fx-price';

const PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus';
const SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-ink-100 transition-colors hover:border-white/30 hover:bg-white/10 ring-focus';
const TERTIARY =
  'inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-ink-300 transition-colors hover:text-white ring-focus';

export function LandingPage() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const demo = demoReportPath(locale);
  const year = new Date().getFullYear();

  const pillars = [
    { icon: GitBranch, name: t('pillar1Name'), desc: t('pillar1Desc') },
    { icon: ClipboardList, name: t('pillar2Name'), desc: t('pillar2Desc') },
    { icon: GaugeCircle, name: t('pillar3Name'), desc: t('pillar3Desc') },
    { icon: Layers, name: t('pillar4Name'), desc: t('pillar4Desc') },
    { icon: Boxes, name: t('pillar5Name'), desc: t('pillar5Desc') },
    { icon: ShieldCheck, name: t('pillar6Name'), desc: t('pillar6Desc'), original: true },
    { icon: BrainCircuit, name: t('pillar7Name'), desc: t('pillar7Desc'), original: true },
  ];

  const deliverables = [
    { icon: ScanSearch, title: t('getReportTitle'), desc: t('getReportDesc') },
    { icon: FileText, title: t('getPdfTitle'), desc: t('getPdfDesc') },
    { icon: MapIcon, title: t('getRoadmapTitle'), desc: t('getRoadmapDesc') },
    { icon: Zap, title: t('getQuickWinsTitle'), desc: t('getQuickWinsDesc') },
  ];

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between py-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            <Link href="/start" className="hidden text-xs font-medium text-ink-200 hover:text-white sm:inline ring-focus">
              {t('ctaStart')}
            </Link>
            <LocaleToggle />
          </div>
        </div>
      </header>

      {/* ------------------------------- Hero -------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
        <div className="container relative mx-auto max-w-6xl py-20 sm:py-28">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
              {t('badge')}
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Devya{' '}
              <span className="bg-gradient-to-r from-white via-ink-200 to-ink-400 bg-clip-text text-transparent">
                X-Ray
              </span>
            </h1>
            <p className="mt-5 text-xl font-medium text-ink-100 sm:text-2xl">
              {t('tagline')}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-300">
              {t('pitch')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/start" className={PRIMARY}>
                {t('ctaStart')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link href={demo} className={SECONDARY}>
                {t('ctaSample')}
              </Link>
              <a href={BOOK_URL} className={TERTIARY}>
                {t('ctaBook')}
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-400">{t('ctaMicro')}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------- Proof strip ---------------------------- */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="container mx-auto max-w-6xl py-12">
          <Reveal>
            <p className="mx-auto max-w-3xl text-center text-lg font-medium leading-relaxed text-ink-100">
              <Sparkles className="mb-1 me-2 inline h-5 w-5 text-ink-300" aria-hidden />
              {t('proofHeadline')}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <ProofPoint icon={ScanSearch} title={t('proofEvidenceTitle')} body={t('proofEvidenceBody')} delay={0} />
            <ProofPoint icon={CalendarClock} title={t('proofTurnaroundTitle')} body={t('proofTurnaroundBody')} delay={80} />
            <ProofPoint icon={ListChecks} title={t('proofFrameworkTitle')} body={t('proofFrameworkBody')} delay={160} />
          </div>
        </div>
      </section>

      {/* --------------------------- Differentiator -------------------------- */}
      <section className="container mx-auto max-w-6xl py-24">
        <Reveal>
          <Kicker>{t('diffKicker')}</Kicker>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('diffTitle')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-300">{t('diffLede')}</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="surface mt-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <DeltaBar label={t('diffClaimedLabel')} pct={82} tone="claimed" />
            <div className="flex flex-col items-center justify-center gap-1 text-center lg:px-4">
              <span className="text-[10px] uppercase tracking-widest text-ink-500">{t('diffGapLabel')}</span>
              <span className="bg-gradient-to-r from-white via-ink-200 to-ink-400 bg-clip-text text-4xl font-semibold text-transparent">
                −24
              </span>
            </div>
            <DeltaBar label={t('diffVerifiedLabel')} pct={58} tone="verified" />
          </div>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-4 text-center text-sm text-ink-400">{t('diffGapNote')}</p>
        </Reveal>
      </section>

      {/* ------------------------------ Pillars ------------------------------ */}
      <section className="border-t border-white/5 bg-white/[0.015]">
        <div className="container mx-auto max-w-6xl py-24">
          <Reveal>
            <Kicker>{t('pillarsKicker')}</Kicker>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('pillarsTitle')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-300">{t('pillarsLede')}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 70}>
                <div className="surface group h-full p-5 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100">
                      <p.icon className="h-4 w-4" />
                    </span>
                    {p.original && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-ink-300">
                        {t('pillarOriginal')}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- How it works --------------------------- */}
      <section className="container mx-auto max-w-6xl py-24">
        <Reveal>
          <Kicker>{t('howKicker')}</Kicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t('howTitle')}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-300">{t('howLede')}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <TimelineCard
              step="01"
              label={t('howWeek1Label')}
              title={t('howWeek1Title')}
              body={t('howWeek1Body')}
              icon={ScanSearch}
            />
          </Reveal>
          <Reveal delay={120}>
            <TimelineCard
              step="02"
              label={t('howWeek2Label')}
              title={t('howWeek2Title')}
              body={t('howWeek2Body')}
              icon={Rocket}
            />
          </Reveal>
        </div>
      </section>

      {/* --------------------------- What you get ---------------------------- */}
      <section className="border-t border-white/5 bg-white/[0.015]">
        <div className="container mx-auto max-w-6xl py-24">
          <Reveal>
            <Kicker>{t('getKicker')}</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t('getTitle')}</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((d, i) => (
              <Reveal key={d.title} delay={(i % 4) * 60}>
                <div className="surface h-full p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100">
                    <d.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-white">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="mt-8">
              <Link href={demo} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-200 hover:text-white ring-focus">
                {t('ctaSample')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Pricing ------------------------------ */}
      <section className="container mx-auto max-w-6xl py-24">
        <Reveal>
          <Kicker>{t('pricingKicker')}</Kicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t('pricingTitle')}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-300">{t('pricingLede')}</p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {/* Snapshot — free */}
          <Reveal>
            <PricingCard
              name={t('pricingTier1Name')}
              price={t('pricingTier1Price')}
              tagline={t('pricingTier1Tagline')}
              features={[t('pricingTier1F1'), t('pricingTier1F2'), t('pricingTier1F3')]}
            >
              <Link href="/start" className={`${PRIMARY} w-full`}>
                {t('pricingTier1Cta')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </PricingCard>
          </Reveal>

          {/* Full X-Ray — highlighted */}
          <Reveal delay={100}>
            <PricingCard
              name={t('pricingTier2Name')}
              price={<FxPrice />}
              tagline={t('pricingTier2Tagline')}
              popularLabel={t('pricingPopular')}
              features={[
                t('pricingTier2F1'),
                t('pricingTier2F2'),
                t('pricingTier2F3'),
                t('pricingTier2F4'),
                t('pricingTier2F5'),
              ]}
              highlighted
            >
              <a href={BOOK_URL} className={`${PRIMARY} w-full`}>
                {t('pricingTier2Cta')}
              </a>
            </PricingCard>
          </Reveal>

          {/* X-Ray + Remediation */}
          <Reveal delay={200}>
            <PricingCard
              name={t('pricingTier3Name')}
              price={t('pricingTier3Price')}
              tagline={t('pricingTier3Tagline')}
              features={[t('pricingTier3F1'), t('pricingTier3F2'), t('pricingTier3F3')]}
              quoteNote={t('pricingQuoteNote')}
            >
              <a href={BOOK_URL} className={`${SECONDARY} w-full`}>
                {t('pricingTier3Cta')}
              </a>
            </PricingCard>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- FAQ -------------------------------- */}
      <section className="border-t border-white/5 bg-white/[0.015]">
        <div className="container mx-auto max-w-3xl py-24">
          <Reveal>
            <Kicker>{t('faqKicker')}</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t('faqTitle')}</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={(i % 5) * 50}>
                <details className="surface group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-white ring-focus">
                    {f.q}
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-300">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Final CTA ----------------------------- */}
      <section className="container mx-auto max-w-6xl py-24">
        <Reveal>
          <div className="surface-strong relative overflow-hidden p-10 text-center sm:p-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t('finalTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-300">{t('finalLede')}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/start" className={PRIMARY}>
                  {t('ctaStart')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <a href={BOOK_URL} className={SECONDARY}>
                  {t('ctaBook')}
                </a>
              </div>
              <p className="mt-4 text-sm text-ink-400">{t('ctaMicro')}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------ Footer ------------------------------- */}
      <footer className="border-t border-white/5">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 py-8 text-xs text-ink-500 sm:flex-row">
          <span>{t('footer', { year })}</span>
          <a href="https://devya.dev" className="text-ink-400 transition-colors hover:text-white ring-focus">
            {t('footerLink')}
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------ Sub-components ---------------------------- */

function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ink-300">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
      {children}
    </span>
  );
}

function ProofPoint({
  icon: Icon,
  title,
  body,
  delay,
}: {
  icon: typeof ScanSearch;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="surface h-full p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{body}</p>
      </div>
    </Reveal>
  );
}

function DeltaBar({
  label,
  pct,
  tone,
}: {
  label: string;
  pct: number;
  tone: 'claimed' | 'verified';
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-ink-300">{label}</span>
        <span className="font-mono text-sm text-ink-200">{pct}%</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={
            tone === 'claimed'
              ? 'h-full rounded-full bg-gradient-to-r from-ink-500 to-ink-200'
              : 'h-full rounded-full bg-gradient-to-r from-ink-700 to-ink-400'
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TimelineCard({
  step,
  label,
  title,
  body,
  icon: Icon,
}: {
  step: string;
  label: string;
  title: string;
  body: string;
  icon: typeof ScanSearch;
}) {
  return (
    <div className="surface h-full p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="font-mono text-xs text-ink-500">{step}</div>
          <div className="text-sm font-medium text-ink-200">{label}</div>
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">{body}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  tagline,
  features,
  children,
  popularLabel,
  quoteNote,
  highlighted,
}: {
  name: ReactNode;
  price: ReactNode;
  tagline: string;
  features: string[];
  children: ReactNode;
  popularLabel?: string;
  quoteNote?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? 'surface-strong relative flex h-full flex-col p-6 ring-1 ring-white/20 sm:p-7'
          : 'surface relative flex h-full flex-col p-6 sm:p-7'
      }
    >
      {popularLabel && (
        <span className="absolute -top-3 start-6 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-900">
          {popularLabel}
        </span>
      )}
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <div className="mt-2">
        {typeof price === 'string' ? (
          <span className="text-2xl font-semibold text-white">{price}</span>
        ) : (
          price
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">{tagline}</p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">{children}</div>
      {quoteNote && <p className="mt-2 text-center text-[11px] text-ink-500">{quoteNote}</p>}
    </div>
  );
}
