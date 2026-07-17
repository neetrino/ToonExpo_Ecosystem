import type {
  ActivityStatusUpdateInput,
  DealActivityInput,
  DealApartmentLinkInput,
  DealAssignInput,
  DealStageUpdateInput,
  ManualDealInput,
} from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

import type { CrmMutationResult } from './mutation-result';

type InventoryResult = CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>;

export function updateDealStage(
  companyId: string,
  input: DealStageUpdateInput,
  actorUserId?: string,
): Promise<InventoryResult> {
  void companyId;
  void actorUserId;
  return mutate('/crm/deals/stage', 'PATCH', input);
}

export function linkDealApartment(
  companyId: string,
  input: DealApartmentLinkInput,
): Promise<InventoryResult> {
  void companyId;
  return mutate('/crm/deals/apartments', 'POST', input);
}

export function unlinkDealApartment(
  companyId: string,
  input: DealApartmentLinkInput,
  actorUserId?: string,
): Promise<InventoryResult> {
  void companyId;
  void actorUserId;
  return mutate('/crm/deals/apartments/unlink', 'POST', input);
}

export function addDealActivity(
  companyId: string,
  input: DealActivityInput,
  actorUserId?: string,
): Promise<CrmMutationResult> {
  void companyId;
  void actorUserId;
  return mutate('/crm/deals/activities', 'POST', input);
}

export function setActivityStatus(
  companyId: string,
  input: ActivityStatusUpdateInput,
): Promise<CrmMutationResult> {
  void companyId;
  return mutate('/crm/activities/status', 'PATCH', input);
}

export function assignDeal(
  companyId: string,
  input: DealAssignInput,
  actorUserId?: string,
): Promise<CrmMutationResult> {
  void companyId;
  void actorUserId;
  return mutate('/crm/deals/assignee', 'PATCH', input);
}

export function createManualDeal(
  companyId: string,
  input: ManualDealInput,
  actorUserId?: string,
): Promise<InventoryResult> {
  void companyId;
  void actorUserId;
  return mutate('/crm/deals/manual', 'POST', input);
}

function mutate<T>(path: string, method: 'POST' | 'PATCH', body: unknown): Promise<T> {
  return serverApiRequest<T>(path, { method, body });
}
