'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type FormEvent } from 'react';

import { GEO_MAP_ADDRESS_GEOCODE_DEBOUNCE_MS } from '@/features/geo-map/admin/constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type GeoMapCreateAddressFieldProps = {
  value: string;
  disabled: boolean;
  isGeocoding: boolean;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
};

/**
 * Address field + fly-to submit for the admin 3D map create flow.
 */
export const GeoMapCreateAddressField = ({
  value,
  disabled,
  isGeocoding,
  onChange,
  onSearch,
}: GeoMapCreateAddressFieldProps) => {
  const t = useTranslations('Admin.geoMap');
  const trimmed = value.trim();
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
    onSearch(value);
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <FormField id="geo-map-address" label={t('create.address')}>
        <Input
          id="geo-map-address"
          value={value}
          disabled={disabled}
          placeholder={t('create.addressPlaceholder')}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>
      <Button type="submit" size="sm" variant="secondary" disabled={!canSearch}>
        {isGeocoding ? t('create.geocoding') : t('create.goToAddress')}
      </Button>
    </form>
  );
};
