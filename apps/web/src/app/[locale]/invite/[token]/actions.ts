'use server';

import { redirect } from 'next/navigation';

import { LOGIN_PATH } from '@/lib/auth/constants';
import type { InviteActionState } from '@/lib/auth/invite-action-state';
import { runSetPassword } from '@/lib/auth/set-password';

export async function setPasswordAction(
  locale: string,
  token: string,
  _prevState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const result = await runSetPassword(token, formData);
  if (!result.ok) {
    return { errorKey: result.errorKey };
  }

  redirect(`/${locale}${LOGIN_PATH}?invited=1`);
}
