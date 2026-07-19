'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { SetPasswordForm } from '@/features/auth/components/set-password-form';
import {
  extractSetPasswordTokenFromHash,
  stripSetPasswordTokenFromUrl,
} from '@/features/auth/utils/extract-set-password-token';

/**
 * Client-only token gate: reads `#token=` from the URL fragment, strips it,
 * then renders the form or invalid-token messaging.
 */
export const SetPasswordPageContent = () => {
  const t = useTranslations('Auth');
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const extracted = extractSetPasswordTokenFromHash(window.location.hash);
    stripSetPasswordTokenFromUrl();
    setToken(extracted);
  }, []);

  if (token === undefined) {
    return null;
  }

  if (token) {
    return <SetPasswordForm token={token} />;
  }

  return (
    <div role="alert" className="flex flex-col gap-2 text-sm text-danger">
      <p>{t('errors.invalidToken')}</p>
      <p className="text-ink-secondary">{t('setPassword.supportHint')}</p>
    </div>
  );
};
