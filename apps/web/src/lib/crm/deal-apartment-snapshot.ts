import type { ApartmentStatus } from '@toonexpo/domain';

export type ApartmentSnapshotSource = {
  priceAmd: number | null;
  status: ApartmentStatus;
};

/** Captures apartment inventory fields at link time (doc 08-CRM-Lead-Intake/07). */
export function buildDealApartmentSnapshotData(apartment: ApartmentSnapshotSource) {
  return {
    priceAmdSnapshot: apartment.priceAmd,
    statusSnapshot: apartment.status,
    snapshotAt: new Date(),
  };
}
