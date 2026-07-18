import type { IntakeCreateResult } from "@toonexpo/contracts";
import type { RequestSource } from "@toonexpo/db";

/**
 * Input for the unified RequestIntakeService.create use case.
 */
export type IntakeCreateContext = {
  source: RequestSource;
  builderCompanyId: string;
  buyerProfileId?: string | null | undefined;
  projectId?: string | null | undefined;
  apartmentId?: string | null | undefined;
  note?: string | null | undefined;
  scanEventId?: string | null | undefined;
  createdByUserId?: string | null | undefined;
  /** Manual entry contact fields. */
  contactName?: string | null | undefined;
  contactPhone?: string | null | undefined;
  contactEmail?: string | null | undefined;
  /**
   * When true and an open deal exists, still create a brand-new deal.
   * v1 API does not expose this; reserved for explicit confirmation later.
   */
  forceNewDeal?: boolean | undefined;
};

export type IntakeCreateOutcome = IntakeCreateResult;
