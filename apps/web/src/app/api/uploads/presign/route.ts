import { NextResponse } from 'next/server';
import { mediaPresignRequestSchema } from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { assertNotRateLimited } from '@/lib/rate-limit';
import { createMediaPresign } from '@/lib/storage';

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Builder-only: mint a short-lived R2 PUT URL scoped to the session company.
 * R2 credentials never reach the browser.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await assertBuilderSession();
  if (!session?.session.user?.id) {
    return jsonError('unauthorized', 401);
  }

  const rate = await assertNotRateLimited('mediaPresign', session.session.user.id);
  if (rate.limited) {
    return jsonError('rateLimited', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('invalidInput', 400);
  }

  const parsed = mediaPresignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('invalidInput', 400);
  }

  const result = await createMediaPresign(session.companyId, parsed.data);
  if (!result.ok) {
    return jsonError(result.error, 503);
  }

  return NextResponse.json(result.data, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
