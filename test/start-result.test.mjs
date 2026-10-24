import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextStepAfterStart } from '../lib/start-result.ts';

test('the start response without a token sends the visitor to their inbox (DEV-11)', () => {
  assert.deepEqual(nextStepAfterStart({ emailed: true, lang: 'en' }), { kind: 'inbox' });
});

test('a token from an older backend still redirects into the assessment', () => {
  assert.deepEqual(nextStepAfterStart({ assessToken: 'a1', lang: 'en' }), { kind: 'assess', token: 'a1' });
});
