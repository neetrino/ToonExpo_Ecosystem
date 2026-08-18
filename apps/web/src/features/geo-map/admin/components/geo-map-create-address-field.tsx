'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type FormEvent } from 'react';

import { GeoMapSiteAddress } from '@/features/geo-map/admin/components/geo-map-site-address';
import { GEO_MAP_ADDRESS_GEOCODE_DEBOUNCE_MS } from '@/features/geo-map/admin/constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type GeoMapCreateAddressFieldProps = {
  /** Project address as filled in Projects; never overwritten by search. */
  siteAddress: string;
  searchQuery: string;
  disabled: boolean;
  isGeocoding: boolean;
  onSearchChange: (value: string) => void;
  onSearch: (query: string) => void;
};

/**
 * Read-only project address + separate map search (search never mutates the site text).
 */
export const GeoMapCreateAddressField = ({
  siteAddress,
  searchQuery,
  disabled,
  isGeocoding,
  onSearchChange,
  onSearch,
}: GeoMapCreateAddressFieldProps) => {
  const t = useTranslations('Admin.geoMap');
  const trimmed = searchQuery.trim();
  const canSearch = trimmed.length >= 3 && !disabled && !isGeocoding;
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (disabled || trimmed.length < 3) {
      return;
    }
    const timer = window.setTimeout(() => {
      onSearchRef.current(trimmed);
    }, GEO_MAP_ADDRESS_GEOCODE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [disabled, trimmed]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSearch) {
      return;
    }
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-3">
      <GeoMapSiteAddress address={siteAddress} />

      <form className="space-y-2" onSubmit={handleSubmit}>
        <FormField id="geo-map-find-on-map" label={t('create.findOnMap')}>
          <Input
            id="geo-map-find-on-map"
            value={searchQuery}
            disabled={disabled}
            placeholder={t('create.findOnMapPlaceholder')}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </FormField>
        <Button type="submit" size="sm" variant="secondary" disabled={!canSearch}>
          {isGeocoding ? t('create.geocoding') : t('create.goToAddress')}
        </Button>
        <p className="text-xs text-ink-muted">{t('create.findOnMapHint')}</p>
      </form>
    </div>
  );
};
