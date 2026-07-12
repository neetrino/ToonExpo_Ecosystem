'use server';

import { z } from 'zod';

import { prisma } from '@toonexpo/db';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { recordAudit } from '@/lib/audit/record-audit';
import {
  clearActiveCompanyCookie,
  readActiveCompanyId,
  setActiveCompanyCookie,
} from '@/lib/builder/active-company-cookie';

const companyIdSchema = z.string().trim().min(1).max(64);

export type ActiveCompanyActionResult =
  { ok: true } | { ok: false; errorKey: 'unauthorized' | 'invalidInput' | 'notFound' };

function unauthorized(): ActiveCompanyActionResult {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): ActiveCompanyActionResult {
  return { ok: false, errorKey: 'invalidInput' };
}

function notFound(): ActiveCompanyActionResult {
  return { ok: false, errorKey: 'notFound' };
}

/**
 * Admin: set active company cookie, audit start, redirect into portal.
 */
export async function startActingOnBehalfAction(
  locale: string,
  companyIdRaw: unknown,
): Promise<ActiveCompanyActionResult> {
  const session = await assertAdminSession();
  if (!session?.user) {
    return unauthorized();
  }

  const parsed = companyIdSchema.safeParse(companyIdRaw);
  if (!parsed.success) {
    return invalidInput();
  }

  const company = await prisma.company.findUnique({
    where: { id: parsed.data },
    select: { id: true },
  });
  if (!company) {
    return notFound();
  }

  await recordAudit(prisma, {
    actor: { userId: session.user.id, role: 'BIGPROJECTS_ADMIN' },
    action: 'ACTING_ON_BEHALF_START',
    entityType: 'COMPANY',
    entityId: company.id,
    companyId: company.id,
  });

  await setActiveCompanyCookie(company.id);
  redirect(`/${locale}/portal`);
}

/**
 * Admin: clear active company cookie, audit stop, redirect to companies list.
 */
export async function stopActingOnBehalfAction(locale: string): Promise<ActiveCompanyActionResult> {
  const session = await assertAdminSession();
  if (!session?.user) {
    return unauthorized();
  }

  const activeCompanyId = await readActiveCompanyId();
  if (activeCompanyId) {
    const company = await prisma.company.findUnique({
      where: { id: activeCompanyId },
      select: { id: true },
    });
    if (company) {
      await recordAudit(prisma, {
        actor: { userId: session.user.id, role: 'BIGPROJECTS_ADMIN' },
        action: 'ACTING_ON_BEHALF_STOP',
        entityType: 'COMPANY',
        entityId: company.id,
        companyId: company.id,
      });
    }
  }

  await clearActiveCompanyCookie();
  redirect(`/${locale}/admin/companies`);
}

/**
 * Builder or admin-while-acting: update active company cookie and refresh portal.
 */
export async function switchActiveCompanyAction(
  locale: string,
  companyIdRaw: unknown,
): Promise<ActiveCompanyActionResult> {
  const session = await auth();
  if (!session?.user) {
    return unauthorized();
  }

  const parsed = companyIdSchema.safeParse(companyIdRaw);
  if (!parsed.success) {
    return invalidInput();
  }

  const companyId = parsed.data;
  const role = session.user.role;

  if (role === 'BUILDER') {
    const membership = await prisma.companyMember.findFirst({
      where: { userId: session.user.id, companyId },
      select: { id: true },
    });
    if (!membership) {
      return unauthorized();
    }
    await setActiveCompanyCookie(companyId);
    redirect(`/${locale}/portal`);
  }

  if (role === 'BIGPROJECTS_ADMIN') {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) {
      return notFound();
    }
    await setActiveCompanyCookie(company.id);
    redirect(`/${locale}/portal`);
  }

  return unauthorized();
}
