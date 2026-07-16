import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

const TE_BUTTON_BASE =
  'inline-flex items-center justify-center rounded-[var(--te-radius)] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

const TE_BUTTON_VARIANTS = {
  primary: 'bg-[var(--te-accent)] text-white',
  secondary:
    'border border-[var(--te-border)] bg-[var(--te-card)] text-[var(--te-fg)] shadow-[var(--te-shadow-soft)]',
  ghost: 'bg-transparent text-[var(--te-fg)] hover:bg-[var(--te-bg-soft)]',
} as const;

export type TeButtonVariant = keyof typeof TE_BUTTON_VARIANTS;

type TeButtonSharedProps = {
  variant?: TeButtonVariant;
  children: ReactNode;
  className?: string;
};

type TeButtonAsButton = TeButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type TeButtonAsLink = TeButtonSharedProps & {
  href: string;
};

export type TeButtonProps = TeButtonAsButton | TeButtonAsLink;

function teButtonClassName(variant: TeButtonVariant, className?: string): string {
  return [TE_BUTTON_BASE, TE_BUTTON_VARIANTS[variant], className].filter(Boolean).join(' ');
}

export function TeButton(props: TeButtonProps) {
  const variant = props.variant ?? 'primary';
  const className = teButtonClassName(variant, props.className);

  if ('href' in props && props.href !== undefined) {
    const { href, children } = props;
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const { children, type = 'button', ...rest } = props;
  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
