'use server';

import { buyerRegisterSchema, loginSchema } from '@toonexpo/contracts';
import { AuthError } from 'next-auth';

import { signIn } from '@/auth';
import type { AuthActionState } from '@/lib/auth/action-state';
import { ACCOUNT_PATH } from '@/lib/auth/constants';
import { authRateLimitGate } from '@/lib/auth/rate-limit-gate';
import { registerBuyer } from '@/lib/auth/register';

function accountRedirect(locale: string): string {
  return `/${locale}${ACCOUNT_PATH}`;
}

export async function loginAction(
  locale: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const limited = await authRateLimitGate('login');
  if (limited) {
    return limited;
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { errorKey: 'invalidInput' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: accountRedirect(locale),
    });
  } catch (error) {
    // A successful sign-in throws a Next.js redirect that must propagate.
    if (error instanceof AuthError) {
      return { errorKey: 'invalidCredentials' };
    }
    throw error;
  }

  return {};
}

export async function registerAction(
  locale: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const limited = await authRateLimitGate('register');
  if (limited) {
    return limited;
  }

  const parsed = buyerRegisterSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { errorKey: 'invalidInput' };
  }

  const result = await registerBuyer(parsed.data);
  if (!result.ok) {
    return { errorKey: result.error };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: accountRedirect(locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { errorKey: 'invalidCredentials' };
    }
    throw error;
  }

  return {};
}
