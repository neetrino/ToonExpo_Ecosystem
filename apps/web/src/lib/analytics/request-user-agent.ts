import { headers } from 'next/headers';

/** Best-effort User-Agent for analytics bot filtering. */
export async function resolveRequestUserAgent(): Promise<string | undefined> {
  const headerStore = await headers();
  return headerStore.get('user-agent') ?? undefined;
}
