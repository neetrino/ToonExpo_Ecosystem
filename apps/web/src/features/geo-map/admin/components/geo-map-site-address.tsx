'use client';

import { useTranslations } from 'next-intl';

type GeoMapSiteAddressProps = {
  address: string;
};

/**
 * Read-only project address as filled in Projects. Search/geocode never edits this.
 */
export const GeoMapSiteAddress = ({ address }: GeoMapSiteAddressProps) => {
  const t = useTranslations('Admin.geoMap');
  if (!address) {
    return null;
  }

  return (
    <div className="space-y-1 rounded-sm border border-border px-3 py-2">
      <p className="text-sm font-medium text-ink">{t('create.address')}</p>
      <p className="text-sm leading-5 text-ink">{address}</p>
      <p className="text-xs text-ink-muted">{t('create.addressLockedHint')}</p>
    </div>
  );
};
