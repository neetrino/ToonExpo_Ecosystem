import type { PublicCanvas, PublicHotspot } from '@toonexpo/contracts';
import Image from 'next/image';

import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';
import { buildPublicHotspotHref } from '@/lib/visual-map/public-hotspot-href';

type PublicVisualCanvasProps = {
  canvas: PublicCanvas;
  title?: string;
  className?: string;
};

function markerLabel(hotspot: PublicHotspot): string {
  if (hotspot.label) {
    return hotspot.label;
  }
  if (hotspot.target.type === 'building') {
    return hotspot.target.name;
  }
  if (hotspot.target.type === 'floor') {
    return hotspot.target.name;
  }
  return hotspot.target.code;
}

function markerStatusClass(hotspot: PublicHotspot): string {
  if (hotspot.target.type !== 'apartment') {
    return '';
  }
  return ` catalog-visual-map-marker--${hotspot.target.status.toLowerCase()}`;
}

export function PublicVisualCanvas({ canvas, title, className }: PublicVisualCanvasProps) {
  if (canvas.hotspots.length === 0) {
    return null;
  }

  const sectionClass = className ? `catalog-visual-map ${className}` : 'catalog-visual-map';

  return (
    <section className={sectionClass}>
      {title ? <h3 className="catalog-visual-map__title">{title}</h3> : null}
      <div className="catalog-visual-map-canvas">
        <Image
          src={canvas.imageUrl}
          alt={canvas.imageAlt ?? canvas.title ?? 'Visual map'}
          width={CATALOG_IMAGE_WIDTH}
          height={CATALOG_IMAGE_HEIGHT}
          className="catalog-visual-map-canvas__image"
          sizes="(max-width: 72rem) 100vw, 72rem"
        />
        <div className="catalog-visual-map-canvas__overlay" aria-hidden={false}>
          {canvas.hotspots.map((hotspot) => (
            <a
              key={hotspot.id}
              href={buildPublicHotspotHref(hotspot.target)}
              className={`catalog-visual-map-marker${markerStatusClass(hotspot)}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              title={markerLabel(hotspot)}
              aria-label={markerLabel(hotspot)}
            >
              <span className="catalog-visual-map-marker__tooltip">{markerLabel(hotspot)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
