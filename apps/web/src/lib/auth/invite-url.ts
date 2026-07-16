import { DEFAULT_LOCALE } from '@toonexpo/shared';

import { loadWebEnv } from '@/lib/env';

/**
 * Public set-password link for an invite email. Uses the default locale
 * (`en`) since the invitee's preferred locale is not known at send time.
 */
export function buildInviteUrl(rawToken: string): string {
  const { APP_URL } = loadWebEnv();
  return `${APP_URL}/${DEFAULT_LOCALE}/invite/${rawToken}`;
}
