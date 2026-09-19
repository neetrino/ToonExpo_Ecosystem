import { describe, expect, it } from "vitest";

import { emptyCompanyCopyValues } from "./company-copy-fields.schema";
import { createCompanySchema } from "./create-company.schema";
import { updateCompanySchema } from "./update-company.schema";

const copyFields = {
  ...emptyCompanyCopyValues(),
  nameHy: "Glendale Hills",
};

describe("createCompanySchema", () => {
  it("accepts a valid provisioning payload", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      type: "builder",
      descriptionHy: "Residential developer",
      adminName: "Anna Admin",
      adminEmail: "Anna@Builder.Example",
      adminPhone: "+37491111222",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.adminEmail).toBe("anna@builder.example");
    }
  });

  it("allows empty optional phone and description", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Partner Co",
      type: "partner",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "",
    });

    expect(result.success).toBe(true);
  });

  it("allows plus-only optional phone", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Partner Co",
      type: "partner",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "+",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid company type", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Bad Co",
      type: "agency",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid optional phone", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Bad Phone Co",
      type: "bank",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "12",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty Armenian name", () => {
    const result = createCompanySchema.safeParse({
      ...copyFields,
      nameHy: "   ",
      type: "builder",
      adminName: "Anna Admin",
      adminEmail: "anna@builder.example",
      adminPhone: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateCompanySchema", () => {
  it("accepts a valid update payload", () => {
    const result = updateCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Updated Co",
      descriptionHy: "New copy",
      status: "inactive",
      logoMediaId: "",
      coverMediaId: "",
      phone: "",
      contactPerson: "",
      email: "",
      websiteUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      region: "",
      address: "",
      mediaMaterialsUrl: "",
      advertisingMaterialsUrl: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = updateCompanySchema.safeParse({
      ...copyFields,
      nameHy: "   ",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateCompanySchema.safeParse({
      ...copyFields,
      nameHy: "Updated Co",
      status: "archived",
    });

    expect(result.success).toBe(false);
  });
});
