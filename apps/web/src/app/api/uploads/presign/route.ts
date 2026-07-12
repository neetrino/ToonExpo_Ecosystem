import { NextResponse } from 'next/server';
import {
  mediaPresignRequestSchema,
  type UploadPurpose,
} from '@toonexpo/contracts';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { assertPartnerSession } from '@/lib/partner/assert-partner-session';
import { assertNotRateLimited } from '@/lib/rate-limit';
import {
  createUploadPresign,
  type UploadObjectScope,
} from '@/lib/storage';

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

type ResolvedUploadAuth =
  | { ok: true; userId: string; scope: UploadObjectScope }
  | { ok: false };

/**
 * Resolves auth + object-key scope for a upload purpose.
 * Builder purposes use company scope; venue (and admin fallback for logos) use admin scope.
 */
async function resolveUploadAuth(purpose: UploadPurpose): Promise<ResolvedUploadAuth> {
  if (purpose === 'VENUE_IMAGE') {
    return resolveAdminUploadAuth();
  }

  if (purpose === 'MEDIA' || purpose === 'CANVAS_IMAGE') {
    return resolveBuilderUploadAuth();
  }

  // COMPANY_LOGO: builder → partner → admin.
  const builder = await resolveBuilderUploadAuth();
  if (builder.ok) {
    return builder;
  }
  const partner = await resolvePartnerUploadAuth();
  if (partner.ok) {
    return partner;
  }
  return resolveAdminUploadAuth();
}

async function resolveBuilderUploadAuth(): Promise<ResolvedUploadAuth> {
  const session = await assertBuilderSession();
  if (!session?.session.user?.id) {
    return { ok: false };
  }
  return {
    ok: true,
    userId: session.session.user.id,
    scope: { kind: 'company', companyId: session.companyId },
  };
}

async function resolvePartnerUploadAuth(): Promise<ResolvedUploadAuth> {
  const session = await assertPartnerSession();
  if (!session?.session.user?.id) {
    return { ok: false };
  }
  return {
    ok: true,
    userId: session.session.user.id,
    scope: { kind: 'company', companyId: session.companyId },
  };
}

async function resolveAdminUploadAuth(): Promise<ResolvedUploadAuth> {
  const session = await assertAdminSession();
  if (!session?.user?.id) {
    return { ok: false };
  }
  return {
    ok: true,
    userId: session.user.id,
    scope: { kind: 'admin', userId: session.user.id },
  };
}

/**
 * Mint a short-lived R2 PUT URL. Auth depends on `purpose`:
 * - MEDIA / CANVAS_IMAGE → builder session (company-scoped keys)
 * - COMPANY_LOGO → builder preferred, else partner, else admin
 * - VENUE_IMAGE → admin session (admin-scoped keys)
 * R2 credentials never reach the browser.
 */
export async function POST(request: Request): Promise<NextResponse> {
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

  const auth = await resolveUploadAuth(parsed.data.purpose);
  if (!auth.ok) {
    return jsonError('unauthorized', 401);
  }

  const rate = await assertNotRateLimited('mediaPresign', auth.userId);
  if (rate.limited) {
    return jsonError('rateLimited', 429);
  }

  const result = await createUploadPresign(parsed.data.purpose, auth.scope, parsed.data);
  if (!result.ok) {
    return jsonError(result.error, 503);
  }

  return NextResponse.json(result.data, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
