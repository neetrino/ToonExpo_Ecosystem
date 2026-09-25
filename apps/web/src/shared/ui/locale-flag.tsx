import { cn } from '@/shared/ui/cn';

type LocaleFlagProps = {
  locale: string;
  className?: string | undefined;
  title?: string | undefined;
};

/**
 * Compact flag mark for hy / ru / en — fills its frame edge-to-edge.
 */
export const LocaleFlag = ({ locale, className, title }: LocaleFlagProps) => {
  const label = title ?? locale.toUpperCase();

  return (
    <span
      className={cn(
        'relative inline-block h-3.5 w-[1.166rem] shrink-0 overflow-hidden rounded-[2px]',
        className,
      )}
      aria-hidden
      title={label}
    >
      {locale === 'hy' ? <ArmeniaFlagSvg /> : null}
      {locale === 'ru' ? <RussiaFlagSvg /> : null}
      {locale === 'en' ? <UkFlagSvg /> : null}
      {locale !== 'hy' && locale !== 'ru' && locale !== 'en' ? (
        <span className="absolute inset-0 flex items-center justify-center bg-surface text-[7px] font-bold text-ink">
          {locale.slice(0, 2).toUpperCase()}
        </span>
      ) : null}
    </span>
  );
};

const flagSvgClass = 'absolute inset-0 block size-full';

const ArmeniaFlagSvg = () => (
  <svg viewBox="0 0 16 12" preserveAspectRatio="none" className={flagSvgClass} focusable="false">
    <rect width="16" height="4" y="0" fill="#D90012" />
    <rect width="16" height="4" y="4" fill="#0033A0" />
    <rect width="16" height="4" y="8" fill="#F2A800" />
  </svg>
);

const RussiaFlagSvg = () => (
  <svg viewBox="0 0 16 12" preserveAspectRatio="none" className={flagSvgClass} focusable="false">
    <rect width="16" height="4" y="0" fill="#FFFFFF" />
    <rect width="16" height="4" y="4" fill="#0039A6" />
    <rect width="16" height="4" y="8" fill="#D52B1E" />
  </svg>
);

const UkFlagSvg = () => (
  <svg viewBox="0 0 16 12" preserveAspectRatio="none" className={flagSvgClass} focusable="false">
    <rect width="16" height="12" fill="#012169" />
    <path d="M0 0 L16 12 M16 0 L0 12" stroke="#FFFFFF" strokeWidth="2.4" />
    <path d="M0 0 L16 12 M16 0 L0 12" stroke="#C8102E" strokeWidth="1.2" />
    <path d="M8 0 V12 M0 6 H16" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M8 0 V12 M0 6 H16" stroke="#C8102E" strokeWidth="2" />
  </svg>
);
