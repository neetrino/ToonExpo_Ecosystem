'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/ui/button';

const NON_DIGIT = /\D/g;

export type CreateEntityInlineFormProps = {
  title: string;
  submitLabel: string;
  pendingLabel?: string;
  nameLabel: string;
  namePlaceholder?: string;
  /** Restrict input to ASCII digits (apartment numbers). */
  digitsOnly?: boolean | undefined;
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
  onSubmit,
}: CreateEntityInlineFormProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError(nameLabel);
      return;
    }
    if (digitsOnly && !/^\d+$/.test(trimmed)) {
      setError(nameLabel);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setName('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="mt-4 space-y-2 rounded-sm border border-border bg-background p-3"
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
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? (pendingLabel ?? submitLabel) : submitLabel}
      </Button>
    </form>
  );
};
