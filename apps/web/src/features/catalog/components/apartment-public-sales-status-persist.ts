import type { ApartmentSalesStatus } from '@toonexpo/contracts';

import { updatePortalApartment } from '@/features/builder/api/portal-apartments-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';

export type PersistApartmentSalesStatusInput = {
  apartmentId: string;
  scope: CatalogScope;
  next: ApartmentSalesStatus;
  currentStatus: ApartmentSalesStatus;
  isSaving: boolean;
  setCurrentStatus: (status: ApartmentSalesStatus) => void;
  setIsSaving: (value: boolean) => void;
  setErrorMessage: (value: string | null) => void;
  onSaved: (status: ApartmentSalesStatus) => void;
  showSuccess: (message: string) => void;
  savedLabel: string;
  errorLabel: string;
  refresh: () => void;
};

/**
 * Optimistic PATCH of apartment sales status for the public detail chip.
 */
export const persistApartmentSalesStatus = async (
  input: PersistApartmentSalesStatusInput,
): Promise<void> => {
  if (input.next === input.currentStatus || input.isSaving) {
    return;
  }
  const previous = input.currentStatus;
  input.setCurrentStatus(input.next);
  input.setIsSaving(true);
  input.setErrorMessage(null);
  try {
    await updatePortalApartment(input.apartmentId, { salesStatus: input.next }, {
      scope: input.scope,
    });
    input.onSaved(input.next);
    input.showSuccess(input.savedLabel);
    input.refresh();
  } catch {
    input.setCurrentStatus(previous);
    input.setErrorMessage(input.errorLabel);
  } finally {
    input.setIsSaving(false);
  }
};
