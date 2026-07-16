import type { AuthActionState } from '@/lib/auth/action-state';
import { assertIpNotRateLimited, type RateLimitSurface } from '@/lib/rate-limit';

type AuthRateLimitSurface = Extract<RateLimitSurface, 'login' | 'register'>;

/**
 * Shared gate for login/register server actions.
 * Returns an action state when limited; otherwise `undefined` to continue.
 */
export async function authRateLimitGate(
  surface: AuthRateLimitSurface,
): Promise<AuthActionState | undefined> {
  const rate = await assertIpNotRateLimited(surface);
  if (rate.limited) {
    return { errorKey: rate.errorKey };
  }
  return undefined;
}
