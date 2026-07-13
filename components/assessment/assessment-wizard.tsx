'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import {
  api,
  ApiError,
  type AssessmentPayload,
  type Practice,
  type ResponsePatch,
} from '@/lib/api';
import { formatDate } from '@/lib/ui';
import { useRouter } from '@/i18n/navigation';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';
import { FriendlyError } from '@/components/ui/friendly-error';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PracticeCard, type LocalResponse } from './practice-card';
import { WelcomeStep } from './welcome-step';
import { ReviewStep } from './review-step';
import { ConfirmDialog } from './confirm-dialog';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 800;

export function AssessmentWizard({ token }: { token: string }) {
  const t = useTranslations('assessment');
  const locale = useLocale();
  const router = useRouter();

  const [payload, setPayload] = useState<AssessmentPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [responses, setResponses] = useState<Record<string, LocalResponse>>({});
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const responsesRef = useRef<Record<string, LocalResponse>>({});
  const dirtyRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------------------------------- Load --------------------------------- */

  useEffect(() => {
    let cancelled = false;
    api.assessment
      .get(token)
      .then((p) => {
        if (cancelled) return;
        const seed: Record<string, LocalResponse> = {};
        for (const r of p.responses) {
          seed[r.practiceCode] = {
            selfMaturity: r.selfMaturity ?? null,
            selfEvidence: r.selfEvidence ?? '',
          };
        }
        responsesRef.current = seed;
        setResponses(seed);
        setPayload(p);
        if (!p.engagement.editable) setSubmitted(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  /* -------------------------------- Autosave ------------------------------- */

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const codes = Array.from(dirtyRef.current);
    if (codes.length === 0) return;
    dirtyRef.current = new Set();
    setSaveState('saving');
    const body: ResponsePatch[] = codes.map((code) => {
      const r = responsesRef.current[code];
      return {
        practiceCode: code,
        ...(r?.selfMaturity != null ? { selfMaturity: r.selfMaturity } : {}),
        selfEvidence: r?.selfEvidence ?? '',
      };
    });
    try {
      await api.assessment.save(token, body);
      setSaveState('saved');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setSubmitted(true);
        return;
      }
      for (const c of codes) dirtyRef.current.add(c);
      setSaveState('error');
    }
  }, [token]);

  const updateResponse = useCallback(
    (code: string, patch: Partial<LocalResponse>) => {
      const prev = responsesRef.current;
      const existing: LocalResponse = prev[code] ?? {
        selfMaturity: null,
        selfEvidence: '',
      };
      const next = {
        ...prev,
        [code]: { ...existing, ...patch },
      };
      responsesRef.current = next;
      setResponses(next);
      dirtyRef.current.add(code);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ------------------------------- Navigation ------------------------------ */

  const goToStep = useCallback(
    (n: number) => {
      void flush(); // save on step change
      setStep(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [flush],
  );

  /* --------------------------------- Submit -------------------------------- */

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await flush();
      const res = await api.assessment.submit(token);
      // Self-serve snapshot: send the visitor straight to their instant report.
      if (res.selfServe && res.portalToken) {
        router.replace(`/r/${res.portalToken}`);
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  }, [flush, token, router]);

  /* -------------------------------- Derived -------------------------------- */

  const pillars = useMemo(
    () =>
      payload
        ? [...payload.framework.pillars].sort((a, b) => a.order - b.order)
        : [],
    [payload],
  );

  const practicesByPillar = useMemo(() => {
    const map: Record<string, Practice[]> = {};
    for (const p of payload?.practices ?? []) {
      (map[p.pillarKey] ??= []).push(p);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [payload]);

  const total = payload?.practices.length ?? 0;
  const answered = useMemo(
    () =>
      (payload?.practices ?? []).filter(
        (p) => responses[p.code]?.selfMaturity != null,
      ).length,
    [payload, responses],
  );

  const reviewIndex = pillars.length + 1;

  /* --------------------------------- Render -------------------------------- */

  if (loadError) {
    return <FriendlyError title={t('errorTitle')} body={t('errorBody')} />;
  }
  if (!payload) {
    return <LoadingScreen label={t('loading')} />;
  }
  if (submitted) {
    const date = formatDate(locale, payload.engagement.submittedAt);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Wordmark />
        <CheckCircle2 className="mt-10 h-12 w-12 text-emerald-400" />
        <h1 className="mt-5 text-2xl font-semibold text-white">
          {t('submittedTitle', { name: payload.engagement.contactName })}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-300">
          {t('submittedBody')}
        </p>
        {date && (
          <p className="mt-4 text-xs text-ink-500">{t('submittedAt', { date })}</p>
        )}
      </main>
    );
  }

  const activePillar = step >= 1 && step <= pillars.length ? pillars[step - 1] : null;
  const activeList = activePillar ? (practicesByPillar[activePillar.key] ?? []) : [];
  const activeAnswered = activeList.filter(
    (p) => responses[p.code]?.selfMaturity != null,
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-3">
          <Wordmark />
          <div className="flex items-center gap-4">
            <SaveIndicator state={saveState} />
            <LocaleToggle />
          </div>
        </div>
        <div className="h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-ink-200 transition-all duration-500"
            style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
          />
        </div>
      </header>

      <div className="container mx-auto pt-5">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-1">
          <StepChip
            active={step === 0}
            done={false}
            label={t('welcomeStep')}
            onClick={() => goToStep(0)}
          />
          {pillars.map((pillar, i) => {
            const list = practicesByPillar[pillar.key] ?? [];
            const done =
              list.length > 0 &&
              list.every((p) => responses[p.code]?.selfMaturity != null);
            return (
              <StepChip
                key={pillar.key}
                active={step === i + 1}
                done={done}
                label={pillar.name}
                onClick={() => goToStep(i + 1)}
              />
            );
          })}
          <StepChip
            active={step === reviewIndex}
            done={false}
            label={t('reviewStep')}
            onClick={() => goToStep(reviewIndex)}
          />
        </div>
      </div>

      <main className="container mx-auto flex-1 pb-16 pt-6">
        <div className="mx-auto max-w-3xl">
          {step === 0 && (
            <WelcomeStep
              payload={payload}
              answered={answered}
              total={total}
              onStart={() => goToStep(1)}
            />
          )}

          {activePillar && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="font-mono text-xs font-medium text-ink-300">
                  {activePillar.code}
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {activePillar.name}
                </h2>
                <p className="mt-1 text-sm text-ink-400">
                  {t('progress', { answered: activeAnswered, total: activeList.length })}
                </p>
              </div>
              {activeList.map((practice) => (
                <PracticeCard
                  key={practice.code}
                  practice={practice}
                  value={responses[practice.code]}
                  onChange={(patch) => updateResponse(practice.code, patch)}
                />
              ))}
            </div>
          )}

          {step === reviewIndex && (
            <ReviewStep
              pillars={pillars}
              practicesByPillar={practicesByPillar}
              responses={responses}
              answered={answered}
              total={total}
              submitting={submitting}
              submitError={submitError}
              onJump={goToStep}
              onSubmitClick={() => setShowConfirm(true)}
            />
          )}

          {step >= 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-ink-200 transition-colors hover:bg-white/5 ring-focus"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t('back')}
              </button>
              {step <= pillars.length && (
                <button
                  type="button"
                  onClick={() => goToStep(step + 1)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
                >
                  {step === pillars.length ? t('toReview') : t('next')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={showConfirm}
        title={t('confirmTitle')}
        body={t('confirmBody')}
        cancelLabel={t('confirmCancel')}
        confirmLabel={submitting ? t('submitting') : t('confirmSubmit')}
        busy={submitting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => void handleSubmit()}
      />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const t = useTranslations('assessment');
  if (state === 'idle') return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs',
        state === 'saving' && 'animate-pulse text-ink-300',
        state === 'saved' && 'text-emerald-400',
        state === 'error' && 'text-red-400',
      )}
    >
      {state === 'saved' && <Check className="h-3.5 w-3.5" />}
      {state === 'saving' && (
        <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
      )}
      {state === 'saving' ? t('saving') : state === 'saved' ? t('saved') : t('saveError')}
    </span>
  );
}

function StepChip({
  active,
  done,
  label,
  onClick,
}: {
  active: boolean;
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ring-focus',
        active
          ? 'border-white/25 bg-white/5 text-white'
          : 'border-white/10 text-ink-400 hover:border-white/25 hover:text-ink-200',
      )}
    >
      {done && <Check className="h-3 w-3 text-emerald-400" />}
      {label}
    </button>
  );
}
