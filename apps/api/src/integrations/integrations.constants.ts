import type { BosRequestedModule } from "@toonexpo/contracts";

/** Module keys accepted on the BOS provisioning wire contract. */
export const BOS_REQUESTED_MODULES = [
  "builder_portal",
  "constructor_crm",
  "readiness",
  "partner_profile",
  "bank_offers",
  "analytics",
] as const satisfies readonly BosRequestedModule[];

/** Terminal stored statuses that replay without side effects. */
export const BOS_TERMINAL_REPLAY_STATUSES = [
  "success",
  "linked_existing",
] as const;

/** Stored statuses eligible for retry continuation. */
export const BOS_RETRY_STATUSES = ["failed", "partial"] as const;

/** Safe message returned to BOS when email is linked elsewhere. */
export const BOS_EMAIL_CONFLICT_MESSAGE =
  "Primary contact email is already linked to another participant";

/** Safe message when the contact belongs to another company. */
export const BOS_CROSS_COMPANY_MESSAGE =
  "Primary contact is already assigned to another company";

/** Safe message when invitation delivery failed but entities exist. */
export const BOS_INVITE_RETRY_MESSAGE =
  "Account created but invitation could not be sent; please retry the request";

/** Maximum request_id length accepted from BOS. */
export const BOS_REQUEST_ID_MAX_LENGTH = 128;

/** Maximum bos_company_id length accepted from BOS. */
export const BOS_COMPANY_ID_MAX_LENGTH = 128;

/** Maximum event cycle field length accepted from BOS. */
export const BOS_EVENT_CYCLE_MAX_LENGTH = 128;
