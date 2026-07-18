/**
 * Infrastructure-only webhook for Next Data Cache tag purge.
 * This is NOT a product API — product reads/writes stay in NestJS (`apps/api`).
 * Called by the API after publish/unpublish mutations.
 */
import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  REVALIDATE_SECRET_HEADER,
  REVALIDATE_TAG_EXPIRE_IMMEDIATE,
} from "@/shared/config/constants";

const revalidateBodySchema = z.object({
  tags: z.array(z.string().min(1).max(256)).min(1).max(32),
});

const compareSecrets = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};

export const POST = async (request: Request): Promise<NextResponse> => {
  const secret = process.env["REVALIDATE_SECRET"]?.trim();

  if (!secret) {
    return NextResponse.json(
      { error: "Revalidation is disabled" },
      { status: 503 },
    );
  }

  const provided = request.headers.get(REVALIDATE_SECRET_HEADER)?.trim() ?? "";
  if (!provided || !compareSecrets(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = revalidateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const uniqueTags = [...new Set(parsed.data.tags)];
  for (const tag of uniqueTags) {
    revalidateTag(tag, REVALIDATE_TAG_EXPIRE_IMMEDIATE);
  }

  return NextResponse.json({
    revalidated: true,
    tags: uniqueTags,
    count: uniqueTags.length,
  });
};
