import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Reflector } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import type { AppEnv } from "../../config/env.validation.js";
import { CsrfOriginGuard } from "./csrf-origin.guard.js";

const ALLOWED_ORIGIN = "http://localhost:3000";
const FOREIGN_ORIGIN = "https://evil.example.com";
const SESSION_COOKIE_NAME = "toonexpo_session";

type RequestStub = {
  method: string;
  headers: { origin?: string };
  cookies?: Record<string, string>;
};

const createGuard = (isPublic: boolean): CsrfOriginGuard => {
  const reflector = {
    getAllAndOverride: () => isPublic,
  } as unknown as Reflector;
  const configService = {
    get: (key: keyof AppEnv) => {
      if (key === "CORS_ORIGINS") {
        return [ALLOWED_ORIGIN];
      }
      return SESSION_COOKIE_NAME;
    },
  } as unknown as ConfigService<AppEnv, true>;

  return new CsrfOriginGuard(reflector, configService);
};

const createContext = (request: RequestStub): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe("CsrfOriginGuard", () => {
  it("allows safe methods without any origin", () => {
    const guard = createGuard(false);
    const context = createContext({ method: "GET", headers: {} });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("rejects a public mutation with a foreign Origin (login-CSRF)", () => {
    const guard = createGuard(true);
    const context = createContext({
      method: "POST",
      headers: { origin: FOREIGN_ORIGIN },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("allows a public mutation with an allowlisted Origin", () => {
    const guard = createGuard(true);
    const context = createContext({
      method: "POST",
      headers: { origin: ALLOWED_ORIGIN },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows a public mutation without an Origin header (non-browser client)", () => {
    const guard = createGuard(true);
    const context = createContext({ method: "POST", headers: {} });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("rejects a cookie-authenticated mutation without an Origin header", () => {
    const guard = createGuard(false);
    const context = createContext({
      method: "POST",
      headers: {},
      cookies: { [SESSION_COOKIE_NAME]: "raw-token" },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("rejects a cookie-authenticated mutation with a foreign Origin", () => {
    const guard = createGuard(false);
    const context = createContext({
      method: "POST",
      headers: { origin: FOREIGN_ORIGIN },
      cookies: { [SESSION_COOKIE_NAME]: "raw-token" },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("allows a cookie-authenticated mutation with an allowlisted Origin", () => {
    const guard = createGuard(false);
    const context = createContext({
      method: "POST",
      headers: { origin: ALLOWED_ORIGIN },
      cookies: { [SESSION_COOKIE_NAME]: "raw-token" },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows a cookie-less non-public mutation without an Origin header", () => {
    const guard = createGuard(false);
    const context = createContext({ method: "POST", headers: {} });

    expect(guard.canActivate(context)).toBe(true);
  });
});
