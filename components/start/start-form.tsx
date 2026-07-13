'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useRouter, Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';
import { demoReportPath } from '@/lib/links';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD =
  'mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 outline-none transition-colors focus:border-white/30 ring-focus';

export function StartForm() {
  const t = useTranslations('start');
  const locale = useLocale();
  const router = useRouter();

  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company.trim()) return setError(t('errorCompany'));
    if (!name.trim()) return setError(t('errorName'));
    if (!EMAIL_RE.test(email.trim())) return setError(t('errorEmail'));

    setSubmitting(true);
    try {
      const res = await api.public.start({
        companyName: company.trim(),
        contactName: name.trim(),
        contactEmail: email.trim(),
        ...(website.trim() ? { companyWebsite: website.trim() } : {}),
        ...(teamSize ? { teamSize } : {}),
        lang: locale,
      });
      const lang = res.lang || locale;
      router.replace(`/a/${res.assessToken}`, { locale: lang as 'en' | 'ar' });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.message ? err.message : t('errorGeneric');
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur">
        <div className="container mx-auto flex max-w-3xl items-center justify-between py-4">
          <Wordmark />
          <LocaleToggle />
        </div>
      </header>

      <main className="container mx-auto flex flex-1 items-center py-12">
        <div className="mx-auto w-full max-w-xl animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-400 transition-colors hover:text-white ring-focus"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t('back')}
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            {t('kicker')}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-300">{t('lede')}</p>

          <form onSubmit={onSubmit} className="surface mt-8 space-y-5 p-6 sm:p-7" noValidate>
            <div>
              <label htmlFor="company" className="text-xs font-medium text-ink-200">
                {t('companyLabel')}
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('companyPlaceholder')}
                autoComplete="organization"
                required
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="name" className="text-xs font-medium text-ink-200">
                {t('nameLabel')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                autoComplete="name"
                required
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-ink-200">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                required
                dir="ltr"
                className={FIELD}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="website" className="text-xs font-medium text-ink-200">
                  {t('websiteLabel')}{' '}
                  <span className="font-normal text-ink-500">({t('optional')})</span>
                </label>
                <input
                  id="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={t('websitePlaceholder')}
                  autoComplete="url"
                  dir="ltr"
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="teamSize" className="text-xs font-medium text-ink-200">
                  {t('teamSizeLabel')}{' '}
                  <span className="font-normal text-ink-500">({t('optional')})</span>
                </label>
                <select
                  id="teamSize"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className={`${FIELD} appearance-none`}
                >
                  <option value="">{t('teamSizePlaceholder')}</option>
                  <option value="1-5">{t('teamSize1')}</option>
                  <option value="6-15">{t('teamSize2')}</option>
                  <option value="16-50">{t('teamSize3')}</option>
                  <option value="51-150">{t('teamSize4')}</option>
                  <option value="150+">{t('teamSize5')}</option>
                </select>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink-500">{t('consent')}</p>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-500/30 bg-red-500/[0.06] px-3.5 py-2.5 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-60 ring-focus"
            >
              {submitting ? (
                <>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-900" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  {t('submit')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            <Link
              href={demoReportPath(locale)}
              className="text-ink-300 underline-offset-4 transition-colors hover:text-white hover:underline ring-focus"
            >
              {t('sampleNote')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
