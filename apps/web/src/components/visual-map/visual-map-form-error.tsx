'use client';

import type { VisualMapMutationErrorKey } from '@/lib/visual-map/mutation-result';
import { useTranslations } from 'next-intl';

type VisualMapFormErrorProps = {
  errorKey?: VisualMapMutationErrorKey | string;
};

export function VisualMapFormError({ errorKey }: VisualMapFormErrorProps) {
  const t = useTranslations('portal.visualMap.errors');

  if (!errorKey) {
    return null;
  }

  return (
    <p role="alert" className="portal-form__error">
      {t(errorKey)}
    </p>
  );
}
