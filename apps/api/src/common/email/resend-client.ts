import { Resend } from 'resend';

import { loadApiEnv } from '../env';
import { createAppLogger } from '../logger';

const logger = createAppLogger('email');

let clientSingleton: Resend | null | undefined;
let missingConfigWarned = false;

/**
 * Shared Resend client. Returns `null` when `RESEND_API_KEY` is unset so
 * callers can skip sending (account creation must never fail on email).
 */
export function getResendClient(): Resend | null {
  if (clientSingleton !== undefined) {
    return clientSingleton;
  }

  const env = loadApiEnv();
  if (!env.RESEND_API_KEY) {
    if (!missingConfigWarned) {
      missingConfigWarned = true;
      logger.warn('RESEND_API_KEY unset — invite emails disabled');
    }
    clientSingleton = null;
    return clientSingleton;
  }

  clientSingleton = new Resend(env.RESEND_API_KEY);
  return clientSingleton;
}

/** Test-only: reset singleton + warn flag. */
export function resetResendClientForTests(): void {
  clientSingleton = undefined;
  missingConfigWarned = false;
}
