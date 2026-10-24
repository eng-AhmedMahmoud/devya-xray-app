import type { StartSelfServeResult } from './api';

/**
 * Where the start form goes next. The assessment link is emailed to the
 * address on the form — the backend no longer hands it to the browser, so
 * proving the mailbox is what gates a published report (DEV-11). An older
 * backend that still returns the token keeps the old redirect.
 */
export type StartNextStep = { kind: 'inbox' } | { kind: 'assess'; token: string };

export function nextStepAfterStart(res: StartSelfServeResult): StartNextStep {
  return res.assessToken ? { kind: 'assess', token: res.assessToken } : { kind: 'inbox' };
}
