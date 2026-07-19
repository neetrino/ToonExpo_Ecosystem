import { SetMetadata } from "@nestjs/common";

export const IS_OPTIONAL_AUTH_KEY = "isOptionalAuth";

/**
 * Resolves the session user when a cookie is present, but never rejects anonymous callers.
 * Combine with `@Public()` so the global session guard still allows unauthenticated access.
 */
export const OptionalAuth = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
