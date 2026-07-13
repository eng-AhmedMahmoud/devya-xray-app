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

/** Locale-scoped path to the live sample report. */
export function demoReportPath(locale: string): string {
  return `/${locale}/r/${DEMO_PORTAL_TOKEN}`;
}
