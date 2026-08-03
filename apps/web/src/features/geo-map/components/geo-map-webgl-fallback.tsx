'use client';

export type GeoMapWebglFallbackProps = {
  className?: string | undefined;
};

/** Graceful fallback rendered instead of the map when the browser/device lacks WebGL. */
export const GeoMapWebglFallback = ({ className }: GeoMapWebglFallbackProps) => (
  <div
    className={`flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-md border border-border bg-surface p-6 text-center ${className ?? ''}`}
  >
    <p className="text-sm font-medium text-ink">3D map unavailable</p>
    <p className="text-xs text-ink-secondary">
      Your browser or device does not support WebGL, which is required to display the interactive
      map.
    </p>
  </div>
);
