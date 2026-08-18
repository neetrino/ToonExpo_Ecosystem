import type { BuilderSummary, PublicPartnerListItem } from '@toonexpo/contracts';

import { BuilderCard } from '@/features/catalog/components/builder-card';
import { PartnerCard } from '@/features/catalog/components/partner-card';
import {
  CATALOG_RESULTS_SCROLL_ID,
  CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
} from '@/features/catalog/constants/catalog-list';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_DURATION_MS, StaggerGroup } from '@/shared/ui/motion';

type ExhibitorCatalogResultsProps = {
  emptyLabel: string;
  builders?: readonly BuilderSummary[] | undefined;
  partners?: readonly PublicPartnerListItem[] | undefined;
};

/**
 * Exhibitors grid — builders or partner cards for the active tab.
 */
export const ExhibitorCatalogResults = ({
  emptyLabel,
  builders,
  partners,
}: ExhibitorCatalogResultsProps) => {
  const items = builders ?? partners ?? [];
  if (items.length === 0) {
    return (
      <p
        id={CATALOG_RESULTS_SCROLL_ID}
        className={cn(
          'mt-10 rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted',
          CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
        )}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <StaggerGroup
      id={CATALOG_RESULTS_SCROLL_ID}
      className={cn(
        'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>*]:h-full [&>*]:min-w-0',
        CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
      )}
      baseDelayMs={0}
      staggerMs={0}
      durationMs={LIST_CARD_DURATION_MS}
    >
      {builders
        ? builders.map((builder) => <BuilderCard key={builder.id} builder={builder} />)
        : (partners ?? []).map((partner) => <PartnerCard key={partner.id} partner={partner} />)}
    </StaggerGroup>
  );
};
