'use client';

import type { AdminBuildingInventoryGlance } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { FloorPlanUploadTile } from '@/features/admin/components/floor-plan-upload-tile';
import {
  useAdminCreateFloorMutation,
  useAdminUpdateBuildingMutation,
  useAdminUpdateFloorMutation,
} from '@/features/admin/hooks/use-admin-inventory';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type AdminBuildingFloorPlansFormProps = {
  glance: AdminBuildingInventoryGlance;
};

type PlanSlotDraft = {
  mediaId: string;
  previewUrl: string | null;
};

/**
 * Collapsed by default (Add floor). Expanded: floors count → plan upload slots → Save.
 */
export const AdminBuildingFloorPlansForm = ({ glance }: AdminBuildingFloorPlansFormProps) => {
  const t = useTranslations('Admin.buildings.inventory.floorPlans');
  const updateBuilding = useAdminUpdateBuildingMutation();
  const updateFloor = useAdminUpdateFloorMutation();
  const createFloor = useAdminCreateFloorMutation();

  const floorsByNumber = useMemo(() => {
    const map = new Map<number, (typeof glance.floors)[number]>();
    for (const floor of glance.floors) {
      map.set(floor.number, floor);
    }
    return map;
  }, [glance.floors]);

  const [expanded, setExpanded] = useState(false);
  const [floorsCount, setFloorsCount] = useState('');
  const [drafts, setDrafts] = useState<Record<number, PlanSlotDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setFloorsCount('');
    setDrafts({});
    setError(null);
  }, [glance.id]);

  const slotCount = (() => {
    const parsed = Number(floorsCount);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return 0;
    }
    return parsed;
  })();

  const slotNumbers = useMemo(
    () => Array.from({ length: slotCount }, (_, index) => index + 1),
    [slotCount],
  );

  const handleCancel = () => {
    setExpanded(false);
    setFloorsCount('');
    setDrafts({});
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (slotCount < 1) {
      setError(t('invalidCount'));
      return;
    }

    setBusy(true);
    try {
      await updateBuilding.mutateAsync({
        companyId: glance.builderCompanyId,
        buildingId: glance.id,
        body: { floorsCount: slotCount },
      });

      for (const floorNumber of slotNumbers) {
        const draft = drafts[floorNumber];
        const existing = floorsByNumber.get(floorNumber) ?? null;
        const nextMediaId = draft?.mediaId;

        if (!existing) {
          await createFloor.mutateAsync({
            companyId: glance.builderCompanyId,
            buildingId: glance.id,
            body: {
              floorNumber,
              ...(nextMediaId && nextMediaId.length > 0 ? { floorplanMediaId: nextMediaId } : {}),
            },
          });
          continue;
        }

        if (nextMediaId === undefined) {
          continue;
        }

        const currentMediaId = existing.floorplanMediaId ?? '';
        if (nextMediaId === currentMediaId) {
          continue;
        }

        await updateFloor.mutateAsync({
          companyId: glance.builderCompanyId,
          buildingId: glance.id,
          floorId: existing.id,
          body: { floorplanMediaId: nextMediaId.length > 0 ? nextMediaId : null },
        });
      }

      setExpanded(false);
      setFloorsCount('');
      setDrafts({});
    } catch {
      setError(t('error'));
    } finally {
      setBusy(false);
    }
  };

  const saving = busy || updateBuilding.isPending || updateFloor.isPending || createFloor.isPending;

  return (
    <section className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
      {expanded ? (
        <>
          <FormField id={`floors-count-${glance.id}`} label={t('countLabel')}>
            <Input
              id={`floors-count-${glance.id}`}
              type="number"
              min={1}
              value={floorsCount}
              placeholder={t('countPlaceholder')}
              onChange={(event) => {
                setFloorsCount(event.target.value);
              }}
            />
          </FormField>
          <p className="text-xs text-ink-muted">{t('countHint')}</p>

          {slotCount > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink">{t('plansTitle')}</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slotNumbers.map((floorNumber) => {
                  const existing = floorsByNumber.get(floorNumber);
                  const draft = drafts[floorNumber];
                  const mediaId = draft?.mediaId ?? existing?.floorplanMediaId ?? '';
                  return (
                    <li key={floorNumber}>
                      <FloorPlanUploadTile
                        label={t('floorLabel', { number: floorNumber })}
                        mediaId={mediaId}
                        previewUrl={draft?.previewUrl ?? null}
                        companyId={glance.builderCompanyId}
                        disabled={saving}
                        onUploaded={(nextMediaId, previewUrl) => {
                          setDrafts((current) => ({
                            ...current,
                            [floorNumber]: { mediaId: nextMediaId, previewUrl },
                          }));
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {expanded ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={handleCancel}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={saving || slotCount < 1}
              onClick={() => {
                void handleSave();
              }}
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={saving}
          onClick={() => {
            if (!expanded) {
              setExpanded(true);
              setError(null);
              return;
            }
            setFloorsCount(String(slotCount + 1));
            setError(null);
          }}
        >
          {t('addFloor')}
        </Button>
      </div>
    </section>
  );
};
