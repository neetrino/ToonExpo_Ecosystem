import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DiscoverPageContent } from '@/features/discover/components/discover-page-content';
import { DISCOVER_VIEWPORT_HEIGHT_CLASS } from '@/features/discover/constants';
import { cn } from '@/shared/ui/cn';

type DiscoverPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: DiscoverPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Discover' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Buyer discover / swipe surface for apartments (bottom-nav heart tab).
 * Height fills exactly between top header and bottom nav — no page scroll.
 */
export default async function DiscoverPage({ params }: DiscoverPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden overscroll-none bg-canvas',
        DISCOVER_VIEWPORT_HEIGHT_CLASS,
      )}
    >
      <DiscoverPageContent />
    </div>
  );
}
