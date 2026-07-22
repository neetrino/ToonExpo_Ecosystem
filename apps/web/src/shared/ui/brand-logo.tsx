import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BrandLogoProps = {
  href?: '/' | '/builder' | '/admin' | '/partner' | '/settings' | undefined;
  className?: string | undefined;
  badge?: string | undefined;
  /** Light text over imagery (hero header). */
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

/** Figma header lockup on hero — roof brand-logo, body white (`81:607`). */
const HERO_HOUSE_ROOF = 'var(--color-brand-logo)';
const HERO_HOUSE_BODY = 'var(--color-on-dark)';
/** Solid surfaces — roof brand-logo, body brand-deep. */
const SOLID_HOUSE_ROOF = 'var(--color-brand-logo)';
const SOLID_HOUSE_BODY = 'var(--color-brand-deep)';

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
  const roofFill = inverted ? HERO_HOUSE_ROOF : SOLID_HOUSE_ROOF;
  const bodyFill = inverted ? HERO_HOUSE_BODY : SOLID_HOUSE_BODY;

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
        <span className={cn('relative shrink-0', markClassName[size])} aria-hidden>
          <HouseMark roofFill={roofFill} bodyFill={bodyFill} />
        </span>
      ) : null}
      <span className="inline-flex whitespace-nowrap">
        <span className={inverted ? 'text-on-dark' : 'text-brand-deep'}>TOON</span>
        <span className={inverted ? 'text-brand-logo' : 'text-brand-secondary'}>EXPO</span>
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

type HouseMarkProps = {
  roofFill: string;
  bodyFill: string;
};

/** House mark paths from Figma node `81:607` (28×28). */
const HouseMark = ({ roofFill, bodyFill }: HouseMarkProps) => {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
      <path
        d="M3.5 15.75L14 5.25L19.25 9.625V6.125H22.75V12.25L24.5 14V15.75H3.5Z"
        fill={roofFill}
      />
      <path d="M6.125 15.75H21.875V22.75H6.125V15.75Z" fill={bodyFill} />
    </svg>
  );
};
