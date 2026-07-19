import { describe, expect, it } from "vitest";

import {
  createRequestNoteSchema,
  toCreateBuyerRequestBody,
} from "./create-request.schema";

describe("createRequestNoteSchema", () => {
  it("accepts empty note", () => {
    const result = createRequestNoteSchema.safeParse({ note: "" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace notes", () => {
    const result = createRequestNoteSchema.safeParse({ note: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("hello");
    }
  });

  it("rejects notes over the max length", () => {
    const result = createRequestNoteSchema.safeParse({
      note: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});

describe("toCreateBuyerRequestBody", () => {
  it("omits empty note and optional apartment", () => {
    expect(
      toCreateBuyerRequestBody({ projectId: "p1", note: "  " }),
    ).toEqual({ projectId: "p1" });
  });

  it("includes apartment and note when present", () => {
    expect(
      toCreateBuyerRequestBody({
        projectId: "p1",
        apartmentId: "a1",
        note: " Interested ",
      }),
    ).toEqual({
      projectId: "p1",
      apartmentId: "a1",
      note: "Interested",
    });
  });
});
