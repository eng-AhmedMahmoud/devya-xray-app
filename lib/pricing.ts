// Full X-Ray is priced in EGP and shown with live equivalents in USD/EUR + the
// major MENA currencies. Rates come from a keyless public provider at request
// time; these fallbacks (captured 2026-07) keep the card populated if the
// lookup fails. Never treat the fallbacks as authoritative — they are a floor.

export const FULL_XRAY_EGP = 25_000;

export interface DisplayCurrency {
  code: string;
  /** Short prefix/suffix shown next to the amount; codes for GCC currencies. */
  symbol: string;
  /** true = symbol goes before the number ($502), false = after (1,882 SAR). */
  prefix: boolean;
  /** Decimal places to display. */
  dp: number;
}

// Order = display order under the EGP price.
export const DISPLAY_CURRENCIES: DisplayCurrency[] = [
  { code: 'USD', symbol: '$', prefix: true, dp: 0 },
  { code: 'EUR', symbol: '€', prefix: true, dp: 0 },
  { code: 'SAR', symbol: 'SAR', prefix: false, dp: 0 },
  { code: 'AED', symbol: 'AED', prefix: false, dp: 0 },
  { code: 'QAR', symbol: 'QAR', prefix: false, dp: 0 },
  { code: 'KWD', symbol: 'KWD', prefix: false, dp: 0 },
];

/** Fallback converted amounts for FULL_XRAY_EGP (indicative, 2026-07). */
export const FALLBACK_CONVERTED: Record<string, number> = {
  USD: 502,
  EUR: 440,
  SAR: 1882,
  AED: 1843,
  QAR: 1827,
  KWD: 156,
};

export interface FxPayload {
  amount: number; // EGP base amount
  base: 'EGP';
  converted: Record<string, number>;
  live: boolean;
  updated: string | null;
}

export function formatMoney(code: string, value: number): string {
  const c = DISPLAY_CURRENCIES.find((x) => x.code === code);
  const dp = c?.dp ?? 0;
  const n = value.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  if (!c) return `${n} ${code}`;
  return c.prefix ? `${c.symbol}${n}` : `${n} ${c.symbol}`;
}
