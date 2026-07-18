import { describe, expect, it } from "vitest";

import { updateApartmentSchema } from "./apartment.schema";
import {
  bulkApartmentsSchema,
  createBuildingSchema,
  createFloorSchema,
} from "./inventory.schema";
import { createProjectSchema } from "./project.schema";
import { inviteMemberSchema } from "./team.schema";

describe("createProjectSchema", () => {
  it("requires Armenian name", () => {
    const result = createProjectSchema.safeParse({
      nameHy: "",
      nameRu: "Проект",
      nameEn: "Project",
      slug: "",
      shortDescriptionHy: "",
      shortDescriptionRu: "",
      shortDescriptionEn: "",
      fullDescriptionHy: "",
      fullDescriptionRu: "",
      fullDescriptionEn: "",
      locationTextHy: "",
      locationTextRu: "",
      locationTextEn: "",
      address: "",
      city: "",
      district: "",
      projectType: "",
      constructionStatus: "",
      completionDate: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid create payload", () => {
    const result = createProjectSchema.safeParse({
      nameHy: "Հյուսիսային",
      nameRu: "Северный",
      nameEn: "Northern",
      slug: "northern",
      shortDescriptionHy: "Նկարագրություն",
      shortDescriptionRu: "",
      shortDescriptionEn: "",
      fullDescriptionHy: "",
      fullDescriptionRu: "",
      fullDescriptionEn: "",
      locationTextHy: "Երևան",
      locationTextRu: "",
      locationTextEn: "",
      address: "Address 1",
      city: "Yerevan",
      district: "Kentron",
      projectType: "residential",
      constructionStatus: "under_construction",
      completionDate: "2027-06-01",
    });

    expect(result.success).toBe(true);
  });
});

describe("createBuildingSchema", () => {
  it("rejects empty name", () => {
    expect(
      createBuildingSchema.safeParse({ name: "  ", description: "" }).success,
    ).toBe(false);
  });
});

describe("createFloorSchema", () => {
  it("accepts a floor number", () => {
    const result = createFloorSchema.safeParse({
      floorNumber: "3",
      name: "",
      displayLabel: "3F",
    });
    expect(result.success).toBe(true);
  });
});

describe("bulkApartmentsSchema", () => {
  it("accepts a bulk template", () => {
    const result = bulkApartmentsSchema.safeParse({
      count: "5",
      numberPrefix: "A-",
      startNumber: "1",
      rooms: "2",
      bedrooms: "1",
      bathrooms: "1",
      areaTotal: "65",
      price: "50000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects count above max", () => {
    const result = bulkApartmentsSchema.safeParse({
      count: "500",
      numberPrefix: "",
      startNumber: "1",
      rooms: "",
      bedrooms: "",
      bathrooms: "",
      areaTotal: "",
      price: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateApartmentSchema", () => {
  it("accepts reserved with optional reason", () => {
    const result = updateApartmentSchema.safeParse({
      number: "12A",
      rooms: "2",
      bedrooms: "1",
      bathrooms: "1",
      areaTotal: "70",
      areaLiving: "",
      balconyArea: "",
      price: "100000",
      priceVisibility: "public",
      salesStatus: "reserved",
      statusChangeReason: "Deposit paid",
      descriptionHy: "",
      descriptionRu: "",
      descriptionEn: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts available without reason", () => {
    const result = updateApartmentSchema.safeParse({
      number: "12A",
      rooms: "2",
      bedrooms: "",
      bathrooms: "",
      areaTotal: "70",
      areaLiving: "",
      balconyArea: "",
      price: "",
      priceVisibility: "by_request",
      salesStatus: "available",
      statusChangeReason: "",
      descriptionHy: "Նկարագրություն",
      descriptionRu: "",
      descriptionEn: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("inviteMemberSchema", () => {
  it("normalizes email and accepts invite", () => {
    const result = inviteMemberSchema.safeParse({
      name: "Anna",
      email: "Anna@Builder.Example",
      phone: "+37491111222",
      role: "member",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("anna@builder.example");
    }
  });
});
