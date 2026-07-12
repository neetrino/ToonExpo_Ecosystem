import { setPasswordSchema } from '@toonexpo/contracts';

import { consumeAccountInvite } from '@/lib/auth/invite';
import type { InviteErrorKey } from '@/lib/auth/invite-action-state';
import { hashPassword } from '@/lib/auth/password';
import { assertIpNotRateLimited } from '@/lib/rate-limit';

export type SetPasswordResult = { ok: true } | { ok: false; errorKey: InviteErrorKey };

/**
 * Validates + consumes a set-password invite. Kept outside the `[token]`
 * route segment so it can be unit tested directly (Vite/Vitest cannot
 * resolve `@/*` imports from files nested under two dynamic route segments).
 */
export async function runSetPassword(
  token: string,
  formData: FormData,
): Promise<SetPasswordResult> {
  const rate = await assertIpNotRateLimited('setPassword');
  if (rate.limited) {
    return { ok: false, errorKey: rate.errorKey };
  }

  const parsed = setPasswordSchema.safeParse({
    token,
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const result = await consumeAccountInvite(parsed.data.token, passwordHash);
  if (!result.ok) {
    return { ok: false, errorKey: result.error };
  }

  return { ok: true };
}
