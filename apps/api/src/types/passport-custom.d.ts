declare module "passport-custom" {
  import type { Request } from "express";

  export type VerifyFunction = (
    request: Request,
    done: (error: Error | null, user?: Express.User | false) => void,
  ) => void;

  export class Strategy {
    name: string;

    constructor(verify: VerifyFunction);
    constructor(options: { passReqToCallback?: boolean }, verify: VerifyFunction);
  }
}
