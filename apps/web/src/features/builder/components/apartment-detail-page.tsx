'use client';

import { catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useTranslations } from 'next-intl';

import { EditApartmentForm } from '@/features/builder/components/edit-apartment-form';
import { usePortalApartmentQuery } from '@/features/builder/hooks/use-portal-inventory';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';

type ApartmentDetailPageProps = {
  apartmentId: string;
};

/**
 * Apartment edit page linked from project inventory.
 */
export const ApartmentDetailPage = ({ apartmentId }: ApartmentDetailPageProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.apartments');
  const query = usePortalApartmentQuery(apartmentId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('notFound')}
      </p>
    );
  }

  const apartment = query.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={catalogProjectDetailHref(scope, apartment.projectId)}
          className="text-sm text-ink-secondary hover:text-ink"
        >
          {t('back')}
        </Link>
        <h1 className="text-page-title text-ink">{t('title', { number: apartment.number })}</h1>
        <p className="text-sm text-ink-secondary">
          {t(`salesStatus.${apartment.salesStatus}`)} ·{' '}
          {t(`publication.${apartment.publicationStatus}`)}
        </p>
      </div>
      <Card>
        <EditApartmentForm apartment={apartment} />
      </Card>
    </div>
  );
};
