import { NextResponse } from 'next/server';

/**
 * Sprint 0 placeholder. Sprint 1 will enforce Auth.js session checks.
 */
export function requireSessionPlaceholder(isAuthenticated: boolean): NextResponse | null {
  if (isAuthenticated) {
    return null;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
