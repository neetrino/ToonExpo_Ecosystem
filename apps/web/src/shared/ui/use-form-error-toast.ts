'use client';

import { useTranslations } from 'next-intl';
import { useCallback, type ReactNode } from 'react';

import {
  describeFirstFormError,
  getFirstErrorTranslationLocale,
  type FormErrorMessageKind,
  type TranslationContentLocale,
} from '@/shared/ui/form-error-message';
import { useErrorToast } from '@/shared/ui/use-error-toast';

type UseFormErrorToastOptions = {
  fieldLabels?: Record<string, string> | undefined;
  onTranslationError?: ((locale: TranslationContentLocale) => void) | undefined;
};

type FormErrorCopy = ReturnType<typeof useTranslations<'Common.formErrors'>>;

const toToastMessage = (described: FormErrorMessageKind, t: FormErrorCopy): string => {
  switch (described.kind) {
    case 'raw':
      return described.message;
    case 'required':
      return t('required', { field: described.field });
    case 'requiredInLanguage':
      return t('requiredInLanguage', {
        field: described.field,
        language: t(`languages.${described.language}`),
      });
    case 'tooLong':
      return t('tooLong', { field: described.field });
    case 'invalid':
      return t('invalid', { field: described.field });
    case 'generic':
      return t('generic');
  }
};

/**
 * Shows a red toast for the first react-hook-form validation error on submit.
 */
export const useFormErrorToast = (
  options: UseFormErrorToastOptions = {},
): {
  showError: (message: string) => void;
  onInvalid: (errors: object) => void;
  errorToast: ReactNode;
} => {
  const t = useTranslations('Common.formErrors');
  const { showError, errorToast } = useErrorToast();
  const { fieldLabels, onTranslationError } = options;

  const onInvalid = useCallback(
    (errors: object) => {
      const locale = getFirstErrorTranslationLocale(errors);
      if (locale) {
        onTranslationError?.(locale);
      }
      showError(toToastMessage(describeFirstFormError(errors, fieldLabels ?? {}), t));
    },
    [fieldLabels, onTranslationError, showError, t],
  );

  return { showError, onInvalid, errorToast };
};
