'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { TranslationLocale } from '@/features/builder/components/translation-tabs';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

/**
 * Validation toasts + tab focus for multilingual project create/edit forms.
 */
export const useProjectFormErrorToast = (): ReturnType<typeof useFormErrorToast> & {
  focusLocale: TranslationLocale | undefined;
  focusTick: number;
} => {
  const t = useTranslations('Builder.projects');
  const [focusLocale, setFocusLocale] = useState<TranslationLocale | undefined>();
  const [focusTick, setFocusTick] = useState(0);
  const toast = useFormErrorToast({
    fieldLabels: {
      name: t('form.name'),
      slug: t('form.slug'),
      shortDescription: t('form.shortDescription'),
      fullDescription: t('form.fullDescription'),
      locationText: t('form.locationText'),
      district: t('form.district'),
      projectType: t('form.projectType'),
      coverMediaId: t('form.coverMedia'),
    },
    onTranslationError: (locale) => {
      setFocusLocale(locale);
      setFocusTick((tick) => tick + 1);
    },
  });

  return { ...toast, focusLocale, focusTick };
};
