'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { useRouter } from '@/i18n/navigation';
import type { AdminPathEdgeRow, AdminPathNodeRow } from '@/lib/exhibition/admin-venue-queries';
import type { AdminMutationErrorKey } from '@/lib/admin/mutation-result';
import { computeHotspotPercent } from '@/lib/visual-map/hotspot-geometry';

import {
  deleteVenuePathEdgeAction,
  deleteVenuePathNodeAction,
  setVenueEntranceAction,
  upsertVenuePathEdgeAction,
  upsertVenuePathNodeAction,
} from './actions';

type PathGraphEditorProps = {
  locale: string;
  eventId: string;
  venueMapId: string;
  imageUrl: string;
  imageAlt: string | null;
  entranceXPercent: number | null;
  entranceYPercent: number | null;
  pathNodes: AdminPathNodeRow[];
  pathEdges: AdminPathEdgeRow[];
};

type ClickMode = 'entrance' | 'waypoint' | 'link';

export function PathGraphEditor({
  locale,
  eventId,
  venueMapId,
  imageUrl,
  imageAlt,
  entranceXPercent,
  entranceYPercent,
  pathNodes,
  pathEdges,
}: PathGraphEditorProps) {
  const t = useTranslations('admin.exhibition.venue.path');
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<ClickMode>('waypoint');
  const [linkFirstId, setLinkFirstId] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<AdminMutationErrorKey | undefined>();
  const [pending, startTransition] = useTransition();

  function refresh(): void {
    router.refresh();
  }

  function handleMapClick(event: React.MouseEvent<HTMLImageElement>): void {
    if (mode === 'link') {
      return;
    }
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const coords = computeHotspotPercent(rect, event.clientX, event.clientY);
    setErrorKey(undefined);
    startTransition(async () => {
      if (mode === 'entrance') {
        const result = await setVenueEntranceAction(locale, eventId, {
          venueMapId,
          entranceXPercent: coords.x,
          entranceYPercent: coords.y,
        });
        if (!result.ok) {
          setErrorKey(result.errorKey);
          return;
        }
      } else {
        const result = await upsertVenuePathNodeAction(locale, eventId, {
          venueMapId,
          xPercent: coords.x,
          yPercent: coords.y,
          kind: 'WAYPOINT',
        });
        if (!result.ok) {
          setErrorKey(result.errorKey);
          return;
        }
      }
      refresh();
    });
  }

  function handleNodeClick(nodeId: string): void {
    if (mode !== 'link') {
      return;
    }
    setErrorKey(undefined);
    if (!linkFirstId) {
      setLinkFirstId(nodeId);
      return;
    }
    if (linkFirstId === nodeId) {
      setLinkFirstId(null);
      return;
    }
    const fromNodeId = linkFirstId;
    setLinkFirstId(null);
    startTransition(async () => {
      const result = await upsertVenuePathEdgeAction(locale, eventId, {
        venueMapId,
        fromNodeId,
        toNodeId: nodeId,
      });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      refresh();
    });
  }

  function handleDeleteNode(nodeId: string): void {
    setErrorKey(undefined);
    startTransition(async () => {
      const result = await deleteVenuePathNodeAction(locale, eventId, { nodeId });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      refresh();
    });
  }

  function handleDeleteEdge(edgeId: string): void {
    setErrorKey(undefined);
    startTransition(async () => {
      const result = await deleteVenuePathEdgeAction(locale, eventId, { edgeId });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      refresh();
    });
  }

  const nodeById = new Map(pathNodes.map((node) => [node.id, node]));

  return (
    <section className="portal-venue-path">
      <h3 className="portal-venue-path__title">{t('title')}</h3>
      <p className="portal-visual-map-hint">{t('hint')}</p>
      <p className="portal-visual-map-hint">
        {t('entranceStatus', {
          status:
            entranceXPercent != null && entranceYPercent != null
              ? `${entranceXPercent.toFixed(1)}, ${entranceYPercent.toFixed(1)}`
              : t('entranceUnset'),
        })}
      </p>

      <div className="portal-venue-path__modes" role="group" aria-label={t('modesLabel')}>
        {(['entrance', 'waypoint', 'link'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={mode === value ? 'portal-btn' : 'portal-btn portal-btn--ghost'}
            disabled={pending}
            onClick={() => {
              setMode(value);
              setLinkFirstId(null);
            }}
          >
            {t(`modes.${value}`)}
          </button>
        ))}
      </div>
      {mode === 'link' && linkFirstId ? (
        <p className="portal-visual-map-hint">{t('linkPickSecond')}</p>
      ) : null}
      <PortalFormError errorKey={errorKey} />

      <div className="portal-visual-map-canvas">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={imageAlt ?? t('title')}
          className="portal-visual-map-canvas__image"
          onClick={handleMapClick}
        />
        <div className="portal-visual-map-canvas__overlay">
          <svg
            className="portal-venue-path__edges"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {pathEdges.map((edge) => {
              const from = nodeById.get(edge.fromNodeId);
              const to = nodeById.get(edge.toNodeId);
              if (!from || !to) {
                return null;
              }
              return (
                <line
                  key={edge.id}
                  className="portal-venue-path__edge"
                  x1={from.xPercent}
                  y1={from.yPercent}
                  x2={to.xPercent}
                  y2={to.yPercent}
                />
              );
            })}
          </svg>
          {pathNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={
                linkFirstId === node.id
                  ? 'portal-venue-path-node portal-venue-path-node--selected'
                  : `portal-venue-path-node portal-venue-path-node--${node.kind.toLowerCase()}`
              }
              style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
              title={`${node.kind} ${node.id.slice(0, 6)}`}
              aria-label={node.kind}
              onClick={(event) => {
                event.stopPropagation();
                handleNodeClick(node.id);
              }}
            >
              {node.kind === 'ENTRANCE' ? 'E' : node.kind === 'BOOTH' ? 'B' : 'W'}
            </button>
          ))}
        </div>
      </div>

      <ul className="portal-venue-path__list">
        {pathNodes.map((node) => (
          <li key={node.id}>
            <span>
              {node.kind} · {node.xPercent.toFixed(1)}, {node.yPercent.toFixed(1)}
            </span>
            <button
              type="button"
              className="portal-btn portal-btn--ghost"
              disabled={pending}
              onClick={() => handleDeleteNode(node.id)}
            >
              {t('deleteNode')}
            </button>
          </li>
        ))}
      </ul>
      <ul className="portal-venue-path__list">
        {pathEdges.map((edge) => (
          <li key={edge.id}>
            <span>
              {edge.fromNodeId.slice(0, 6)} ↔ {edge.toNodeId.slice(0, 6)}
            </span>
            <button
              type="button"
              className="portal-btn portal-btn--ghost"
              disabled={pending}
              onClick={() => handleDeleteEdge(edge.id)}
            >
              {t('deleteEdge')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
