'use client';

import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';

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
  const canSearch = value.trim().length >= 3 && !disabled && !isGeocoding;

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
          disabled={disabled || isGeocoding}
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
