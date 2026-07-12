'use client';

import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';

import type { BuilderProjectApartment } from '@/lib/builder/queries';

import { MediaSection } from '../[projectId]/media-section';

type ApartmentMediaSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  apartment: BuilderProjectApartment;
};

export function ApartmentMediaSheet({
  locale,
  open,
  onClose,
  apartment,
}: ApartmentMediaSheetProps) {
  const t = useTranslations('portal.mediaForm');

  return (
    <SideSheet title={t('apartmentTitle', { code: apartment.code })} open={open} onClose={onClose}>
      <MediaSection
        locale={locale}
        owner={{ apartmentId: apartment.id }}
        media={apartment.media}
        compact
        labels={{
          title: t('section.title'),
          addMedia: t('add'),
          empty: t('empty'),
          edit: t('edit'),
          delete: t('delete'),
          coverBadge: t('coverBadge'),
          coverHint: t('coverHint'),
          sortOrder: t('fields.sortOrder'),
          noAlt: t('noAlt'),
          confirmDelete: t('confirmDelete'),
        }}
      />
    </SideSheet>
  );
}
