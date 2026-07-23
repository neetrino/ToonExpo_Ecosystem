import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SiteFooter } from '@/features/catalog/components/site-footer';
import { MortgagePageContent } from '@/features/mortgage/components/mortgage-page-content';

type MortgagePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: MortgagePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Mortgage' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public mortgage marketing + calculator — Figma `105:2567`.
 */
export default async function MortgagePage({ params }: MortgagePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <MortgagePageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
