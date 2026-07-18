import { describe, expect, it } from "vitest";

import { shouldRevealPrice } from "../../catalog/mappers/catalog.mapper.js";
import { mapFavoriteApartmentCard } from "./favorite-apartment.mapper.js";

describe("mapFavoriteApartmentCard price visibility", () => {
  const apartment = {
    id: "apt_1",
    number: "12",
    salesStatus: "available" as const,
    rooms: 2,
    areaTotal: { toString: () => "72.5" },
    price: { toString: () => "45000000" },
    priceCurrency: "AMD",
    priceVisibility: "visible_after_login",
    project: {
      id: "proj_1",
      name: "Project",
      slug: "project",
      builderCompany: {
        id: "co_1",
        name: "Builder",
        logoMedia: null,
      },
    },
  };

  it("hides price for anonymous viewers", () => {
    const card = mapFavoriteApartmentCard(apartment as never, {
      locale: "hy",
      isAuthenticated: false,
      translations: [],
    });

    expect(card.price).toBeNull();
    expect(shouldRevealPrice("visible_after_login", false)).toBe(false);
  });

  it("reveals price for authenticated buyers", () => {
    const card = mapFavoriteApartmentCard(apartment as never, {
      locale: "hy",
      isAuthenticated: true,
      translations: [],
    });

    expect(card.price).toBe("45000000");
  });
});
