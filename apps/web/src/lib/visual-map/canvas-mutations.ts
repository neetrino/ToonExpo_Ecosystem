import type { CanvasStatusInput, CanvasUpsertInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';
import { apiRequest } from '@/lib/api/client';

import type { VisualMapMutationResult } from './mutation-result';

function mutate<T extends Record<string, unknown>>(
  action: string,
  companyId: string,
  input: unknown,
): Promise<VisualMapMutationResult<T>> {
  return apiRequest(`/visual-map/builder/actions/${action}`, {
    method: 'POST',
    body: { companyId, input },
  });
}

export function createCanvas(
  companyId: string,
  input: CanvasUpsertInput,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return mutate('create-canvas', companyId, input);
}

export function updateCanvas(
  companyId: string,
  input: CanvasUpsertInput,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return mutate('update-canvas', companyId, input);
}

export function setCanvasStatus(
  companyId: string,
  input: CanvasStatusInput,
  _actor: AuditActor,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return mutate('set-canvas-status', companyId, input);
}

export function deleteCanvas(
  companyId: string,
  canvasId: string,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return mutate('delete-canvas', companyId, { canvasId });
}
