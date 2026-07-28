import type { FormHTMLAttributes, ReactNode } from 'react';

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

/**
 * Form wrapper that ignores Chrome iOS autofill attr hydration noise
 * (`__gcruniqueid` injected before React hydrates).
 */
export const Form = ({ children, ...props }: FormProps) => (
  <form {...props} suppressHydrationWarning>
    {children}
  </form>
);
