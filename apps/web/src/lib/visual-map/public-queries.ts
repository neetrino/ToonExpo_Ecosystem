import type { PublicCanvas } from '@toonexpo/contracts';

import { resolvePublishedCanvas, type PublicCanvasContext } from './public-canvas-fetch';

export type { PublicCanvasContext };

/**
 * Returns a published canvas for a context only when the owning project is PUBLISHED.
 */
export async function getPublishedCanvasForContext(
  context: PublicCanvasContext,
): Promise<PublicCanvas | null> {
  return resolvePublishedCanvas(context);
}
