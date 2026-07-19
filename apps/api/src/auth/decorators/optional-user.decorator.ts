import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { AuthenticatedUser } from "../types/authenticated-user.js";

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

/**
 * Returns the authenticated user when optional auth resolved a session; otherwise null.
 */
export const OptionalUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | null => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user ?? null;
  },
);
