'use server';

import {
  canvasIdInputSchema,
  canvasStatusInputSchema,
  canvasUpsertInputSchema,
  hotspotIdInputSchema,
  hotspotMoveInputSchema,
  hotspotUpsertInputSchema,
} from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  createCanvas,
  createHotspot,
  deleteCanvas,
  deleteHotspot,
  moveHotspot,
  setCanvasStatus,
  updateCanvas,
  updateHotspot,
  type VisualMapMutationErrorKey,
  type VisualMapMutationResult,
} from '@/lib/visual-map/mutations';
import { resolveCatalogPaths } from '@/lib/shared/resolve-catalog-paths';
import { revalidateCatalogPaths } from '@/lib/shared/revalidate-catalog-paths';

export type VisualMapActionResult<T extends Record<string, unknown> = Record<string, never>> =
  VisualMapMutationResult<T>;

type Failure = { ok: false; errorKey: VisualMapMutationErrorKey };

function unauthorized(): Failure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): Failure {
  return { ok: false, errorKey: 'invalidInput' };
}

async function revalidateProject(companyId: string, projectId: string): Promise<void> {
  const paths = await resolveCatalogPaths(companyId, { projectId });
  revalidateCatalogPaths(paths ?? {});
}

export async function createCanvasAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ canvasId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = canvasUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.canvasId) {
    return invalidInput();
  }

  const result = await createCanvas(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function updateCanvasAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ canvasId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = canvasUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.canvasId) {
    return invalidInput();
  }

  const result = await updateCanvas(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function setCanvasStatusAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ canvasId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = canvasStatusInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setCanvasStatus(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function deleteCanvasAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ canvasId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = canvasIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await deleteCanvas(session.companyId, parsed.data.canvasId);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function createHotspotAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ hotspotId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = hotspotUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.hotspotId) {
    return invalidInput();
  }

  const result = await createHotspot(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function updateHotspotAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ hotspotId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = hotspotUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.hotspotId) {
    return invalidInput();
  }

  const result = await updateHotspot(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function moveHotspotAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ hotspotId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = hotspotMoveInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await moveHotspot(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}

export async function deleteHotspotAction(
  _locale: string,
  raw: unknown,
): Promise<VisualMapActionResult<{ hotspotId: string; projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = hotspotIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await deleteHotspot(session.companyId, parsed.data.hotspotId);
  if (result.ok) {
    await revalidateProject(session.companyId, result.projectId);
  }
  return result;
}
