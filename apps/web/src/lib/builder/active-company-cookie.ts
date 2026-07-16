import { cookies } from 'next/headers';

/** HttpOnly cookie holding the active builder company id for portal context. */
export const ACTIVE_COMPANY_COOKIE = 'toonexpo_active_company';

/** Active-company cookie lifetime (8 hours). */
export const ACTIVE_COMPANY_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

/** Reads the active company id from the cookie, or null when unset/blank. */
export async function readActiveCompanyId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(ACTIVE_COMPANY_COOKIE)?.value?.trim();
  return value && value.length > 0 ? value : null;
}

/** Sets the active company cookie (Server Actions / Route Handlers only). */
export async function setActiveCompanyCookie(companyId: string): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_COMPANY_COOKIE, companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACTIVE_COMPANY_COOKIE_MAX_AGE_SECONDS,
  });
}

/** Clears the active company cookie (Server Actions / Route Handlers only). */
export async function clearActiveCompanyCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACTIVE_COMPANY_COOKIE);
}
