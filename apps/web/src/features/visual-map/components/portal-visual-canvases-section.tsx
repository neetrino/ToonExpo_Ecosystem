'use client';

import { catalogVisualMapHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalProjectDetail, VisualMapContextType } from '@toonexpo/contracts';
import { SquarePen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  useCreatePortalVisualCanvasMutation,
  usePortalProjectVisualCanvasesQuery,
} from '@/features/visual-map/hooks/use-portal-visual-map';
import { toCreateCanvasBody } from '@/features/visual-map/utils/portal-request-mappers';
import {
  visualCanvasFormSchema,
  type VisualCanvasFormInput,
  type VisualCanvasFormValues,
} from '@/features/visual-map/schemas/visual-map.schema';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

type PortalVisualCanvasesSectionProps = {
  project: PortalProjectDetail;
};

const META_COL_CLASS = 'w-28 px-3 py-3 text-center align-middle';

/**
 * Visual canvas list and create form on the builder project page.
 */
export const PortalVisualCanvasesSection = ({ project }: PortalVisualCanvasesSectionProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.visualMap');
  const canvasesQuery = usePortalProjectVisualCanvasesQuery(project.id);
  const createMutation = useCreatePortalVisualCanvasMutation(project.id);
  const [showCreate, setShowCreate] = useState(false);

  const canvases = canvasesQuery.data?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
          <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setShowCreate((open) => !open)}
        >
          {showCreate ? t('cancelCreate') : <AddActionLabel>{t('newCanvas')}</AddActionLabel>}
        </Button>
      </div>

      {showCreate ? (
        <PortalVisualCanvasCreateForm
          project={project}
          isBusy={createMutation.isPending}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(toCreateCanvasBody(values));
            setShowCreate(false);
          }}
        />
      ) : null}

      {canvasesQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : canvases.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[48rem] table-fixed border-collapse text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('columns.title')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.context')}</th>
                <th className={cn(META_COL_CLASS, 'font-medium')}>{t('columns.primary')}</th>
                <th className={cn(META_COL_CLASS, 'font-medium')}>{t('columns.status')}</th>
                <th className={cn(META_COL_CLASS, 'font-medium')}>{t('columns.hotspots')}</th>
                <th className={cn(META_COL_CLASS, 'font-medium')}>{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {canvases.map((canvas) => (
                <tr key={canvas.id} className="bg-background">
                  <td className="truncate px-4 py-3 font-medium text-ink">
                    {canvas.title ?? t('untitled')}
                  </td>
                  <td className="truncate px-4 py-3 text-ink-secondary">
                    {t(`contextTypes.${canvas.contextType}`)}
                    {' · '}
                    {resolveContextLabel(project, canvas.contextType, canvas.contextId, t)}
                  </td>
                  <td className={META_COL_CLASS}>
                    {canvas.isPrimary ? t('primaryYes') : t('primaryNo')}
                  </td>
                  <td className={META_COL_CLASS}>
                    <div className="flex justify-center">
                      <PublicationStatusBadge
                        status={canvas.publicationStatus}
                        className={LIST_STATUS_BADGE_COMPACT_CLASS}
                      />
                    </div>
                  </td>
                  <td className={META_COL_CLASS}>{canvas.hotspotCount}</td>
                  <td className={META_COL_CLASS}>
                    <div className="flex justify-center">
                      <Link
                        href={catalogVisualMapHref(scope, project.id, canvas.id)}
                        aria-label={t('editCanvas')}
                        title={t('editCanvas')}
                        className={cn(
                          'inline-flex size-9 items-center justify-center rounded-[15px]',
                          'text-cta-dark hover:bg-cta-dark/5',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                        )}
                      >
                        <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

type CreateFormProps = {
  project: PortalProjectDetail;
  isBusy: boolean;
  onCancel: () => void;
  onSubmit: (values: VisualCanvasFormValues) => Promise<void>;
};

const PortalVisualCanvasCreateForm = ({ project, isBusy, onCancel, onSubmit }: CreateFormProps) => {
  const t = useTranslations('Builder.visualMap.form');
  const form = useForm<VisualCanvasFormInput, unknown, VisualCanvasFormValues>({
    resolver: zodResolver(visualCanvasFormSchema),
    defaultValues: {
      contextType: 'project',
      contextId: project.id,
      mediaAssetId: '',
      title: '',
      description: '',
      isPrimary: true,
    },
  });

  const contextType = form.watch('contextType');
  const contextOptions = useMemo(
    () => buildContextOptions(project, contextType),
    [project, contextType],
  );

  return (
    <Card className="flex flex-col gap-3">
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        noValidate
      >
        <FormField id="canvas-context-type" label={t('contextType')}>
          <select
            id="canvas-context-type"
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
            {...form.register('contextType', {
              onChange: (event) => {
                const nextType = event.target.value as VisualMapContextType;
                form.setValue('contextType', nextType);
                const options = buildContextOptions(project, nextType);
                form.setValue('contextId', options[0]?.value ?? project.id);
              },
            })}
          >
            <option value="project">{t('contextProject')}</option>
            <option value="building">{t('contextBuilding')}</option>
            <option value="floor">{t('contextFloor')}</option>
          </select>
        </FormField>
        <FormField id="canvas-context-id" label={t('contextEntity')}>
          <select
            id="canvas-context-id"
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
            {...form.register('contextId')}
          >
            {contextOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <Controller
          control={form.control}
          name="mediaAssetId"
          render={({ field, fieldState }) => (
            <MediaUploadField
              id="canvas-media"
              label={t('mediaAssetId')}
              context="portal"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormField id="canvas-title" label={t('title')}>
          <Input id="canvas-title" {...form.register('title')} />
        </FormField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={isBusy}>
            {isBusy ? t('creating') : t('create')}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

type ContextOption = { value: string; label: string };

const buildContextOptions = (
  project: PortalProjectDetail,
  contextType: VisualMapContextType,
): ContextOption[] => {
  if (contextType === 'project') {
    return [{ value: project.id, label: project.name }];
  }

  if (contextType === 'building') {
    return project.buildings.map((building) => ({
      value: building.id,
      label: building.name,
    }));
  }

  return project.buildings.flatMap((building) =>
    building.floors.map((floor) => ({
      value: floor.id,
      label: `${building.name} · ${floor.displayLabel ?? floor.number}`,
    })),
  );
};

type Translate = ReturnType<typeof useTranslations>;

const resolveContextLabel = (
  project: PortalProjectDetail,
  contextType: VisualMapContextType,
  contextId: string,
  t: Translate,
): string => {
  if (contextType === 'project') {
    return project.name;
  }

  if (contextType === 'building') {
    return (
      project.buildings.find((building) => building.id === contextId)?.name ?? t('unknownContext')
    );
  }

  for (const building of project.buildings) {
    const floor = building.floors.find((item) => item.id === contextId);
    if (floor) {
      return `${building.name} · ${floor.displayLabel ?? floor.number}`;
    }
  }

  return t('unknownContext');
};
