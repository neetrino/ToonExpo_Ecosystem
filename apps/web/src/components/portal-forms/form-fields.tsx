'use client';

import type { ReactNode } from 'react';

type PortalFormFieldProps = {
  label: string;
  name: string;
  children: ReactNode;
  hint?: string;
};

export function PortalFormField({ label, name, children, hint }: PortalFormFieldProps) {
  return (
    <label className="portal-form__field" htmlFor={name}>
      <span className="portal-form__label">{label}</span>
      {children}
      {hint ? <span className="portal-form__hint">{hint}</span> : null}
    </label>
  );
}

export function PortalTextInput({
  name,
  defaultValue,
  required,
  maxLength,
  type = 'text',
  readOnly,
  min,
  max,
}: {
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'number' | 'email' | 'datetime-local';
  readOnly?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <input
      className="portal-form__input"
      id={name}
      name={name}
      type={type}
      defaultValue={defaultValue}
      required={required}
      maxLength={maxLength}
      readOnly={readOnly}
      min={min}
      max={max}
    />
  );
}

export function PortalTextArea({
  name,
  defaultValue,
  maxLength,
  rows = 4,
  required,
}: {
  name: string;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      className="portal-form__textarea"
      id={name}
      name={name}
      defaultValue={defaultValue}
      maxLength={maxLength}
      rows={rows}
      required={required}
    />
  );
}

export function PortalSelect({
  name,
  defaultValue,
  value,
  required,
  disabled,
  onChange,
  children,
}: {
  name: string;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <select
      className="portal-form__select"
      id={name}
      name={name}
      defaultValue={defaultValue}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
    >
      {children}
    </select>
  );
}
