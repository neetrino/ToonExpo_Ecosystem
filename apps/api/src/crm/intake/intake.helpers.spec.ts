import { describe, expect, it } from "vitest";
import { CrmDealStatus, RequestSource } from "@toonexpo/db";

import { CRM_OPEN_DEAL_STATUSES } from "../crm.constants.js";
import {
  DEDUP_ACTIVITY_TITLE,
  toDedupActivityData,
} from "./intake.helpers.js";

describe("intake.helpers deduplication", () => {
  it("treats reserved as open for dedup", () => {
    expect(CRM_OPEN_DEAL_STATUSES).toContain(CrmDealStatus.reserved);
    expect(CRM_OPEN_DEAL_STATUSES).not.toContain(CrmDealStatus.lost);
    expect(CRM_OPEN_DEAL_STATUSES).not.toContain(CrmDealStatus.converted);
  });

  it("builds dedup activity payload", () => {
    const data = toDedupActivityData({
      source: RequestSource.buyer_project_request,
      note: "Still interested",
      createdByUserId: "user_1",
    });
    expect(data.title).toBe(DEDUP_ACTIVITY_TITLE);
    expect(data.description).toContain("buyer_project_request");
    expect(data.description).toContain("Still interested");
    expect(data.createdByUserId).toBe("user_1");
  });
});
