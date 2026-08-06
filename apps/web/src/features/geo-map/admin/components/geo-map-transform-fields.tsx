'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';

import {
  GEO_MAP_ALTITUDE_MAX_M,
  GEO_MAP_ALTITUDE_MIN_M,
  GEO_MAP_HEADING_MAX_DEG,
  GEO_MAP_HEADING_MIN_DEG,
  GEO_MAP_MIN_ZOOM_FIELD_MAX,
  GEO_MAP_MIN_ZOOM_FIELD_MIN,
  GEO_MAP_PITCH_MAX_DEG,
  GEO_MAP_PITCH_MIN_DEG,
  GEO_MAP_ROLL_MAX_DEG,
  GEO_MAP_ROLL_MIN_DEG,
  GEO_MAP_SCALE_MAX,
  GEO_MAP_SCALE_MIN,
} from '@/features/geo-map/admin/constants';
import {
  GEO_MAP_API_COORDINATE_DECIMALS,
  GEO_MAP_MAX_ABS_LATITUDE,
  GEO_MAP_MAX_ABS_LONGITUDE,
} from '@/features/geo-map/constants';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

/** Smallest lng/lat step the admin API persists (7 decimals). */
const COORDINATE_FIELD_STEP = 10 ** -GEO_MAP_API_COORDINATE_DECIMALS;

export type GeoMapTransformDraft = {
  longitude: number;
  latitude: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  scale: number;
  minZoom: number;
};

type GeoMapTransformFieldsProps = {
  value: GeoMapTransformDraft;
  onChange: (next: GeoMapTransformDraft) => void;
  disabled?: boolean | undefined;
};

type NumberFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  showSlider?: boolean | undefined;
  onChange: (value: number) => void;
};

const NumberField = ({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled,
  showSlider = false,
  onChange,
}: NumberFieldProps) => (
  <FormField id={id} label={label}>
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : ''}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isFinite(next)) {
          onChange(next);
        }
      }}
    />
    {showSlider ? (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        disabled={disabled}
        aria-label={label}
        className="mt-2 w-full accent-brand"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    ) : null}
  </FormField>
);

/**
 * Numeric + slider transform controls for a selected map model.
 * Rotate X/Y/Z labels match the Map Three.js POC (Pitch / Heading / Roll).
 */
export const GeoMapTransformFields = ({
  value,
  onChange,
  disabled = false,
}: GeoMapTransformFieldsProps) => {
  const t = useTranslations('Admin.geoMap.form');
  const baseId = useId();

  const patch = (partial: Partial<GeoMapTransformDraft>): void => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id={`${baseId}-lng`}
          label={t('longitude')}
          value={value.longitude}
          min={-GEO_MAP_MAX_ABS_LONGITUDE}
          max={GEO_MAP_MAX_ABS_LONGITUDE}
          step={COORDINATE_FIELD_STEP}
          disabled={disabled}
          onChange={(longitude) => patch({ longitude })}
        />
        <NumberField
          id={`${baseId}-lat`}
          label={t('latitude')}
          value={value.latitude}
          min={-GEO_MAP_MAX_ABS_LATITUDE}
          max={GEO_MAP_MAX_ABS_LATITUDE}
          step={COORDINATE_FIELD_STEP}
          disabled={disabled}
          onChange={(latitude) => patch({ latitude })}
        />
      </div>

      <NumberField
        id={`${baseId}-pitch`}
        label={t('pitchDeg')}
        value={value.pitchDeg}
        min={GEO_MAP_PITCH_MIN_DEG}
        max={GEO_MAP_PITCH_MAX_DEG}
        step={1}
        disabled={disabled}
        showSlider
        onChange={(pitchDeg) => patch({ pitchDeg })}
      />
      <NumberField
        id={`${baseId}-heading`}
        label={t('headingDeg')}
        value={value.headingDeg}
        min={GEO_MAP_HEADING_MIN_DEG}
        max={GEO_MAP_HEADING_MAX_DEG}
        step={1}
        disabled={disabled}
        showSlider
        onChange={(headingDeg) => patch({ headingDeg })}
      />
      <NumberField
        id={`${baseId}-roll`}
        label={t('rollDeg')}
        value={value.rollDeg}
        min={GEO_MAP_ROLL_MIN_DEG}
        max={GEO_MAP_ROLL_MAX_DEG}
        step={1}
        disabled={disabled}
        showSlider
        onChange={(rollDeg) => patch({ rollDeg })}
      />
      <NumberField
        id={`${baseId}-scale`}
        label={t('scale')}
        value={value.scale}
        min={GEO_MAP_SCALE_MIN}
        max={GEO_MAP_SCALE_MAX}
        step={0.01}
        disabled={disabled}
        showSlider
        onChange={(scale) => patch({ scale })}
      />
      <NumberField
        id={`${baseId}-altitude`}
        label={t('altitudeM')}
        value={value.altitudeM}
        min={GEO_MAP_ALTITUDE_MIN_M}
        max={GEO_MAP_ALTITUDE_MAX_M}
        step={0.1}
        disabled={disabled}
        showSlider
        onChange={(altitudeM) => patch({ altitudeM })}
      />
      <NumberField
        id={`${baseId}-minZoom`}
        label={t('minZoom')}
        value={value.minZoom}
        min={GEO_MAP_MIN_ZOOM_FIELD_MIN}
        max={GEO_MAP_MIN_ZOOM_FIELD_MAX}
        step={0.5}
        disabled={disabled}
        showSlider
        onChange={(minZoom) => patch({ minZoom })}
      />
    </div>
  );
};
