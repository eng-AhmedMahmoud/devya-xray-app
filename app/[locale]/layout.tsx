import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { sora, cairo } from '../fonts';
import { routing } from '@/i18n/routing';
import '../../styles/globals.css';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xray.devya.dev';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  const url = `${baseUrl}/${locale}`;
  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: '%s · Devya X-Ray' },
    description,
    applicationName: 'Devya X-Ray',
    keywords: [
      'engineering review',
      'code audit',
      'software maturity assessment',
      'technical due diligence',
      'CTO consultancy',
      'Devya X-Ray',
    ],
    authors: [{ name: 'Devya Solutions', url: 'https://devya.dev' }],
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Devya X-Ray',
      title,
      description,
      url,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@devya_solutions',
      images: ['/opengraph-image'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-cairo' : 'font-sora';

  return (
    <html lang={locale} dir={dir} className={`${sora.variable} ${cairo.variable}`}>
      <body
        className={`antialiased ${fontClass} bg-ink-900 text-ink-100`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
