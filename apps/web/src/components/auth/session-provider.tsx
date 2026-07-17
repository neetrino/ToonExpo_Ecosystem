'use client';

import type { AuthSession, AuthUser } from '@toonexpo/contracts';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apiRequest } from '@/lib/api/client';
import { buildAppShellNavVisibility, type AppShellNavVisibility } from '@/lib/auth/nav-visibility';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

type SessionContextValue = {
  status: SessionStatus;
  session: AuthSession | null;
  user: AuthUser | null;
  navVisibility: AppShellNavVisibility;
  refresh: () => Promise<AuthSession | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchSession(): Promise<AuthSession | null> {
  try {
    return await apiRequest<AuthSession>('/auth/me');
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);

  const refresh = useCallback(async (): Promise<AuthSession | null> => {
    const next = await fetchSession();
    setSession(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      navVisibility: buildAppShellNavVisibility(session?.user?.role),
      refresh,
    }),
    [status, session, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
