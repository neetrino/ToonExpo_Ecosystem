'use client';

import type { PriceVisibility } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { CatalogRequestButton } from '@/features/buyer/components/catalog-request-button';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ApartmentPriceProps = {
  apartmentId: string;
  amount: string | null;
  currency: string;
  priceVisibility: PriceVisibility;
  projectId?: string | undefined;
  priceOnRequest?: boolean | undefined;
};

const useApartmentPriceLabel = ({
  apartmentId,
  amount,
  currency,
  priceVisibility,
}: ApartmentPriceProps): { label: string; revealed: boolean } => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;

  return {
    label: formatCatalogPrice({
      amount: effectiveAmount,
      currency: overlay?.priceCurrency ?? currency,
      locale,
      priceVisibility,
      onRequestLabel: t('price.onRequest'),
      signInLabel: t('price.signInToSee'),
    }),
    revealed: effectiveAmount != null,
  };
};

const PriceOnRequestCta = ({
  projectId,
  apartmentId,
  className,
}: {
  projectId: string;
  apartmentId: string;
  className?: string | undefined;
}) => (
  <CatalogRequestButton
    projectId={projectId}
    apartmentId={apartmentId}
    labelKey="requestPrice"
    appearance="priceLabel"
    className={className}
  />
);

/**
 * Apartment row price. SSR renders the anonymous cached value; after
 * hydration the authenticated overlay reveals `visible_after_login` prices.
 */
export const ApartmentPriceLabel = (props: ApartmentPriceProps) => {
  const { label } = useApartmentPriceLabel(props);
  if (props.priceOnRequest && props.projectId) {
    return (
      <PriceOnRequestCta
        projectId={props.projectId}
        apartmentId={props.apartmentId}
        className="font-brand text-sm font-semibold"
      />
    );
  }
  return <span className="font-brand font-semibold text-ink">{label}</span>;
};

/**
 * Apartment detail price heading: request CTA, sign-in, or numeric amount.
 */
export const ApartmentDetailPrice = ({
  className,
  ...props
}: ApartmentPriceProps & { className?: string | undefined }) => {
  const { label, revealed } = useApartmentPriceLabel(props);
  const headingClass = cn('font-brand text-3xl font-bold text-brand-deep', className);

  if (props.priceOnRequest && props.projectId) {
    return (
      <PriceOnRequestCta
        projectId={props.projectId}
        apartmentId={props.apartmentId}
        className={headingClass}
      />
    );
  }

  const needsSignIn = props.priceVisibility === 'visible_after_login' && !revealed;
  if (needsSignIn) {
    return (
      <p className={headingClass}>
        <Link href="/auth/login" className="underline-offset-4 hover:underline">
          {label}
        </Link>
      </p>
    );
  }

  return <p className={headingClass}>{label}</p>;
};
