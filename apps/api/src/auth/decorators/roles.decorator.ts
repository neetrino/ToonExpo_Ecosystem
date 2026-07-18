import { SetMetadata } from "@nestjs/common";
import type { PlatformRole } from "@toonexpo/contracts";

export const ROLES_KEY = "roles";

/**
 * Restricts a route to one or more platform roles.
 */
export const Roles = (
  ...roles: PlatformRole[]
): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
