import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  SetPasswordRequest,
  UserResponse,
} from '@toonexpo/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import {
  changePassword,
  forgotPassword,
  getMeOrNull,
  loginUser,
  logoutUser,
  registerUser,
  setPassword,
} from '@/features/auth/api/auth-api';
import type { LoginFormValues } from '@/features/auth/schemas/login.schema';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { hasClientSessionHint } from '@/features/auth/utils/session-hint';
import { AUTH_ME_QUERY_KEY } from '@/shared/config/auth.constants';

const subscribeToNothing = (): (() => void) => () => undefined;

/**
 * Client query for the current session user (`null` when logged out).
 * Guests (no CSRF session hint) do not hit `/auth/me`.
 *
 * Session hint is read via `useSyncExternalStore` so SSR and hydration
 * both see `false`, then the client updates after hydrate — avoiding mismatches.
 */
export const useMeQuery = () => {
  const hasHint = useSyncExternalStore(subscribeToNothing, hasClientSessionHint, () => false);

  return useQuery<UserResponse | null>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: () => getMeOrNull(),
    enabled: hasHint,
    ...(hasHint ? {} : { initialData: null }),
  });
};

/**
 * Login mutation — hits NestJS directly with credentials.
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginUser(values),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data.user);
    },
  });
};

/**
 * Register mutation — hits NestJS directly with credentials.
 */
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RegisterFormValues) => registerUser(values),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data.user);
    },
  });
};

/**
 * Forgot-password mutation — always succeeds with opaque acknowledgement.
 */
export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (body: ForgotPasswordRequest) => forgotPassword(body),
  });

/**
 * Set-password mutation — invite token + new password, then session.
 */
export const useSetPasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SetPasswordRequest) => setPassword(body),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data.user);
    },
  });
};

/**
 * Change-password mutation for authenticated users.
 */
export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (body: ChangePasswordRequest) => changePassword(body),
  });

/**
 * Logout mutation — invalidates the `me` query after cookie clear.
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
  });
};
