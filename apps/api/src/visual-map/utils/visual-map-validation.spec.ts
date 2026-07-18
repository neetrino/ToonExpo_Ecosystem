import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { PublicationStatus } from "@toonexpo/db";

import { assertValidCoordinates } from "./coordinates.js";
import { assertProjectContextId } from "./target-status.js";
import {
  assertTargetTypeMatchesContext,
  expectedTargetType,
} from "./target-type.js";

describe("visual map coordinate validation", () => {
  it("accepts boundary values 0 and 100", () => {
    expect(() => assertValidCoordinates(0, 100)).not.toThrow();
    expect(() => assertValidCoordinates(100, 0)).not.toThrow();
  });

  it("rejects coordinates outside 0-100", () => {
    expect(() => assertValidCoordinates(-0.1, 50)).toThrow(BadRequestException);
    expect(() => assertValidCoordinates(50, 100.1)).toThrow(BadRequestException);
  });
});

describe("visual map context/target rules", () => {
  it("maps each context layer to the expected target type", () => {
    expect(expectedTargetType("project")).toBe("building");
    expect(expectedTargetType("building")).toBe("floor");
    expect(expectedTargetType("floor")).toBe("apartment");
  });

  it("rejects wrong target type for a context", () => {
    expect(() =>
      assertTargetTypeMatchesContext("project", "floor"),
    ).toThrow(BadRequestException);
    expect(() =>
      assertTargetTypeMatchesContext("building", "apartment"),
    ).toThrow(BadRequestException);
  });

  it("requires project contextId to equal projectId", () => {
    expect(() => assertProjectContextId("proj_1", "proj_2")).toThrow(
      BadRequestException,
    );
    expect(() => assertProjectContextId("proj_1", "proj_1")).not.toThrow();
  });
});

describe("resolveTargetStatus", () => {
  it("flags missing, unpublished, and ok targets", async () => {
    const { resolveTargetStatus, isPublicTargetOk } = await import(
      "./target-status.js"
    );

    expect(resolveTargetStatus(null)).toBe("missing");
    expect(
      resolveTargetStatus({ publicationStatus: PublicationStatus.draft }),
    ).toBe("unpublished");
    expect(
      resolveTargetStatus({ publicationStatus: PublicationStatus.published }),
    ).toBe("ok");
    expect(
      isPublicTargetOk({ publicationStatus: PublicationStatus.published }),
    ).toBe(true);
    expect(isPublicTargetOk(null)).toBe(false);
  });
});
