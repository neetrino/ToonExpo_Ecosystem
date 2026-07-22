import { getTranslations } from 'next-intl/server';

import { cn } from '@/shared/ui/cn';

/** Illustrative preview values until live calculator inputs drive this card. */
const PREVIEW_PROPERTY_PRICE = '$1,240,000';
const PREVIEW_DOWN_AMOUNT = '$248,000';
const PREVIEW_TERM = '30 yr · 5.92%';
const PREVIEW_MONTHLY = '$5,842.12';
const PREVIEW_PRICE_PROGRESS = 67;

/**
 * Static mortgage estimate preview card — Figma node `81:442`.
 */
export const MortgagePreviewCard = async () => {
  const t = await getTranslations('HomePage.mortgage.preview');

  return (
    <div className={cn('rounded-[24px] bg-surface-elevated p-8', 'ring-1 ring-header-border')}>
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
            {t('propertyPrice')}
          </p>
          <p className="mt-1 font-brand text-[2.25rem] font-bold leading-10 text-ink-navy">
            {PREVIEW_PROPERTY_PRICE}
          </p>
          <progress
            className={cn(
              'mt-4 h-1.5 w-full appearance-none overflow-hidden rounded-pill bg-header-border',
              '[&::-webkit-progress-bar]:rounded-pill [&::-webkit-progress-bar]:bg-header-border',
              '[&::-webkit-progress-value]:rounded-pill [&::-webkit-progress-value]:bg-brand-secondary',
              '[&::-moz-progress-bar]:rounded-pill [&::-moz-progress-bar]:bg-brand-secondary',
            )}
            max={100}
            value={PREVIEW_PRICE_PROGRESS}
            aria-hidden
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-brand-soft/50 p-4">
            <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
              {t('downPayment')}
            </p>
            <p className="mt-1 font-brand text-lg font-bold leading-7 text-ink-navy">
              {PREVIEW_DOWN_AMOUNT}
            </p>
          </div>
          <div className="rounded-md bg-brand-soft/50 p-4">
            <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
              {t('term')}
            </p>
            <p className="mt-1 font-brand text-lg font-bold leading-7 text-ink-navy">
              {PREVIEW_TERM}
            </p>
          </div>
        </div>

        <div className="rounded-md bg-brand-deep p-5">
          <p className="text-[10px] font-bold tracking-widest text-canvas/60 uppercase">
            {t('estimatedMonthly')}
          </p>
          <p className="mt-1 font-brand text-[1.875rem] font-bold leading-9 text-canvas">
            {PREVIEW_MONTHLY}
          </p>
        </div>
      </div>
    </div>
  );
};
