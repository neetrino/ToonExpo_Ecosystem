'use client';

import type { PublicationStatus } from '@toonexpo/contracts';
import { CircleDashed, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

type CatalogPublicationStatus = Extract<PublicationStatus, 'draft' | 'published'>;

type PublicationStatusSwitcherProps = {
  value: PublicationStatus;
  disabled?: boolean | undefined;
  onChange: (status: CatalogPublicationStatus) => void;
};

const toCatalogStatus = (value: PublicationStatus): CatalogPublicationStatus =>
  value === 'published' ? 'published' : 'draft';

/**
 * Draft / Published pill switcher for catalog inventory.
 */
export const PublicationStatusSwitcher = ({
  value,
  disabled = false,
  onChange,
}: PublicationStatusSwitcherProps) => {
  const t = useTranslations('Builder.inventory');
  const tLabel = useTranslations('Common.publicationStatus');
  const selected = toCatalogStatus(value);
  const [display, setDisplay] = useState(selected);

  useEffect(() => {
    if (!disabled) {
      setDisplay(selected);
    }
  }, [disabled, selected]);

  return (
    <SegmentedSwitcher
      value={display}
      disabled={disabled}
      aria-label={tLabel('label')}
      options={[
        { value: 'draft', label: t('publication.draft'), icon: CircleDashed },
        { value: 'published', label: t('publication.published'), icon: Globe },
      ]}
      onChange={(status) => {
        setDisplay(status);
        onChange(status);
      }}
    />
  );
};
