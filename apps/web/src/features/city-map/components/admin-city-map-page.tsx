'use client';

import type { CityMapBuildingOption, CityMapPlacementItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createAdminCityMapPlacement,
  deleteAdminCityMapPlacement,
  listAdminCityMapPlacements,
  publishAdminCityMapPlacement,
  searchCityMapBuildingOptions,
  unpublishAdminCityMapPlacement,
  updateAdminCityMapPlacement,
  uploadCityMapGlb,
} from '@/features/city-map/api/city-map-api';
import { CityMapView } from '@/features/city-map/components/city-map-view';
import {
  AdminCityMapSidebar,
  type AdminCityMapTransform,
} from '@/features/city-map/components/admin-city-map-sidebar';
import {
  CITY_MAP_DEFAULT_CONFIG,
  filterCityMapPlacementsByQuery,
  toAdminModelPose,
} from '@/features/city-map/constants';

const EMPTY_TRANSFORM: AdminCityMapTransform = {
  longitude: CITY_MAP_DEFAULT_CONFIG.centerLng,
  latitude: CITY_MAP_DEFAULT_CONFIG.centerLat,
  altitude: 0,
  rotationX: 90,
  rotationY: 0,
  rotationZ: 0,
  scale: 1,
  minZoom: 13,
};

export const AdminCityMapPage = () => {
  const t = useTranslations('Admin.cityMap');
  const [placements, setPlacements] = useState<CityMapPlacementItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [buildingQuery, setBuildingQuery] = useState('');
  const [buildingOptions, setBuildingOptions] = useState<CityMapBuildingOption[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<CityMapBuildingOption | null>(null);
  const [transform, setTransform] = useState(EMPTY_TRANSFORM);
  const [glbMediaAssetId, setGlbMediaAssetId] = useState<string | null>(null);
  const [glbLabel, setGlbLabel] = useState<string | null>(null);
  const [searchMap, setSearchMap] = useState('');
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = placements.find((item) => item.id === selectedId) ?? null;
  const models = useMemo(() => placements.map(toAdminModelPose), [placements]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAdminCityMapPlacements();
      setPlacements(response.data);
    } catch {
      setError(t('errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    setTransform({
      longitude: selected.longitude,
      latitude: selected.latitude,
      altitude: selected.altitude,
      rotationX: selected.rotationX,
      rotationY: selected.rotationY,
      rotationZ: selected.rotationZ,
      scale: selected.scale,
      minZoom: selected.minZoom,
    });
    setGlbMediaAssetId(selected.glbMediaAssetId);
    setGlbLabel(selected.buildingName);
    setSelectedBuilding(null);
  }, [selected]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void searchCityMapBuildingOptions(buildingQuery)
        .then((response) => setBuildingOptions(response.data))
        .catch(() => setBuildingOptions([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [buildingQuery]);

  const onPickBuilding = (option: CityMapBuildingOption): void => {
    setSelectedBuilding(option);
    setSelectedId(null);
    setGlbMediaAssetId(null);
    setGlbLabel(null);
    setTransform({
      ...EMPTY_TRANSFORM,
      longitude: option.longitude ?? EMPTY_TRANSFORM.longitude,
      latitude: option.latitude ?? EMPTY_TRANSFORM.latitude,
    });
  };

  const onUpload = async (file: File | null): Promise<void> => {
    if (!file) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const media = await uploadCityMapGlb(file);
      setGlbMediaAssetId(media.id);
      setGlbLabel(media.title ?? file.name);
    } catch {
      setError(t('errorUpload'));
    } finally {
      setSaving(false);
    }
  };

  const onSave = async (): Promise<void> => {
    if (!glbMediaAssetId) {
      setError(t('errorNeedGlb'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (selected) {
        const updated = await updateAdminCityMapPlacement(selected.id, {
          ...transform,
          glbMediaAssetId,
        });
        setPlacements((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedId(updated.id);
      } else if (selectedBuilding) {
        const created = await createAdminCityMapPlacement({
          buildingId: selectedBuilding.buildingId,
          glbMediaAssetId,
          ...transform,
        });
        setPlacements((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setSelectedBuilding(null);
      } else {
        setError(t('errorNeedBuilding'));
      }
    } catch {
      setError(t('errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const filteredPlacements = useMemo(
    () => filterCityMapPlacementsByQuery(placements, searchMap),
    [placements, searchMap],
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold text-ink-navy">{t('title')}</h1>
        <p className="mt-1 text-sm text-header-muted">{t('subtitle')}</p>
      </div>

      {error ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[32rem] overflow-hidden rounded-[20px] ring-1 ring-header-border">
          <div className="absolute top-3 left-3 z-10 w-[min(100%-1.5rem,18rem)]">
            <input
              value={searchMap}
              onChange={(event) => setSearchMap(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-md border border-header-border bg-canvas px-3 py-2 text-sm"
            />
            {searchMap.trim() && filteredPlacements.length > 0 ? (
              <ul className="mt-1 max-h-40 overflow-auto rounded-md border border-header-border bg-canvas shadow-md">
                {filteredPlacements.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full px-3 py-2 text-left text-sm hover:bg-band-mist/40"
                      onClick={() => {
                        setSelectedId(item.id);
                        setFlyToId(item.id);
                      }}
                    >
                      {item.buildingName} · {item.projectName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <CityMapView
            mode="edit"
            className="min-h-[32rem]"
            models={models}
            selectedPlacementId={selectedId}
            flyToPlacementId={flyToId}
            onSelectPlacement={(placementId) => {
              setSelectedId(placementId);
              setFlyToId(placementId);
            }}
            onMapClick={(lng, lat) => {
              setTransform((prev) => ({ ...prev, longitude: lng, latitude: lat }));
            }}
            onError={() => setError(t('errorMap'))}
          />
        </div>

        <AdminCityMapSidebar
          buildingQuery={buildingQuery}
          onBuildingQueryChange={setBuildingQuery}
          buildingOptions={buildingOptions}
          selectedBuilding={selectedBuilding}
          onPickBuilding={onPickBuilding}
          selected={selected}
          glbLabel={glbLabel}
          onUpload={(file) => void onUpload(file)}
          transform={transform}
          onTransformChange={setTransform}
          saving={saving}
          loading={loading}
          onSave={() => void onSave()}
          onPublish={() => {
            if (!selected) return;
            void publishAdminCityMapPlacement(selected.id).then((item) => {
              setPlacements((prev) => prev.map((row) => (row.id === item.id ? item : row)));
            });
          }}
          onUnpublish={() => {
            if (!selected) return;
            void unpublishAdminCityMapPlacement(selected.id).then((item) => {
              setPlacements((prev) => prev.map((row) => (row.id === item.id ? item : row)));
            });
          }}
          onDelete={() => {
            if (!selected) return;
            void deleteAdminCityMapPlacement(selected.id).then(() => {
              setPlacements((prev) => prev.filter((row) => row.id !== selected.id));
              setSelectedId(null);
            });
          }}
          placements={placements}
          selectedId={selectedId}
          onSelectPlacement={(id) => {
            setSelectedId(id);
            setFlyToId(id);
          }}
        />
      </div>
    </div>
  );
};
