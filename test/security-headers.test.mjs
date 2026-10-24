import { test } from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../next.config.mjs';

// SHARED-03 — the self-hosted app sent no browser-hardening headers and
// advertised the framework in X-Powered-By.
test('every route gets the hardening headers', async () => {
  const rules = await nextConfig.headers();
  const all = rules.find((r) => r.source === '/:path*');
  assert.ok(all, 'a catch-all header rule exists');
  const keys = all.headers.map((h) => h.key);
  for (const k of [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]) {
    assert.ok(keys.includes(k), `${k} is set`);
  }
  const csp = all.headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.match(csp, /frame-ancestors 'none'/);
});

test('X-Powered-By is off', () => {
  assert.equal(nextConfig.poweredByHeader, false);
});
