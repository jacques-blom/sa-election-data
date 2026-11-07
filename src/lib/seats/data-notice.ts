import { resultDelay } from '../overview/results.ts';
import type { Result } from '../places/results.ts';

/** Local saved data is intentional; freshness warnings are for live results. */
export function coalitionDataNotice(result: Result, localSnapshot: boolean, now = Date.now()) {
  return localSnapshot ? null : resultDelay(result, now);
}
