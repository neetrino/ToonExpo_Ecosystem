'use client';

import { useTranslations } from 'next-intl';
import { useState, type MouseEvent } from 'react';

import { RequestFormPanel } from '@/features/buyer/components/request-form-panel';
import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';

export type CatalogRequestAppearance = 'button' | 'priceLabel';

type CatalogRequestButtonProps = {
  projectId: string;
  apartmentId?: string | undefined;
  /** Translation key under Catalog.actions */
  labelKey: 'requestPrice' | 'requestInfo';
  appearance?: CatalogRequestAppearance | undefined;
  className?: string | undefined;
};

const stopCardNavigation = (event: MouseEvent<HTMLElement>): void => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * Catalog CTA: anonymous → login; buyer → request panel.
 * Price-on-request label stays a clickable control for every signed-in account.
 */
export const CatalogRequestButton = (props: CatalogRequestButtonProps) => {
  const { projectId, apartmentId, labelKey, appearance = 'button', className } = props;
  const t = useTranslations('Catalog');
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();
  const isPriceLabel = appearance === 'priceLabel';
  const label = isPriceLabel ? t('price.onRequest') : t(`actions.${labelKey}`);
  const triggerClass = cn(
    isPriceLabel
      ? 'shrink-0 cursor-pointer font-brand font-bold text-brand-deep underline-offset-4 hover:underline'
      : undefined,
    className,
  );

  if (isLoading) {
    return isPriceLabel ? (
      <span className={cn(triggerClass, 'cursor-default')}>{label}</span>
    ) : null;
  }

  if (!user) {
    return (
      <Link
        href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`}
        className={cn('inline-flex underline', triggerClass)}
      >
        {isPriceLabel ? label : <Button type="button">{label}</Button>}
      </Link>
    );
  }

  if (user.accountType !== 'buyer' && !isPriceLabel) {
    return null;
  }

  return (
    <BuyerRequestControls
      projectId={projectId}
      apartmentId={apartmentId}
      label={label}
      defaultNote={labelKey === 'requestPrice' ? t('request.priceDefaultNote') : ''}
      title={t('request.title')}
      isPriceLabel={isPriceLabel}
      triggerClass={triggerClass}
      className={className}
    />
  );
};

type BuyerRequestControlsProps = {
  projectId: string;
  apartmentId?: string | undefined;
  label: string;
  defaultNote: string;
  title: string;
  isPriceLabel: boolean;
  triggerClass: string;
  className?: string | undefined;
};

const BuyerRequestControls = ({
  projectId,
  apartmentId,
  label,
  defaultNote,
  title,
  isPriceLabel,
  triggerClass,
  className,
}: BuyerRequestControlsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('flex flex-col gap-3', isPriceLabel ? 'shrink-0' : className)}>
      {isPriceLabel ? (
        <button
          type="button"
          className={cn(triggerClass, 'underline')}
          onClick={(event) => {
            stopCardNavigation(event);
            setOpen(true);
          }}
        >
          {label}
        </button>
      ) : (
        <Button type="button" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}
      {open ? (
        <RequestModal
          title={title}
          projectId={projectId}
          apartmentId={apartmentId}
          defaultNote={defaultNote}
          onClose={() => {
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};

const RequestModal = ({
  title,
  projectId,
  apartmentId,
  defaultNote,
  onClose,
}: {
  title: string;
  projectId: string;
  apartmentId?: string | undefined;
  defaultNote: string;
  onClose: () => void;
}) => (
  <div
    className={cn(
      'fixed inset-0 z-[var(--z-modal)] flex items-end justify-center p-4 sm:items-center',
      MODAL_BACKDROP_CLASS_NAME,
    )}
    role="dialog"
    aria-modal="true"
    aria-labelledby="request-panel-title"
    onClick={onClose}
    onKeyDown={(event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    }}
  >
    <Card
      className="w-full max-w-md shadow-sm"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <h2 id="request-panel-title" className="mb-4 text-lg font-semibold text-ink">
        {title}
      </h2>
      <RequestFormPanel
        projectId={projectId}
        apartmentId={apartmentId}
        defaultNote={defaultNote}
        onClose={onClose}
      />
    </Card>
  </div>
);
