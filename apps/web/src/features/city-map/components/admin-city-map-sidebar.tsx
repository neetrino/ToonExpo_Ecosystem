'use client';

import type { CityMapBuildingOption, CityMapPlacementItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

export type AdminCityMapTransform = {
  longitude: number;
  latitude: number;
  altitude: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  minZoom: number;
};

type AdminCityMapSidebarProps = {
  buildingQuery: string;
  onBuildingQueryChange: (value: string) => void;
  buildingOptions: CityMapBuildingOption[];
  selectedBuilding: CityMapBuildingOption | null;
  onPickBuilding: (option: CityMapBuildingOption) => void;
  selected: CityMapPlacementItem | null;
  glbLabel: string | null;
  onUpload: (file: File | null) => void;
  transform: AdminCityMapTransform;
  onTransformChange: (next: AdminCityMapTransform) => void;
  saving: boolean;
  loading: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  placements: CityMapPlacementItem[];
  selectedId: string | null;
  onSelectPlacement: (id: string) => void;
};

export const AdminCityMapSidebar = ({
  buildingQuery,
  onBuildingQueryChange,
  buildingOptions,
  selectedBuilding,
  onPickBuilding,
  selected,
  glbLabel,
  onUpload,
  transform,
  onTransformChange,
  saving,
  loading,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
  placements,
  selectedId,
  onSelectPlacement,
}: AdminCityMapSidebarProps) => {
  const t = useTranslations('Admin.cityMap');

  return (
    <aside className="flex flex-col gap-3 rounded-[20px] bg-surface-elevated p-4 ring-1 ring-header-border">
      <h2 className="text-sm font-semibold text-ink-navy">{t('editor')}</h2>

      <label className="text-xs font-medium text-header-muted">
        {t('buildingSearch')}
        <input
          value={buildingQuery}
          onChange={(event) => onBuildingQueryChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-header-border bg-canvas px-3 py-2 text-sm"
          placeholder={t('buildingSearchPlaceholder')}
        />
      </label>
      <ul className="max-h-28 overflow-auto rounded-md border border-header-border">
        {buildingOptions.map((option) => (
          <li key={option.buildingId}>
            <button
              type="button"
              disabled={option.hasPlacement && !selected}
              onClick={() => onPickBuilding(option)}
              className={cn(
                'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm',
                selectedBuilding?.buildingId === option.buildingId
                  ? 'bg-brand-deep/10 text-brand-deep'
                  : 'hover:bg-band-mist/40',
              )}
            >
              <span className="font-medium">{option.buildingName}</span>
              <span className="text-xs text-header-muted">
                {option.projectName}
                {option.address ? ` · ${option.address}` : ''}
                {option.hasPlacement ? ` · ${t('alreadyPlaced')}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <label className="text-xs font-medium text-header-muted">
        {t('uploadGlb')}
        <input
          type="file"
          accept=".glb,model/gltf-binary"
          className="mt-1 block w-full text-sm"
          onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
        />
        {glbLabel ? <span className="mt-1 block text-xs text-ink-navy">{glbLabel}</span> : null}
      </label>

      {(
        [
          ['longitude', t('longitude')],
          ['latitude', t('latitude')],
          ['altitude', t('altitude')],
          ['rotationX', t('rotationX')],
          ['rotationY', t('rotationY')],
          ['rotationZ', t('rotationZ')],
          ['scale', t('scale')],
          ['minZoom', t('minZoom')],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="text-xs font-medium text-header-muted">
          {label}
          <input
            type="number"
            step="any"
            value={transform[key]}
            onChange={(event) =>
              onTransformChange({
                ...transform,
                [key]: Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-md border border-header-border bg-canvas px-3 py-2 text-sm"
          />
        </label>
      ))}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <button
          type="button"
          disabled={saving || loading}
          onClick={onSave}
          className="rounded-md bg-brand-deep px-3 py-2 text-sm font-semibold text-on-dark disabled:opacity-50"
        >
          {t('save')}
        </button>
        {selected ? (
          <>
            {selected.publicationStatus === 'published' ? (
              <button
                type="button"
                disabled={saving}
                onClick={onUnpublish}
                className="rounded-md border border-header-border px-3 py-2 text-sm"
              >
                {t('unpublish')}
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={onPublish}
                className="rounded-md border border-header-border px-3 py-2 text-sm"
              >
                {t('publish')}
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={onDelete}
              className="rounded-md border border-danger/40 px-3 py-2 text-sm text-danger"
            >
              {t('delete')}
            </button>
          </>
        ) : null}
      </div>

      <div className="border-t border-header-border pt-3">
        <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
          {t('list')}
        </p>
        <ul className="mt-2 max-h-40 divide-y divide-header-border overflow-auto">
          {loading ? <li className="py-2 text-sm text-header-muted">{t('loading')}</li> : null}
          {placements.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectPlacement(item.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 py-2 text-left text-sm',
                  selectedId === item.id ? 'font-medium text-brand-deep' : 'text-ink-navy',
                )}
              >
                <span className="truncate">{item.buildingName}</span>
                <span className="shrink-0 text-xs text-header-muted">{item.publicationStatus}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] leading-4 text-header-muted">{t('blenderHint')}</p>
    </aside>
  );
};
