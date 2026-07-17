import type { AuthSession, BuyerRegisterInput } from '@toonexpo/contracts';

import { ApiClientError } from '@/lib/api/errors';
import { serverApiRequest } from '@/lib/api/server';

export type RegisterErrorCode = 'emailTaken';
export type RegisterBuyerResult =
  { ok: true; userId: string } | { ok: false; error: RegisterErrorCode };

export async function registerBuyer(input: BuyerRegisterInput): Promise<RegisterBuyerResult> {
  try {
    const session = await serverApiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: input,
    });
    return { ok: true, userId: session.user.id };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 409) {
      return { ok: false, error: 'emailTaken' };
    }
    throw error;
  }
}
