import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client.js";

export { Prisma, PrismaClient } from "./generated/prisma/client.js";
export * from "./generated/prisma/enums.js";
export {
  QR_TOKEN_BYTES,
  createQrToken,
  decryptQrToken,
  encryptQrToken,
  hashQrToken,
} from "./qr-token.js";

export type CreatePrismaClientOptions = {
  connectionString: string;
};

/**
 * Creates a Prisma 7 client backed by the `pg` driver adapter.
 * Runtime usage is allowed only from `apps/api`.
 */
export const createPrismaClient = (
  options: CreatePrismaClientOptions,
): PrismaClient => {
  const adapter = new PrismaPg({
    connectionString: options.connectionString,
  });

  return new PrismaClient({ adapter });
};
