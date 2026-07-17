'use client';

import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import {
  loadAdminVenueMapDetail,
  loadAssignmentOptions,
  type AdminAssignmentOption,
  type AdminProjectOption,
  type AdminVenueMapDetail,
} from '@/lib/exhibition/admin-venue-queries';

import { VenueEditor } from './venue-editor';

type VenuePageData = {
  detail: AdminVenueMapDetail;
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
  projects: AdminProjectOption[];
};

type AdminVenueClientProps = {
  eventId: string;
};

export function AdminVenueClient({ eventId }: AdminVenueClientProps) {
  const locale = useLocale();
  const t = useTranslations('admin.exhibition.venue');
  const [data, setData] = useState<VenuePageData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [detail, options] = await Promise.all([
        loadAdminVenueMapDetail(eventId),
        loadAssignmentOptions(),
      ]);
      if (cancelled) {
        return;
      }
      if (!detail) {
        setMissing(true);
        return;
      }
      setData({
        detail,
        companies: options.companies,
        partners: options.partners,
        projects: options.projects,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (missing) {
    notFound();
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
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
        detail={data.detail}
        companies={data.companies}
        partners={data.partners}
        projects={data.projects}
      />
    </section>
  );
}
