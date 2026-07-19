import { describe, expect, it } from "vitest";

import {
  buildFavoriteTargetKey,
  serializeFavoriteTargets,
} from "./favorite-target-key";

describe("favorite-target-key", () => {
  it("builds stable batch keys", () => {
    expect(buildFavoriteTargetKey("project", "p1")).toBe("project:p1");
    expect(
      serializeFavoriteTargets([
        { targetType: "apartment", targetId: "a2" },
        { targetType: "project", targetId: "p1" },
      ]),
    ).toBe("apartment:a2,project:p1");
  });
});
