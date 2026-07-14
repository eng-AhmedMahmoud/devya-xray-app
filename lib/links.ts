/**
 * Shared outbound links driven by public env vars. These are read at build time
 * on the client, so they must be `NEXT_PUBLIC_*` and referenced statically.
 */

/** Devya booking page — target of every "Book a call" CTA. */
export const BOOK_URL =
  process.env.NEXT_PUBLIC_BOOK_URL ?? 'https://booking.devya.dev';

/** Portal token for the public, code-verified sample report. */
export const DEMO_PORTAL_TOKEN =
  process.env.NEXT_PUBLIC_DEMO_PORTAL_TOKEN ??
  'ab60dc441b1d86f876cd8b4f7573c1544ca546c9';

/**
 * Path to the live sample report for the next-intl `Link` — which prepends the
 * active locale itself, so this must be locale-RELATIVE (no `/en` prefix) or the
 * URL double-prefixes to `/en/en/r/...` and 404s.
 */
export function demoReportPath(_locale?: string): string {
  return `/r/${DEMO_PORTAL_TOKEN}`;
}
