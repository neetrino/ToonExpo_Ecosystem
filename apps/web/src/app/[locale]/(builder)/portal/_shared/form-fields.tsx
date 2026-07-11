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
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'number' | 'email';
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
    />
  );
}

export function PortalTextArea({
  name,
  defaultValue,
  maxLength,
  rows = 4,
}: {
  name: string;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <textarea
      className="portal-form__textarea"
      id={name}
      name={name}
      defaultValue={defaultValue}
      maxLength={maxLength}
      rows={rows}
    />
  );
}

export function PortalSelect({
  name,
  defaultValue,
  required,
  children,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <select
      className="portal-form__select"
      id={name}
      name={name}
      defaultValue={defaultValue}
      required={required}
    >
      {children}
    </select>
  );
}
