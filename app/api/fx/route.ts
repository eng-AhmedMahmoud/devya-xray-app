import { NextResponse } from 'next/server';
import {
  DISPLAY_CURRENCIES,
  FALLBACK_CONVERTED,
  FULL_XRAY_EGP,
  type FxPayload,
} from '@/lib/pricing';

// Live lookup at request time; force-dynamic so a failed provider call is never
// frozen into the static shell. Next's fetch cache keeps upstream calls to ~1/6h.
export const dynamic = 'force-dynamic';

const REVALIDATE_SECONDS = 21_600; // 6h

function fallback(): FxPayload {
  return { amount: FULL_XRAY_EGP, base: 'EGP', converted: { ...FALLBACK_CONVERTED }, live: false, updated: null };
}

export async function GET() {
  let payload = fallback();
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EGP', {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        result?: string;
        rates?: Record<string, number>;
        time_last_update_utc?: string;
      };
      if (data?.result === 'success' && data.rates) {
        const converted: Record<string, number> = {};
        let ok = 0;
        for (const { code, dp } of DISPLAY_CURRENCIES) {
          const rate = data.rates[code];
          if (typeof rate === 'number' && rate > 0) {
            const v = FULL_XRAY_EGP * rate;
            converted[code] = dp === 0 ? Math.round(v) : Number(v.toFixed(dp));
            ok += 1;
          } else {
            converted[code] = FALLBACK_CONVERTED[code];
          }
        }
        // Only call it live if the provider priced (almost) every currency.
        if (ok >= DISPLAY_CURRENCIES.length - 1) {
          payload = {
            amount: FULL_XRAY_EGP,
            base: 'EGP',
            converted,
            live: true,
            updated: data.time_last_update_utc ?? null,
          };
        }
      }
    }
  } catch {
    // keep fallback
  }
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}
