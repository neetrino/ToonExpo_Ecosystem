/**
 * Real-DB concurrency check: two identical BOS provisioning calls with the same requestId.
 * Uses root .env DATABASE_URL; cleans up all temp rows in finally.
 *
 * Run from repo root:
 *   pnpm --filter @toonexpo/db exec tsx --tsconfig "$PWD/apps/api/tsconfig.json" --env-file="$PWD/.env" "$PWD/apps/api/scripts/bos-provisioning-concurrency.ts"
 */
import { prisma } from '@toonexpo/db';

import { PrismaService } from '../src/common/prisma.service';
import { BosProvisioningService } from '../src/modules/integrations/bos/bos-provisioning.service';

const RUN_ID = `bos-race-${Date.now()}`;

type TempIds = {
  requestId: string;
  email: string;
  bosCompanyId: string;
  companyIds: string[];
  userIds: string[];
};

function buildBody(ids: TempIds) {
  return {
    requestId: ids.requestId,
    bosCompanyId: ids.bosCompanyId,
    companyName: `Race Builder ${RUN_ID}`,
    companyType: 'builder' as const,
    primaryContactName: 'Race Contact',
    primaryContactEmail: ids.email,
    requestedModules: ['builder_portal' as const],
  };
}

async function cleanup(ids: TempIds): Promise<void> {
  await prisma.integrationAuditLog.deleteMany({
    where: { requestId: ids.requestId },
  });
  await prisma.provisioningRequest.deleteMany({
    where: { requestId: ids.requestId },
  });

  if (ids.userIds.length > 0) {
    await prisma.companyMember.deleteMany({ where: { userId: { in: ids.userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: ids.userIds } } });
  }
  await prisma.user.deleteMany({ where: { email: ids.email } });

  if (ids.companyIds.length > 0) {
    await prisma.companyMember.deleteMany({ where: { companyId: { in: ids.companyIds } } });
    await prisma.company.deleteMany({ where: { id: { in: ids.companyIds } } });
  }

  await prisma.company.deleteMany({
    where: { name: `Race Builder ${RUN_ID}` },
  });
}

function isCoherentOutcome(outcome: {
  kind: string;
  response?: { primaryUserId?: string | null; toonexpoCompanyId?: string | null };
}): boolean {
  return (
    outcome.kind === 'created' ||
    outcome.kind === 'idempotent' ||
    outcome.kind === 'busy' ||
    outcome.kind === 'linked'
  );
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('[bos-race] DATABASE_URL is missing (pass --env-file to root .env)');
    process.exitCode = 1;
    return;
  }

  const ids: TempIds = {
    requestId: `${RUN_ID}-req`,
    email: `${RUN_ID}@bos-race.test`,
    bosCompanyId: `${RUN_ID}-bos-co`,
    companyIds: [],
    userIds: [],
  };

  const service = new BosProvisioningService(new PrismaService());
  const body = buildBody(ids);

  console.log(`[bos-race] starting ${RUN_ID}`);

  try {
    const [first, second] = await Promise.all([service.provision(body), service.provision(body)]);

    console.log(
      '[bos-race] first',
      first.kind,
      first.kind !== 'busy' && first.kind !== 'validation' ? first : '',
    );
    console.log(
      '[bos-race] second',
      second.kind,
      second.kind !== 'busy' && second.kind !== 'validation' ? second : '',
    );

    let resolvedSecond = second;
    if (second.kind === 'busy') {
      resolvedSecond = await service.provision(body);
      console.log('[bos-race] second-after-busy', resolvedSecond.kind);
    }
    let resolvedFirst = first;
    if (first.kind === 'busy') {
      resolvedFirst = await service.provision(body);
      console.log('[bos-race] first-after-busy', resolvedFirst.kind);
    }

    const outcomes = [resolvedFirst, resolvedSecond];
    for (const outcome of outcomes) {
      if (!isCoherentOutcome(outcome)) {
        console.error('[bos-race] FAIL: incoherent outcome', outcome);
        process.exitCode = 1;
        return;
      }
      if (
        (outcome.kind === 'created' ||
          outcome.kind === 'idempotent' ||
          outcome.kind === 'linked') &&
        outcome.response.toonexpoCompanyId &&
        outcome.response.primaryUserId
      ) {
        ids.companyIds.push(outcome.response.toonexpoCompanyId);
        ids.userIds.push(outcome.response.primaryUserId);
      }
    }

    const userCount = await prisma.user.count({ where: { email: ids.email } });
    const companyCount = await prisma.company.count({
      where: { name: `Race Builder ${RUN_ID}` },
    });
    const provisionCount = await prisma.provisioningRequest.count({
      where: { requestId: ids.requestId },
    });

    const createdCount = outcomes.filter((o) => o.kind === 'created').length;
    const idempotentCount = outcomes.filter((o) => o.kind === 'idempotent').length;

    console.log('[bos-race] userCount', userCount);
    console.log('[bos-race] companyCount', companyCount);
    console.log('[bos-race] provisionCount', provisionCount);
    console.log('[bos-race] createdCount', createdCount);
    console.log('[bos-race] idempotentCount', idempotentCount);

    const ok =
      userCount === 1 &&
      companyCount === 1 &&
      provisionCount === 1 &&
      createdCount === 1 &&
      idempotentCount === 1;

    if (!ok) {
      console.error(
        '[bos-race] FAIL: expected exactly one user/company/provision row, one created + one idempotent',
      );
      process.exitCode = 1;
      return;
    }

    console.log('[bos-race] PASS');
  } finally {
    await cleanup(ids);
    console.log('[bos-race] cleaned up temp rows');
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('[bos-race] fatal', error);
  process.exitCode = 1;
});
