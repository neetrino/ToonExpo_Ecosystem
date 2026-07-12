'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';
import { computeBoothRoute, type RouteGraph, type RoutePoint } from '@/lib/exhibition/route-path';
import type { PublicBooth, PublicVenueMap } from '@/lib/exhibition/venue-queries';

type PublicVenueMapViewProps = {
  venueMap: PublicVenueMap;
};

function boothMatchesQuery(booth: PublicBooth, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [booth.code, booth.label, booth.company?.name, booth.partner?.name, booth.note]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function toRouteGraph(venueMap: PublicVenueMap): RouteGraph {
  return {
    nodes: venueMap.pathNodes.map((node) => ({
      id: node.id,
      xPercent: node.xPercent,
      yPercent: node.yPercent,
      kind: node.kind,
      boothId: node.boothId,
    })),
    edges: venueMap.pathEdges.map((edge) => ({
      fromNodeId: edge.fromNodeId,
      toNodeId: edge.toNodeId,
    })),
  };
}

export function PublicVenueMapView({ venueMap }: PublicVenueMapViewProps) {
  const t = useTranslations('catalog.exhibition');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[] | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleBooths = useMemo(
    () => venueMap.booths.filter((booth) => boothMatchesQuery(booth, normalizedQuery)),
    [venueMap.booths, normalizedQuery],
  );

  const selected = venueMap.booths.find((booth) => booth.id === selectedId) ?? null;
  const graph = useMemo(() => toRouteGraph(venueMap), [venueMap]);
  const entrance =
    venueMap.entranceXPercent != null && venueMap.entranceYPercent != null
      ? { xPercent: venueMap.entranceXPercent, yPercent: venueMap.entranceYPercent }
      : null;

  const previewRoute = selected ? computeBoothRoute(graph, selected, entrance) : null;

  function handleSelectBooth(boothId: string): void {
    setSelectedId(boothId);
    setRoutePoints(null);
  }

  function handleShowRoute(): void {
    if (!selected || !previewRoute) {
      return;
    }
    setRoutePoints(previewRoute);
  }

  function handleClearRoute(): void {
    setRoutePoints(null);
  }

  function handleCloseDetail(): void {
    setSelectedId(null);
    setRoutePoints(null);
  }

  const polylinePoints =
    routePoints?.map((point) => `${point.xPercent},${point.yPercent}`).join(' ') ?? '';

  return (
    <div className="catalog-venue">
      <div className="catalog-venue__toolbar">
        <label className="catalog-venue__search" htmlFor="venue-booth-search">
          <span className="catalog-venue__search-label">{t('searchLabel')}</span>
          <input
            id="venue-booth-search"
            className="catalog-venue__search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
          />
        </label>
        <p className="catalog-venue__count">{t('boothCount', { count: visibleBooths.length })}</p>
      </div>

      <div className="catalog-venue__layout">
        <div className="catalog-visual-map-canvas catalog-venue__canvas">
          <Image
            src={venueMap.imageUrl}
            alt={venueMap.imageAlt ?? venueMap.event.name}
            width={CATALOG_IMAGE_WIDTH}
            height={CATALOG_IMAGE_HEIGHT}
            className="catalog-visual-map-canvas__image"
            sizes="(max-width: 72rem) 100vw, 72rem"
            priority
          />
          <div className="catalog-visual-map-canvas__overlay">
            {polylinePoints ? (
              <svg
                className="catalog-venue-route"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  className="catalog-venue-route__line"
                  points={polylinePoints}
                  fill="none"
                />
              </svg>
            ) : null}
            {visibleBooths.map((booth) => (
              <button
                key={booth.id}
                type="button"
                className={
                  selectedId === booth.id
                    ? 'catalog-venue-marker catalog-venue-marker--selected'
                    : 'catalog-venue-marker'
                }
                style={{ left: `${booth.xPercent}%`, top: `${booth.yPercent}%` }}
                title={booth.code}
                aria-label={booth.label}
                aria-pressed={selectedId === booth.id}
                onClick={() => handleSelectBooth(booth.id)}
              >
                <span className="catalog-venue-marker__code">{booth.code}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="catalog-venue__panel" aria-live="polite">
          {selected ? (
            <BoothDetail
              booth={selected}
              labels={{
                code: t('detail.code'),
                company: t('detail.company'),
                partner: t('detail.partner'),
                note: t('detail.note'),
                viewCompany: t('detail.viewCompany'),
                viewPartner: t('detail.viewPartner'),
                close: t('detail.close'),
                showRoute: t('detail.showRoute'),
                clearRoute: t('detail.clearRoute'),
                routeUnavailable: t('detail.routeUnavailable'),
              }}
              canShowRoute={previewRoute != null}
              routeActive={routePoints != null}
              onShowRoute={handleShowRoute}
              onClearRoute={handleClearRoute}
              onClose={handleCloseDetail}
            />
          ) : (
            <p className="catalog-venue__panel-empty">{t('selectHint')}</p>
          )}
        </aside>
      </div>

      {visibleBooths.length === 0 ? <p className="catalog-empty">{t('noMatches')}</p> : null}
    </div>
  );
}

type BoothDetailProps = {
  booth: PublicBooth;
  labels: {
    code: string;
    company: string;
    partner: string;
    note: string;
    viewCompany: string;
    viewPartner: string;
    close: string;
    showRoute: string;
    clearRoute: string;
    routeUnavailable: string;
  };
  canShowRoute: boolean;
  routeActive: boolean;
  onShowRoute: () => void;
  onClearRoute: () => void;
  onClose: () => void;
};

function BoothDetail({
  booth,
  labels,
  canShowRoute,
  routeActive,
  onShowRoute,
  onClearRoute,
  onClose,
}: BoothDetailProps) {
  return (
    <div className="catalog-venue__detail">
      <div className="catalog-venue__detail-header">
        <h2 className="catalog-venue__detail-title">{booth.label}</h2>
        <button type="button" className="portal-btn portal-btn--ghost" onClick={onClose}>
          {labels.close}
        </button>
      </div>
      <p className="catalog-venue__detail-code">
        {labels.code}: <code>{booth.code}</code>
      </p>
      {booth.company ? (
        <p>
          {labels.company}:{' '}
          <Link className="portal-link" href={`/builders/${booth.company.slug}`}>
            {booth.company.name}
          </Link>
        </p>
      ) : null}
      {booth.partner ? (
        <p>
          {labels.partner}:{' '}
          <Link className="portal-link" href={`/partners/${booth.partner.slug}`}>
            {booth.partner.name}
          </Link>
        </p>
      ) : null}
      {booth.note ? (
        <p>
          {labels.note}: {booth.note}
        </p>
      ) : null}
      <div className="catalog-venue__route-actions">
        {canShowRoute ? (
          routeActive ? (
            <button type="button" className="portal-btn portal-btn--ghost" onClick={onClearRoute}>
              {labels.clearRoute}
            </button>
          ) : (
            <button type="button" className="portal-btn" onClick={onShowRoute}>
              {labels.showRoute}
            </button>
          )
        ) : (
          <p className="catalog-venue__route-unavailable">{labels.routeUnavailable}</p>
        )}
      </div>
    </div>
  );
}
