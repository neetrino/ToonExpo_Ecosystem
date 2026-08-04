import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SiteFooter } from '@/features/catalog/components/site-footer';
import { listDistrictVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import { pickPrimaryVisualCanvas } from '@/features/visual-map/utils/public-visual-map';
import { Link } from '@/i18n/navigation';

type DistrictPageProps = {
  params: Promise<{ locale: string; id: string; districtId: string }>;
};

export const generateMetadata = async ({ params }: DistrictPageProps): Promise<Metadata> => {
  const { locale, districtId } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const visualResponse = await listDistrictVisualCanvases(districtId);
  const canvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);

  if (!visualResponse) {
    return { title: t('district.notFoundTitle') };
  }

  return {
    title: canvas?.title ?? t('district.fallbackTitle'),
  };
};

/**
 * Public district map stage — refresh-safe path for masterplan district polygons.
 */
export default async function DistrictPage({ params }: DistrictPageProps) {
  const { locale, id, districtId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  const visualResponse = await listDistrictVisualCanvases(districtId);

  if (!visualResponse) {
    notFound();
  }

  const visualCanvas = pickPrimaryVisualCanvas(visualResponse.data);
  const title = visualCanvas?.title ?? t('district.fallbackTitle');

  return (
    <div className="min-h-screen bg-canvas">
      <main className="page-container section-pad">
        <div className="mb-6 flex flex-col gap-2">
          <Link href={`/projects/${id}`} className="text-sm text-ink-secondary hover:text-ink">
            {t('district.backToProject')}
          </Link>
          <h1 className="text-page-title text-ink">{title}</h1>
        </div>

        {visualCanvas ? (
          <PublicVisualMap canvas={visualCanvas} projectId={id} />
        ) : (
          <p className="text-sm text-ink-secondary">{t('visualMap.stageUnavailable')}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
