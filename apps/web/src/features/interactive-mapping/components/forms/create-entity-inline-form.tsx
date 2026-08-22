'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/ui/button';
import { useErrorToast } from '@/shared/ui/use-error-toast';

import {
  resolveCreateEntityError,
  type CreateEntitySubmitErrorKind,
} from '../../utils/resolve-create-entity-error';

const NON_DIGIT = /\D/g;

export type CreateEntityInlineFormProps = {
  title: string;
  submitLabel: string;
  pendingLabel?: string;
  nameLabel: string;
  namePlaceholder?: string;
  /** Restrict input to ASCII digits (apartment numbers). */
  digitsOnly?: boolean | undefined;
  /** Maps known API failures (e.g. duplicate floor number) to toast copy. */
  submitErrorKind?: CreateEntitySubmitErrorKind | undefined;
  onSubmit: (name: string) => Promise<void>;
};

/**
 * Minimal inline name form for district / building / apartment create.
 */
export const CreateEntityInlineForm = ({
  title,
  submitLabel,
  pendingLabel,
  nameLabel,
  namePlaceholder,
  digitsOnly = false,
  submitErrorKind,
  onSubmit,
}: CreateEntityInlineFormProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const { showError, errorToast } = useErrorToast();
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setValidationError(nameLabel);
      return;
    }
    if (digitsOnly && !/^\d+$/.test(trimmed)) {
      setValidationError(nameLabel);
      return;
    }
    setPending(true);
    setValidationError(null);
    try {
      await onSubmit(trimmed);
      setName('');
    } catch (submitError) {
      showError(
        resolveCreateEntityError(submitError, {
          kind: submitErrorKind,
          submittedValue: trimmed,
          floorNumberExists: (values) => t('forms.errors.floorNumberExists', values),
          generic: t('forms.errors.generic'),
        }),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <form
        className="mt-4 space-y-2 rounded-[15px] border border-border bg-background p-3"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink">{title}</p>
        <label className="block space-y-1 text-xs text-ink-muted">
          <span>{nameLabel}</span>
          <input
            type="text"
            inputMode={digitsOnly ? 'numeric' : 'text'}
            pattern={digitsOnly ? '[0-9]*' : undefined}
            required
            minLength={1}
            value={name}
            placeholder={namePlaceholder}
            onChange={(event) => {
              const next = event.target.value;
              setName(digitsOnly ? next.replace(NON_DIGIT, '') : next);
            }}
            className="w-full rounded-[15px] border border-border bg-background px-3 py-2 text-base text-ink lg:text-sm"
          />
        </label>
        {validationError ? (
          <p role="alert" className="text-xs text-danger">
            {validationError}
          </p>
        ) : null}
        <Button type="submit" size="sm" disabled={pending} className="w-full">
          {pending ? (pendingLabel ?? submitLabel) : submitLabel}
        </Button>
      </form>
      {errorToast}
    </>
  );
};
