import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string; apartmentId: string }>;
};

/**
 * Legacy company catalog apartment → admin Projects hub.
 */
export default async function AdminCompanyCatalogApartmentRedirect({ params }: PageProps) {
  const { locale, id, apartmentId } = await params;
  setRequestLocale(locale);
  redirect({
    href: `/admin/projects/apartments/${apartmentId}?companyId=${encodeURIComponent(id)}`,
    locale,
  });
  return null;
}
