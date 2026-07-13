import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Wordmark } from '@/components/ui/wordmark';
import { LocaleToggle } from '@/components/ui/locale-toggle';

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between py-6">
        <Wordmark />
        <LocaleToggle />
      </header>

      <main className="container mx-auto flex flex-1 items-center">
        <section className="max-w-2xl py-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            {t('badge')}
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Devya{' '}
            <span className="bg-gradient-to-r from-white via-ink-200 to-ink-400 bg-clip-text text-transparent">
              X-Ray
            </span>
          </h1>
          <p className="mt-4 text-xl font-medium text-ink-100 sm:text-2xl">
            {t('tagline')}
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-300">
            {t('pitch')}
          </p>
          <div className="mt-8">
            <a
              href="https://devya.dev"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-200 ring-focus"
            >
              {t('cta')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </div>
        </section>
      </main>

      <footer className="container mx-auto py-8 text-xs text-ink-500">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
