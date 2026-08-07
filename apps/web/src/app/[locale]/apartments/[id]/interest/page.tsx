import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { QrInterestLanding } from '@/features/buyer/components/qr-interest-landing';
import { QrInterestRequestSection } from '@/features/buyer/components/qr-interest-request-section';
import { getApartment, getProject } from '@/features/catalog/api/catalog-api';

type ApartmentInterestPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadApartment = cache((id: string, locale: string) => getApartment(id, { locale }));

export const generateMetadata = async ({
  params,
}: ApartmentInterestPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const apartment = await loadApartment(id, locale);

  if (!apartment) {
    return { title: t('apartment.notFoundTitle') };
  }

  return {
    title: t('qrInterest.metaTitleApartment', {
      number: apartment.number,
      project: apartment.project.name,
    }),
    description: t('qrInterest.metaDescription'),
  };
};

/**
 * Apartment QR landing — plan/cover + notes form → builder CRM request.
 */
export default async function ApartmentInterestPage({ params }: ApartmentInterestPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const apartment = await loadApartment(id, locale);
  if (!apartment) {
    notFound();
  }

  const project = await getProject(apartment.project.id, { locale });
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  const imageUrl = apartment.plan?.fileUrl ?? project?.cover?.fileUrl ?? null;
  const imageAlt =
    apartment.plan?.altText ??
    project?.cover?.altText ??
    t('qrInterest.apartmentImageAlt', { number: apartment.number });

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <QrInterestLanding
          title={t('qrInterest.apartmentTitle', {
            number: apartment.number,
            project: apartment.project.name,
          })}
          subtitle={t('qrInterest.subtitleApartment', { builder: apartment.builder.name })}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          detailsHref={`/apartments/${apartment.id}`}
          detailsLabel={t('qrInterest.viewDetails')}
        >
          <QrInterestRequestSection projectId={apartment.project.id} apartmentId={apartment.id} />
        </QrInterestLanding>
      </main>
    </div>
  );
}
