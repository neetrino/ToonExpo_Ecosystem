import { slugSchema } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { scheduleAnalyticsEvent } from '@/lib/analytics/record-event';
import { getPublishedApartment, isValidApartmentId } from '@/lib/catalog/queries';
import { isFavorited } from '@/lib/favorites/queries';

import { ApartmentDetailView } from './apartment-detail-view';

type ApartmentDetailPageProps = {
  params: Promise<{
    locale: string;
    companySlug: string;
    projectSlug: string;
    apartmentId: string;
  }>;
};

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { locale, companySlug, projectSlug, apartmentId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');

  const parsedCompanySlug = slugSchema.safeParse(companySlug);
  const parsedProjectSlug = slugSchema.safeParse(projectSlug);
  if (
    !parsedCompanySlug.success ||
    !parsedProjectSlug.success ||
    !isValidApartmentId(apartmentId)
  ) {
    notFound();
  }

  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const isBuyer = session?.user?.role === 'BUYER';
  const buyerUserId = isBuyer ? session?.user?.id : undefined;

  const apartment = await getPublishedApartment(
    parsedCompanySlug.data,
    parsedProjectSlug.data,
    apartmentId,
    isAuthenticated,
  );
  if (!apartment) {
    notFound();
  }

  scheduleAnalyticsEvent({
    type: 'APARTMENT_VIEW',
    companyId: apartment.project.companyId,
    projectId: apartment.project.id,
    apartmentId: apartment.id,
  });

  const initialFavorited = buyerUserId
    ? await isFavorited(buyerUserId, { targetType: 'APARTMENT', targetId: apartment.id })
    : false;

  const prefill = session?.user
    ? {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
      }
    : undefined;

  const statusLabels: Record<ApartmentStatus, string> = {
    AVAILABLE: t('apartmentStatus.AVAILABLE'),
    RESERVED: t('apartmentStatus.RESERVED'),
    SOLD: t('apartmentStatus.SOLD'),
  };

  return (
    <section className="catalog-page">
      <ApartmentDetailView
        apartment={apartment}
        locale={locale}
        labels={{
          backToProject: t('apartment.backToProject', { project: apartment.project.name }),
          rooms: t('detail.table.rooms'),
          areaSqm: t('detail.table.areaSqm'),
          floor: t('apartment.floor'),
          building: t('apartment.building'),
          price: t('detail.table.priceAmd'),
          priceByRequest: t('apartment.priceByRequest'),
          priceHidden: t('apartment.priceHidden'),
          priceLoginRequired: t('apartment.priceLoginRequired'),
          loginLink: t('apartment.loginLink'),
          gallery: t('detail.gallery'),
          matterport: t('apartment.matterport'),
          noValue: t('detail.noValue'),
          statusLabels,
        }}
        prefill={prefill}
        favorite={{
          returnPath: `/${locale}/projects/${parsedCompanySlug.data}/${parsedProjectSlug.data}/apartments/${apartment.id}`,
          initialFavorited,
          isBuyer,
          isAuthenticated,
        }}
      />
    </section>
  );
}
