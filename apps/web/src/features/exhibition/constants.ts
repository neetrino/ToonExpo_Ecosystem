/** Auto-reset delay after a check-in scan result (ms). */
export const CHECKIN_RESULT_RESET_MS = 4000;

/** Debounce delay for expo map booth search (ms). */
export const EXPO_SEARCH_DEBOUNCE_MS = 300;

/** Minimum characters before expo search runs. */
export const EXPO_SEARCH_MIN_LENGTH = 1;

export const EXHIBITION_EVENT_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
  "cancelled",
] as const;

export const EXHIBITION_BOOTH_TYPES = [
  "builder",
  "bank",
  "partner",
  "sponsor",
  "service",
  "info",
  "entrance",
  "other",
] as const;

export const EXHIBITION_ROUTE_NODE_TYPES = [
  "entrance",
  "intersection",
  "booth",
  "info",
  "other",
] as const;

export const EXHIBITION_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const CHECKIN_QUERY_KEY = ["checkin"] as const;
export const checkinActiveEventQueryKey = () =>
  [...CHECKIN_QUERY_KEY, "active-event"] as const;
export const checkinRecentQueryKey = (eventId: string) =>
  [...CHECKIN_QUERY_KEY, "recent", eventId] as const;

export const PUBLIC_EXPO_QUERY_KEY = ["public", "expo"] as const;
export const publicCurrentEventQueryKey = () =>
  [...PUBLIC_EXPO_QUERY_KEY, "current-event"] as const;
export const publicVenueMapBoothsQueryKey = (mapId: string, locale: string) =>
  [...PUBLIC_EXPO_QUERY_KEY, "booths", mapId, locale] as const;
export const publicVenueMapSearchQueryKey = (
  mapId: string,
  query: string,
  locale: string,
) => [...PUBLIC_EXPO_QUERY_KEY, "search", mapId, query, locale] as const;

export const ADMIN_EVENTS_QUERY_KEY = ["admin", "events"] as const;
export const adminEventQueryKey = (id: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, id] as const;
export const adminEventCheckInSummaryQueryKey = (id: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, id, "check-in-summary"] as const;
export const adminEventVenueMapsQueryKey = (eventId: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, eventId, "venue-maps"] as const;
export const adminVenueMapBoothsQueryKey = (mapId: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, "venue-maps", mapId, "booths"] as const;
export const adminVenueMapRouteGraphQueryKey = (mapId: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, "venue-maps", mapId, "route-graph"] as const;
export const adminBoothAssignmentsQueryKey = (boothId: string) =>
  [...ADMIN_EVENTS_QUERY_KEY, "booths", boothId, "assignments"] as const;
