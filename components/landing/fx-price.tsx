'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DISPLAY_CURRENCIES,
  FALLBACK_CONVERTED,
  FULL_XRAY_EGP,
  formatMoney,
  type FxPayload,
} from '@/lib/pricing';

/** EGP price with live USD/EUR + MENA equivalents (falls back to baked rates). */
export function FxPrice() {
  const t = useTranslations('landing');
  const [converted, setConverted] = useState<Record<string, number>>(FALLBACK_CONVERTED);

  useEffect(() => {
    let alive = true;
    fetch('/api/fx')
      .then((r) => (r.ok ? (r.json() as Promise<FxPayload>) : null))
      .then((d) => {
        if (alive && d?.converted) setConverted(d.converted);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div className="text-2xl font-semibold text-white">
        {FULL_XRAY_EGP.toLocaleString('en-US')} <span className="text-ink-300">EGP</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-ink-400" dir="ltr">
        <span className="text-ink-500">≈</span>
        {DISPLAY_CURRENCIES.map((c, i) => (
          <span key={c.code}>
            {formatMoney(c.code, converted[c.code] ?? FALLBACK_CONVERTED[c.code])}
            {i < DISPLAY_CURRENCIES.length - 1 && <span className="ms-2 text-ink-600">·</span>}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-ink-500">{t('pricingRatesNote')}</p>
    </div>
  );
}
