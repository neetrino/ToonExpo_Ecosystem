import { describe, expect, it } from "vitest";

import { createCompanySchema } from "./create-company.schema";
import { updateCompanySchema } from "./update-company.schema";

describe("createCompanySchema", () => {
  it("accepts a valid provisioning payload", () => {
    const result = createCompanySchema.safeParse({
      name: "Glendale Hills",
      type: "builder",
      description: "Residential developer",
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
      name: "Partner Co",
      type: "partner",
      description: "",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid company type", () => {
    const result = createCompanySchema.safeParse({
      name: "Bad Co",
      type: "agency",
      description: "",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid optional phone", () => {
    const result = createCompanySchema.safeParse({
      name: "Bad Phone Co",
      type: "bank",
      description: "",
      adminName: "Bob",
      adminEmail: "bob@example.com",
      adminPhone: "12",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateCompanySchema", () => {
  it("accepts a valid update payload", () => {
    const result = updateCompanySchema.safeParse({
      name: "Updated Co",
      description: "New copy",
      status: "inactive",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = updateCompanySchema.safeParse({
      name: "   ",
      description: "",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateCompanySchema.safeParse({
      name: "Updated Co",
      description: "",
      status: "archived",
    });

    expect(result.success).toBe(false);
  });
});
