import type { BuyerCheckInStatusResponse } from '@toonexpo/contracts';

/**
 * Sample buyer check-in payload for empty-state UI preview.
 * Not persisted — shown only when the account has no real check-in data yet.
 */
export const BUYER_CHECKIN_PREVIEW: BuyerCheckInStatusResponse = {
  activeEvent: {
    id: 'preview-event',
    name: 'ToonExpo Yerevan 2026',
  },
  current: {
    checkedIn: true,
    eventId: 'preview-event',
    eventName: 'ToonExpo Yerevan 2026',
    checkedInAt: '2026-08-10T10:24:00.000Z',
  },
  history: [
    {
      eventId: 'preview-event-spring',
      eventName: 'ToonExpo Spring Preview',
      checkedInAt: '2026-04-12T11:05:00.000Z',
    },
    {
      eventId: 'preview-event-partners',
      eventName: 'Builder Partners Day',
      checkedInAt: '2026-02-20T09:40:00.000Z',
    },
  ],
};
