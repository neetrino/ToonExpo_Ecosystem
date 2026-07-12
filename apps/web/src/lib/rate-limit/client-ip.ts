import { headers } from 'next/headers';

const UNKNOWN_CLIENT_IP = 'unknown';

/**
 * Best-effort client IP for rate-limit keys.
 * Prefers the first hop of `x-forwarded-for`, then `x-real-ip`.
 * Never stores email/password — IP (or unknown) only.
 */
export async function resolveClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  if (forwarded) {
    const firstHop = forwarded.split(',')[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }

  const realIp = headerStore.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return UNKNOWN_CLIENT_IP;
}
