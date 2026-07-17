import type {
  ApartmentUpsertInput,
  BuildingCreateInput,
  BuildingPublicationInput,
  BuildingUpdateInput,
  FloorCreateInput,
  FloorPublicationInput,
  FloorUpdateInput,
} from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';
import type { AuditActor } from '@/lib/audit/record-audit';

import type { BuilderMutationResult } from './mutation-result';

export function createBuilding(companyId: string, input: BuildingCreateInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ buildingId: string }>>('/builder/buildings', {
    method: 'POST',
    body: input,
  });
}

export function updateBuilding(companyId: string, input: BuildingUpdateInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ buildingId: string }>>('/builder/buildings', {
    method: 'PATCH',
    body: input,
  });
}

export function setBuildingPublication(
  companyId: string,
  input: BuildingPublicationInput,
  actor: AuditActor,
) {
  void companyId;
  void actor;
  return apiRequest<BuilderMutationResult<{ buildingId: string }>>(
    '/builder/buildings/publication',
    { method: 'PATCH', body: input },
  );
}

export function createFloor(companyId: string, input: FloorCreateInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ floorId: string }>>('/builder/floors', {
    method: 'POST',
    body: input,
  });
}

export function updateFloor(companyId: string, input: FloorUpdateInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ floorId: string }>>('/builder/floors', {
    method: 'PATCH',
    body: input,
  });
}

export function setFloorPublication(
  companyId: string,
  input: FloorPublicationInput,
  actor: AuditActor,
) {
  void companyId;
  void actor;
  return apiRequest<BuilderMutationResult<{ floorId: string }>>(
    '/builder/floors/publication',
    { method: 'PATCH', body: input },
  );
}

export function upsertApartment(
  companyId: string,
  input: ApartmentUpsertInput,
  actorUserId?: string,
) {
  void companyId;
  void actorUserId;
  return apiRequest<BuilderMutationResult<{ apartmentId: string }>>(
    '/builder/apartments/upsert',
    { method: 'POST', body: input },
  );
}

export function createApartment(companyId: string, input: ApartmentUpsertInput) {
  return upsertApartment(companyId, input);
}

export function updateApartment(
  companyId: string,
  input: ApartmentUpsertInput & { apartmentId: string },
  actorUserId?: string,
) {
  return upsertApartment(companyId, input, actorUserId);
}
