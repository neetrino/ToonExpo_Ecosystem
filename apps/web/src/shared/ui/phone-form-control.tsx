'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { PhoneInput, type PhoneInputProps } from '@/shared/ui/phone-input';

type PhoneFormControlProps<TFieldValues extends FieldValues> = Omit<
  PhoneInputProps,
  'value' | 'onChange' | 'name'
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

/**
 * react-hook-form adapter for {@link PhoneInput} (stores `+` + digits).
 */
export const PhoneFormControl = <TFieldValues extends FieldValues>({
  control,
  name,
  ...inputProps
}: PhoneFormControlProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <PhoneInput
        {...inputProps}
        name={field.name}
        value={typeof field.value === 'string' ? field.value : ''}
        onBlur={field.onBlur}
        ref={field.ref}
        onChange={field.onChange}
      />
    )}
  />
);
