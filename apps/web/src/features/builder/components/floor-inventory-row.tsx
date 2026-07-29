'use client';

import type { PortalFloorSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { AddApartmentsSheet } from '@/features/builder/components/add-apartments-sheet';
import { EditFloorMediaForm } from '@/features/builder/components/edit-floor-media-form';
import { usePortalFloorApartmentsQuery } from '@/features/builder/hooks/use-portal-inventory';
import { Link } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';

type FloorInventoryRowProps = {
  projectId: string;
  floor: PortalFloorSummary;
};

/**
 * Floor row with apartment list and bulk-add sheet.
 */
export const FloorInventoryRow = ({ projectId, floor }: FloorInventoryRowProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.inventory');
  const [addOpen, setAddOpen] = useState(false);
  const apartmentsQuery = usePortalFloorApartmentsQuery(floor.id);

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">
            {floor.name || floor.displayLabel
              ? t('floorLabelNamed', {
                  number: floor.number,
                  name: floor.name ?? floor.displayLabel ?? '',
                })
              : t('floorLabel', { number: floor.number })}
          </p>
          <p className="text-xs text-ink-muted">
            {t('apartmentsCount', { count: floor.apartmentsCount })} ·{' '}
            {t(`publication.${floor.publicationStatus}`)}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-pill border border-border-strong px-3 text-sm font-medium text-ink hover:bg-surface"
          onClick={() => {
            setAddOpen(true);
          }}
        >
          <AddActionLabel>{t('addApartments')}</AddActionLabel>
        </button>
      </div>

      {apartmentsQuery.isLoading ? (
        <p className="mt-2 text-xs text-ink-secondary">{t('loading')}</p>
      ) : null}

      {apartmentsQuery.data && apartmentsQuery.data.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {apartmentsQuery.data.map((apartment) => (
            <li key={apartment.id} className="text-sm">
              <Link
                href={catalogApartmentDetailHref(scope, apartment.id)}
                className="text-brand hover:underline"
              >
                {t('apartmentLink', {
                  number: apartment.number,
                  status: apartment.salesStatus,
                })}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <EditFloorMediaForm projectId={projectId} floor={floor} />

      <AddApartmentsSheet
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
        }}
        projectId={projectId}
        floorId={floor.id}
      />
    </div>
  );
};
