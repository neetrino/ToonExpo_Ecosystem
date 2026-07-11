'use client';

import { useTranslations } from 'next-intl';

import type { BuilderMutationErrorKey } from '@/lib/builder/mutations';

type PortalFormErrorProps = {
  errorKey?: BuilderMutationErrorKey;
};

export function PortalFormError({ errorKey }: PortalFormErrorProps) {
  const t = useTranslations('portal.errors');

  if (!errorKey) {
    return null;
  }

  return (
    <p role="alert" className="portal-form__error">
      {t(errorKey)}
    </p>
  );
}
