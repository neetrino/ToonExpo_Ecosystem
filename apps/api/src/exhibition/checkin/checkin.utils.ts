import { Prisma } from "@toonexpo/db";

export const formatCheckInDate = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

export const isUniqueAllowedViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";
