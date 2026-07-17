import type {
  AuthSession,
  AuthUser,
  BuyerRegisterInput,
  LoginInput,
  SetPasswordInput,
} from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api';

export async function loginWithApi(input: LoginInput): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', { method: 'POST', body: input });
}

export async function registerWithApi(input: BuyerRegisterInput): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register', { method: 'POST', body: input });
}

export async function previewInviteWithApi(token: string): Promise<{ valid: true }> {
  return apiRequest<{ valid: true }>(`/auth/invite/${encodeURIComponent(token)}`);
}

export async function setPasswordWithApi(input: SetPasswordInput): Promise<void> {
  await apiRequest<void>('/auth/set-password', { method: 'POST', body: input });
}

export async function logoutWithApi(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await apiRequest<AuthSession>('/auth/me');
    return session.user;
  } catch {
    return null;
  }
}
