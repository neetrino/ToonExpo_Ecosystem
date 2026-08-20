'use client';

import { CatalogRequestButton } from '@/features/buyer/components/catalog-request-button';
import { cn } from '@/shared/ui/cn';

type ProjectPriceCtaProps = {
  projectId: string;
  priceOnRequest: boolean;
  priceLabel: string;
  className?: string | undefined;
};

/**
 * Project listing price: numeric label, or a request button when the builder enabled it.
 */
export const ProjectPriceCta = ({
  projectId,
  priceOnRequest,
  priceLabel,
  className,
}: ProjectPriceCtaProps) => {
  if (!priceOnRequest) {
    return <p className={className}>{priceLabel}</p>;
  }

  return (
    <CatalogRequestButton
      projectId={projectId}
      labelKey="requestPrice"
      appearance="priceLabel"
      className={cn(className, 'text-left')}
    />
  );
};
