'use client';

import { useTranslations } from 'next-intl';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { cn } from '@/shared/ui/cn';
import { FORM_CONTROL_TEXT_CLASS } from '@/shared/ui/form-control-text';
import { FormField } from '@/shared/ui/form-field';
import { Switch } from '@/shared/ui/switch';

type VerifiedStatusFieldProps<T extends FieldValues> = {
  id: string;
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean | undefined;
};

/**
 * Shared Verified switch — same chrome as other form fields.
 */
export const VerifiedStatusField = <T extends FieldValues>({
  id,
  control,
  name,
  disabled = false,
}: VerifiedStatusFieldProps<T>) => {
  const t = useTranslations('Builder.verified');
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const checked = Boolean(field.value);
        return (
          <FormField id={id} label={t('label')}>
            <div className="flex h-11 w-full items-center justify-between gap-3 rounded-sm border border-border bg-surface-elevated px-4">
              <span
                className={cn(
                  'min-w-0 truncate',
                  FORM_CONTROL_TEXT_CLASS,
                  checked ? 'text-ink' : 'text-ink-muted',
                )}
              >
                {checked ? t('on') : t('placeholder')}
              </span>
              <Switch
                id={id}
                checked={checked}
                disabled={disabled}
                aria-label={t('label')}
                onCheckedChange={field.onChange}
              />
            </div>
          </FormField>
        );
      }}
    />
  );
};
