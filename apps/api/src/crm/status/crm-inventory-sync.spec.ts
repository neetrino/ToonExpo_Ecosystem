import { BadRequestException } from '@nestjs/common';
import { ApartmentSalesStatus, CrmDealApartmentLinkType, CrmDealStatus } from '@toonexpo/db';
import { describe, expect, it, vi } from 'vitest';

import {
  CRM_APARTMENT_ALREADY_SOLD,
  applyCrmApartmentSalesWrite,
  assertApartmentReservableByDeal,
  dealStatusForManualInventory,
  inventorySalesStatusForDeal,
  isApartmentInventorySynced,
  linkTypeForInventoryStatus,
  shouldReleaseCrmReservation,
  type CrmInventoryClient,
} from './crm-inventory-sync.js';

describe('crm-inventory-sync', () => {
  it('maps converted deals to sold and other deals to reserved', () => {
    expect(inventorySalesStatusForDeal(CrmDealStatus.converted)).toBe(ApartmentSalesStatus.sold);
    expect(inventorySalesStatusForDeal(CrmDealStatus.new_request)).toBe(
      ApartmentSalesStatus.reserved,
    );
    expect(dealStatusForManualInventory(ApartmentSalesStatus.sold)).toBe(CrmDealStatus.converted);
    expect(dealStatusForManualInventory(ApartmentSalesStatus.available)).toBe(
      CrmDealStatus.new_request,
    );
    expect(linkTypeForInventoryStatus(ApartmentSalesStatus.sold)).toBe(
      CrmDealApartmentLinkType.sold,
    );
  });

  it('releases inventory on lost, closed, and pipeline reset', () => {
    expect(shouldReleaseCrmReservation(CrmDealStatus.lost)).toBe(true);
    expect(shouldReleaseCrmReservation(CrmDealStatus.closed)).toBe(true);
    expect(shouldReleaseCrmReservation(CrmDealStatus.new_request)).toBe(true);
    expect(shouldReleaseCrmReservation(CrmDealStatus.reserved)).toBe(false);
  });

  it('rejects apartments reserved by another deal or already sold', () => {
    expect(() =>
      assertApartmentReservableByDeal(
        {
          salesStatus: ApartmentSalesStatus.reserved,
          activeCrmDealId: 'deal_other',
        },
        'deal_1',
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertApartmentReservableByDeal(
        { salesStatus: ApartmentSalesStatus.sold, activeCrmDealId: null },
        'deal_1',
      ),
    ).toThrow(CRM_APARTMENT_ALREADY_SOLD);
  });

  it("allows available units and the same deal's reservation", () => {
    expect(() =>
      assertApartmentReservableByDeal(
        { salesStatus: ApartmentSalesStatus.available, activeCrmDealId: null },
        'deal_1',
      ),
    ).not.toThrow();
    expect(() =>
      assertApartmentReservableByDeal(
        {
          salesStatus: ApartmentSalesStatus.reserved,
          activeCrmDealId: 'deal_1',
        },
        'deal_1',
      ),
    ).not.toThrow();
  });

  it('detects when inventory already matches the deal', () => {
    expect(
      isApartmentInventorySynced(
        {
          salesStatus: ApartmentSalesStatus.reserved,
          activeCrmDealId: 'deal_1',
        },
        'deal_1',
        ApartmentSalesStatus.reserved,
      ),
    ).toBe(true);
  });

  it('writes apartment status, history, and link type', async () => {
    const apartmentUpdate = vi.fn();
    const historyCreate = vi.fn();
    const linkUpdateMany = vi.fn();

    await applyCrmApartmentSalesWrite(
      {
        apartment: { update: apartmentUpdate },
        apartmentStatusHistory: { create: historyCreate },
        crmDealApartmentLink: { updateMany: linkUpdateMany },
      } as unknown as CrmInventoryClient,
      {
        apartmentId: 'apt_1',
        previous: ApartmentSalesStatus.available,
        next: ApartmentSalesStatus.reserved,
        dealId: 'deal_1',
        actorUserId: 'user_1',
        linkType: CrmDealApartmentLinkType.reserved,
      },
    );

    expect(apartmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'apt_1' },
        data: expect.objectContaining({
          salesStatus: ApartmentSalesStatus.reserved,
          activeCrmDealId: 'deal_1',
        }),
      }),
    );
    expect(historyCreate).toHaveBeenCalled();
    expect(linkUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { linkType: CrmDealApartmentLinkType.reserved },
      }),
    );
  });
});
