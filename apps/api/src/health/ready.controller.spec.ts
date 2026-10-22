import { describe, expect, it } from "vitest";

import { ReadyController } from "./ready.controller.js";

describe("ReadyController", () => {
  it("returns ok without calling any dependency", () => {
    const controller = new ReadyController();

    expect(controller.getReady()).toEqual({ status: "ok" });
  });
});
