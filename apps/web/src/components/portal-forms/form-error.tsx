'use client';

import { useTranslations } from 'next-intl';

type PortalFormErrorProps = {
  errorKey?: string;
  namespace?:
    | 'portal.errors'
    | 'admin.catalog.errors'
    | 'catalog.request.errors'
    | 'qr.builder.errors'
    | 'buyer.qr.errors';
};

export function PortalFormError({ errorKey, namespace = 'portal.errors' }: PortalFormErrorProps) {
  const t = useTranslations(namespace);

  if (!errorKey) {
    return null;
  }

  return (
    <p role="alert" className="portal-form__error">
      {t(errorKey)}
    </p>
  );
}
