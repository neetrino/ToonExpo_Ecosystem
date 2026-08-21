'use client';

import { catalogVisualMapHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import type { PortalProjectDetail, VisualMapContextType } from '@toonexpo/contracts';
import { SquarePen } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePortalProjectVisualCanvasesQuery } from '@/features/visual-map/hooks/use-portal-visual-map';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

type PortalVisualCanvasesSectionProps = {
  project: PortalProjectDetail;
};

const META_COL_CLASS = 'w-28 px-3 py-3 text-center align-middle';
const ACTIONS_COL_CLASS = 'w-40 px-3 py-3 text-center align-middle whitespace-nowrap';

/**
 * Visual canvas list on the builder project page.
 */
export const PortalVisualCanvasesSection = ({ project }: PortalVisualCanvasesSectionProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.visualMap');
  const canvasesQuery = usePortalProjectVisualCanvasesQuery(project.id);

  const canvases = canvasesQuery.data?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

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
                <th className={cn(ACTIONS_COL_CLASS, 'font-medium')}>{t('columns.actions')}</th>
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
                  <td className={ACTIONS_COL_CLASS}>
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
