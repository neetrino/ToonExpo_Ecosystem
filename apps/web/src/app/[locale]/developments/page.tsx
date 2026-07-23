import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { NewDevelopmentsView } from '@/features/catalog/components/new-developments-view';
import { ProjectPriceRangesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { SiteFooter } from '@/features/catalog/components/site-footer';

const DEVELOPMENTS_PAGE_SIZE = 12;

type DevelopmentsPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: DevelopmentsPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DevelopmentsPage' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public New Developments index — Figma `103:2407`.
 */
export default async function DevelopmentsPage({ params }: DevelopmentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const response = await listProjects({ page: 1, pageSize: DEVELOPMENTS_PAGE_SIZE }, { locale });

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <ProjectPriceRangesOverlayScope projectIds={response.data.map((project) => project.id)}>
          <NewDevelopmentsView projects={response.data} />
        </ProjectPriceRangesOverlayScope>
      </main>
      <SiteFooter />
    </div>
  );
}
