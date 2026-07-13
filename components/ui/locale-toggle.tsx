'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');
  const other = locale === 'ar' ? 'en' : 'ar';

  return (
    <Link
      href={pathname}
      locale={other}
      aria-label={t('toggleAria')}
      className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-300 transition-colors hover:border-white/25 hover:text-white ring-focus"
    >
      {other === 'ar' ? 'العربية' : 'EN'}
    </Link>
  );
}
