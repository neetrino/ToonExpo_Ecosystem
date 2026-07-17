'use client';

import type { PartnerType, PublicationStatus } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { loadAllPartners, type AdminPartnerRow } from '@/lib/admin/queries';
import { parsePartnerTypeFilter } from '@/lib/admin/partner-type-filter';

import { NewPartnerButton } from './new-partner-button';
import { PartnerTypeFilter } from './partner-type-filter';
import { PartnersTable } from './partners-table';

export function AdminPartnersClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const typeFilter = parsePartnerTypeFilter(searchParams.get('type') ?? undefined);
  const t = useTranslations('admin.partners');
  const tTypes = useTranslations('admin.partners.types');
  const tStatus = useTranslations('admin.partners.status');
  const [partners, setPartners] = useState<AdminPartnerRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPartners(null);
    void (async () => {
      const next = await loadAllPartners(typeFilter);
      if (cancelled) {
        return;
      }
      setPartners(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [typeFilter]);

  if (!partners) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const typeLabels = Object.fromEntries(
    PARTNER_TYPES.map((type) => [type, tTypes(type)]),
  ) as Record<PartnerType, string>;

  const statusLabels: Record<PublicationStatus, string> = {
    DRAFT: tStatus('DRAFT'),
    PUBLISHED: tStatus('PUBLISHED'),
    ARCHIVED: tStatus('ARCHIVED'),
  };

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewPartnerButton locale={locale} label={t('newPartner')} />
        </div>
      </div>

      <PartnerTypeFilter
        currentType={typeFilter}
        labels={{
          all: t('filter.all'),
          ariaLabel: t('filter.ariaLabel'),
          ...typeLabels,
        }}
      />

      {partners.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <PartnersTable
          partners={partners}
          labels={{
            columns: {
              name: t('columns.name'),
              type: t('columns.type'),
              status: t('columns.status'),
              offers: t('columns.offers'),
              actions: t('columns.actions'),
            },
            open: t('open'),
          }}
          typeLabels={typeLabels}
          statusLabels={statusLabels}
        />
      )}
    </section>
  );
}
