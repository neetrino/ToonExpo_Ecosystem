import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BrandLogoProps = {
  href?: '/' | '/builder' | '/admin' | '/partner' | '/settings' | undefined;
  className?: string | undefined;
  badge?: string | undefined;
  /** Light text over imagery. */
  inverted?: boolean | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Hide the house mark (compact portal rails). */
  showMark?: boolean | undefined;
};

const wordmarkClassName = {
  sm: 'text-base leading-none',
  md: 'text-lg leading-7',
  lg: 'text-xl leading-none',
} as const;

const markClassName = {
  sm: 'size-[22px]',
  md: 'size-7',
  lg: 'size-8',
} as const;

const markPx = {
  sm: 22,
  md: 28,
  lg: 32,
} as const;

/**
 * TOON + EXPO wordmark with house mark — matches public header brand lockup.
 */
export const BrandLogo = ({
  href = '/',
  className,
  badge,
  inverted = false,
  size = 'md',
  showMark = true,
}: BrandLogoProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 font-brand font-extrabold tracking-[-0.025em]',
        wordmarkClassName[size],
        className,
      )}
    >
      {showMark ? (
        <span
          className={cn(
            'relative shrink-0 overflow-hidden',
            markClassName[size],
            inverted && 'brightness-0 invert',
          )}
        >
          <Image
            src="/brand/toon-house.svg"
            alt=""
            width={markPx[size]}
            height={markPx[size]}
            className="size-full"
            unoptimized
          />
        </span>
      ) : null}
      <span className="inline-flex whitespace-nowrap">
        <span className={inverted ? 'text-on-dark' : 'text-brand-deep'}>TOON</span>
        <span className={inverted ? 'text-on-dark/80' : 'text-brand-secondary'}>EXPO</span>
      </span>
      {badge ? (
        <span
          className={cn(
            'ml-1 self-center text-[10px] font-semibold uppercase tracking-[0.14em]',
            inverted ? 'text-on-dark/70' : 'text-ink-muted',
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
};
