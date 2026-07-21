import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BrandLogoProps = {
  href?: '/' | '/builder' | '/admin' | '/partner' | '/profile' | undefined;
  className?: string | undefined;
  badge?: string | undefined;
  /** Light text over imagery. */
  inverted?: boolean | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
};

const sizeClassName = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
} as const;

/**
 * TOON + EXPO wordmark used across public and portal shells.
 */
export const BrandLogo = ({
  href = '/',
  className,
  badge,
  inverted = false,
  size = 'md',
}: BrandLogoProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'font-brand font-extrabold tracking-[-0.04em]',
        sizeClassName[size],
        inverted ? 'text-on-dark' : 'text-ink',
        className,
      )}
    >
      <span>TOON</span>
      <span className="text-brand">EXPO</span>
      {badge ? (
        <span
          className={cn(
            'ml-2 text-[10px] font-semibold uppercase tracking-[0.14em]',
            inverted ? 'text-on-dark/70' : 'text-ink-muted',
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
};
