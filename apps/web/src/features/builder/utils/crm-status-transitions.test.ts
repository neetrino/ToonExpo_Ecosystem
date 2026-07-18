import { describe, expect, it } from "vitest";

import {
  crmStatusRequiresApartment,
  getCrmStatusSelectOptions,
  isCrmStatusTransitionAllowed,
} from "./crm-status-transitions";

describe("isCrmStatusTransitionAllowed", () => {
  it("allows staying on the same status", () => {
    expect(isCrmStatusTransitionAllowed("new_request", "new_request")).toBe(
      true,
    );
  });

  it("allows documented forward transitions", () => {
    expect(isCrmStatusTransitionAllowed("new_request", "assigned")).toBe(true);
    expect(isCrmStatusTransitionAllowed("contacted", "apartment_selected")).toBe(
      true,
    );
    expect(isCrmStatusTransitionAllowed("reserved", "converted")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(isCrmStatusTransitionAllowed("new_request", "reserved")).toBe(false);
    expect(isCrmStatusTransitionAllowed("converted", "lost")).toBe(false);
    expect(isCrmStatusTransitionAllowed("lost", "contacted")).toBe(false);
  });
});

describe("getCrmStatusSelectOptions", () => {
  it("includes current status first", () => {
    const options = getCrmStatusSelectOptions("assigned");
    expect(options[0]).toBe("assigned");
    expect(options).toContain("contacted");
    expect(options).toContain("lost");
  });

  it("returns only current for terminal statuses", () => {
    expect(getCrmStatusSelectOptions("converted")).toEqual(["converted"]);
    expect(getCrmStatusSelectOptions("closed")).toEqual(["closed"]);
    expect(getCrmStatusSelectOptions("lost")).toEqual(["lost"]);
  });
});

describe("crmStatusRequiresApartment", () => {
  it("flags apartment-gated pipeline stages", () => {
    expect(crmStatusRequiresApartment("apartment_selected")).toBe(true);
    expect(crmStatusRequiresApartment("reserved")).toBe(true);
    expect(crmStatusRequiresApartment("converted")).toBe(true);
    expect(crmStatusRequiresApartment("contacted")).toBe(false);
  });
});
