'use client';

import type { BoothSummary, VenueMapSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminBoothAssignmentsPanel } from '@/features/exhibition/components/admin/admin-booth-assignments-panel';
import { AdminBoothForm } from '@/features/exhibition/components/admin/admin-booth-form';
import { AdminBoothMapPicker } from '@/features/exhibition/components/admin/admin-booth-map-picker';
import { AdminRouteGraphEditor } from '@/features/exhibition/components/admin/admin-route-graph-editor';
import {
  useAdminVenueMapBoothsQuery,
  useAdminVenueMapRouteGraphQuery,
  useCreateAdminBoothMutation,
  useDeleteAdminBoothMutation,
  useUpdateAdminBoothMutation,
} from '@/features/exhibition/hooks/use-exhibition';
import type { BoothFormValues } from '@/features/exhibition/schemas/exhibition.schema';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { AddActionLabel } from '@/shared/ui/add-action-label';

type AdminBoothsSectionProps = {
  map: VenueMapSummary;
};

/**
 * Booth list, form, map picker, assignments, and route graph for one venue map.
 */
export const AdminBoothsSection = ({ map }: AdminBoothsSectionProps) => {
  const t = useTranslations('Admin.events.booths');
  const boothsQuery = useAdminVenueMapBoothsQuery(map.id);
  const routeGraphQuery = useAdminVenueMapRouteGraphQuery(map.id);
  const createMutation = useCreateAdminBoothMutation(map.id);
  const updateMutation = useUpdateAdminBoothMutation(map.id);
  const deleteMutation = useDeleteAdminBoothMutation(map.id);

  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{
    xPercent: number;
    yPercent: number;
  } | null>(null);

  const booths = boothsQuery.data?.data ?? [];
  const selectedBooth = booths.find((booth) => booth.id === selectedBoothId) ?? null;

  const onCreate = async (values: BoothFormValues) => {
    const created = await createMutation.mutateAsync(toCreateBody(values));
    setCreating(false);
    setSelectedBoothId(created.id);
    setPickedCoordinates(null);
  };

  const onUpdate = async (values: BoothFormValues) => {
    if (!selectedBooth) {
      return;
    }
    await updateMutation.mutateAsync({
      id: selectedBooth.id,
      body: toUpdateBody(values),
    });
  };

  const onDelete = async () => {
    if (!selectedBooth) {
      return;
    }
    await deleteMutation.mutateAsync(selectedBooth.id);
    setSelectedBoothId(null);
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{t('title')}</h3>
        <button
          type="button"
          className="text-sm font-medium text-brand hover:underline"
          onClick={() => {
            setCreating(true);
            setSelectedBoothId(null);
          }}
        >
          <AddActionLabel>{t('newBooth')}</AddActionLabel>
        </button>
      </div>
      {boothsQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <AdminBoothMapPicker
              mediaAssetId={map.mediaAssetId}
              mediaFileUrl={map.mediaUrl}
              booths={booths}
              selectedBoothId={selectedBoothId}
              onSelectBooth={setSelectedBoothId}
              onPickCoordinates={(xPercent, yPercent) => {
                setPickedCoordinates({ xPercent, yPercent });
              }}
            />
            <BoothList
              booths={booths}
              selectedBoothId={selectedBoothId}
              onSelect={setSelectedBoothId}
            />
          </div>
          <div className="flex flex-col gap-4">
            {creating || selectedBooth ? (
              <AdminBoothForm
                initial={selectedBooth ?? undefined}
                pickedCoordinates={pickedCoordinates}
                isBusy={
                  createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
                }
                onSubmit={selectedBooth ? onUpdate : onCreate}
                onDelete={selectedBooth ? onDelete : undefined}
              />
            ) : (
              <p className="text-sm text-ink-secondary">{t('selectHint')}</p>
            )}
            {selectedBooth ? <AdminBoothAssignmentsPanel boothId={selectedBooth.id} /> : null}
          </div>
        </div>
      )}
      {routeGraphQuery.data ? (
        <AdminRouteGraphEditor
          mapId={map.id}
          initialNodes={routeGraphQuery.data.nodes}
          initialEdges={routeGraphQuery.data.edges}
          boothOptions={booths.map((booth) => ({
            id: booth.id,
            code: booth.code,
          }))}
        />
      ) : null}
    </Card>
  );
};

type BoothListProps = {
  booths: BoothSummary[];
  selectedBoothId: string | null;
  onSelect: (id: string) => void;
};

const BoothList = ({ booths, selectedBoothId, onSelect }: BoothListProps) => {
  const t = useTranslations('Admin.events.booths');

  if (booths.length === 0) {
    return <p className="text-sm text-ink-secondary">{t('empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {booths.map((booth) => (
        <li key={booth.id}>
          <button
            type="button"
            className={cn(
              'w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-surface',
              selectedBoothId === booth.id && 'bg-surface font-medium text-brand',
            )}
            onClick={() => onSelect(booth.id)}
          >
            {booth.code}
            {booth.name ? ` · ${booth.name}` : ''}
          </button>
        </li>
      ))}
    </ul>
  );
};

const toCreateBody = (values: BoothFormValues) => ({
  code: values.code,
  type: values.type,
  xPercent: values.xPercent,
  yPercent: values.yPercent,
  publicationStatus: values.publicationStatus,
  ...(values.name ? { name: values.name } : {}),
  ...(values.locationText ? { locationText: values.locationText } : {}),
});

const toUpdateBody = (values: BoothFormValues) => ({
  code: values.code,
  type: values.type,
  xPercent: values.xPercent,
  yPercent: values.yPercent,
  publicationStatus: values.publicationStatus,
  name: values.name || null,
  locationText: values.locationText || null,
});
