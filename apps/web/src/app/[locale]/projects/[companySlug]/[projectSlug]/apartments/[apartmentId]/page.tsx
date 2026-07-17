import { slugSchema } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { scheduleAnalyticsEvent } from '@/lib/analytics/record-event';
import { resolveRequestUserAgent } from '@/lib/analytics/request-user-agent';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';
import { getPublishedApartment, isValidApartmentId } from '@/lib/catalog/queries';
import { loadWebEnv } from '@/lib/env';
import { isFavorited } from '@/lib/favorites/queries';
import { buildApartmentJsonLd } from '@/lib/seo/json-ld';
import { JsonLdScript } from '@/lib/seo/json-ld-script';
import { buildPublicPageMetadata } from '@/lib/seo/metadata';

import { ApartmentDetailView } from './apartment-detail-view';

type ApartmentDetailPageProps = {
  params: Promise<{
    locale: string;
    companySlug: string;
    projectSlug: string;
    apartmentId: string;
  }>;
};

export async function generateMetadata({ params }: ApartmentDetailPageProps): Promise<Metadata> {
  const { locale, companySlug, projectSlug, apartmentId } = await params;
  const parsedCompanySlug = slugSchema.safeParse(companySlug);
  const parsedProjectSlug = slugSchema.safeParse(projectSlug);
  if (
    !parsedCompanySlug.success ||
    !parsedProjectSlug.success ||
    !isValidApartmentId(apartmentId)
  ) {
    return {};
  }

  const apartment = await getPublishedApartment(
    parsedCompanySlug.data,
    parsedProjectSlug.data,
    apartmentId,
  );
  if (!apartment) {
    return {};
  }

  const { APP_URL } = loadWebEnv();
  const t = await getTranslations({ locale, namespace: 'catalog' });

  return buildPublicPageMetadata({
    titleName: `${apartment.project.name} — ${apartment.code}`,
    titleContext: apartment.project.companyName,
    description: null,
    descriptionFallback: t('apartment.seoFallback', {
      code: apartment.code,
      project: apartment.project.name,
      company: apartment.project.companyName,
    }),
    path: `/${locale}/projects/${apartment.project.companySlug}/${apartment.project.slug}/apartments/${apartment.id}`,
    appUrl: APP_URL,
    locale,
    imageUrl: apartment.media[0]?.url ?? null,
  });
}

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
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const sessionCookie = sessionToken ? `${SESSION_COOKIE_NAME}=${sessionToken}` : undefined;
  const isAuthenticated = Boolean(session?.user);
  const isBuyer = session?.user?.role === 'BUYER';
  const buyerUserId = isBuyer ? session?.user?.id : undefined;

  const apartment = await getPublishedApartment(
    parsedCompanySlug.data,
    parsedProjectSlug.data,
    apartmentId,
    sessionCookie,
  );
  if (!apartment) {
    notFound();
  }

  scheduleAnalyticsEvent({
    type: 'APARTMENT_VIEW',
    companyId: apartment.project.companyId,
    projectId: apartment.project.id,
    apartmentId: apartment.id,
    userAgent: await resolveRequestUserAgent(),
  });

  const initialFavorited = buyerUserId
    ? await isFavorited({ targetType: 'APARTMENT', targetId: apartment.id })
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
      <JsonLdScript
        data={buildApartmentJsonLd({
          apartment,
          locale,
          appUrl: loadWebEnv().APP_URL,
        })}
      />
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
