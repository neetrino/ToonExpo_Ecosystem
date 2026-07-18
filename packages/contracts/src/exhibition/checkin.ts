export type CheckInStatus =
  | "allowed"
  | "denied_invalid_qr"
  | "denied_blocked"
  | "duplicate_checkin"
  | "error";

export type CheckInSummaryResponse = {
  eventId: string;
  allowedCount: number;
  duplicateAttempts: number;
  deniedCount: number;
  uniqueVisitors: number;
  perDay: CheckInDayBreakdown[];
};

export type CheckInDayBreakdown = {
  date: string;
  allowedCount: number;
  duplicateAttempts: number;
  deniedCount: number;
};

export type CheckInScanRequest = {
  token: string;
  eventId: string;
};

export type CheckInScanResponse = {
  status: CheckInStatus;
  visitorDisplayName: string | null;
  checkedInAt: string | null;
  duplicateWarning: boolean;
};

export type RecentCheckInItem = {
  visitorDisplayName: string | null;
  status: CheckInStatus;
  checkedInAt: string;
};

export type RecentCheckInResponse = {
  data: RecentCheckInItem[];
};
