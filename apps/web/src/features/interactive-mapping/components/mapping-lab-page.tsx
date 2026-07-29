'use client';

import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { INTERACTIVE_MAPPING_BASE_PATH } from '../constants';
import { MappingCanvas, type MappingEntity } from './mapping-canvas/mapping-canvas';

const LAB_IMAGE_WIDTH = 1600;
const LAB_IMAGE_HEIGHT = 900;

const LAB_ENTITIES: MappingEntity[] = [
  {
    id: 'lab-a',
    label: 'A',
    title: 'District A',
    markerX: 0.28,
    markerY: 0.42,
    svgPath: null,
  },
  {
    id: 'lab-b',
    label: 'B',
    title: 'District B',
    markerX: 0.62,
    markerY: 0.55,
    svgPath: null,
  },
  {
    id: 'lab-c',
    label: 'C',
    title: 'District C',
    markerX: null,
    markerY: null,
    svgPath: null,
  },
];

/**
 * Temporary MappingCanvas sandbox for headed QA.
 */
export const MappingLabPage = () => {
  const [entities, setEntities] = useState(LAB_ENTITIES);
  const [selectedId, setSelectedId] = useState<string | null>(LAB_ENTITIES[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">QA</p>
          <h1 className="font-display text-3xl text-ink">Interactive mapping lab</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Sandbox with fake entities. Coordinates stay normalized 0–1.
          </p>
        </div>
        <Link
          href={INTERACTIVE_MAPPING_BASE_PATH}
          className="text-xs uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:underline"
        >
          ← Interactive mapping
        </Link>
      </div>

      <MappingCanvas
        imageUrl="https://placehold.co/1600x900/e3e0d9/0e0f14/png?text=Masterplan"
        imageWidth={LAB_IMAGE_WIDTH}
        imageHeight={LAB_IMAGE_HEIGHT}
        viewBoxWidth={LAB_IMAGE_WIDTH}
        viewBoxHeight={LAB_IMAGE_HEIGHT}
        entities={entities}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChangeEntity={(id, patch) => {
          setEntities((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
          );
        }}
        onPolygonClosed={(id, svgPath) => {
          setEntities((prev) => prev.map((item) => (item.id === id ? { ...item, svgPath } : item)));
        }}
        onPolygonDeleted={(id) => {
          setEntities((prev) =>
            prev.map((item) => (item.id === id ? { ...item, svgPath: null } : item)),
          );
        }}
      />
    </div>
  );
};
