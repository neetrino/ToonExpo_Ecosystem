import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Link } from '@/i18n/navigation';
import {
  loadAdminVenueMapDetail,
  loadAssignmentOptions,
} from '@/lib/exhibition/admin-venue-queries';

import { VenueEditor } from './venue-editor';

type AdminVenuePageProps = {
  params: Promise<{ locale: string; eventId: string }>;
};

export default async function AdminVenuePage({ params }: AdminVenuePageProps) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);

  const [t, detail, options] = await Promise.all([
    getTranslations('admin.exhibition.venue'),
    loadAdminVenueMapDetail(eventId),
    loadAssignmentOptions(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <section>
      <p className="portal-visual-map-hint">
        <Link className="portal-link" href="/admin/exhibition">
          {t('back')}
        </Link>
      </p>
      <VenueEditor
        locale={locale}
        detail={detail}
        companies={options.companies}
        partners={options.partners}
        projects={options.projects}
      />
    </section>
  );
}
