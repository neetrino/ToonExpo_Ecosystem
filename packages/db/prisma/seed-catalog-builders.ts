import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  MediaAssetType,
  type PrismaClient,
} from '../src/index.js';
import {
  DEMO_ORPHAN_BUILDER_LOGO,
  demoLogoUrl,
  SEED_ID_PREFIX,
  toSeedMediaUrl,
} from './seed-data.js';
import { ALL_SEED_BUILDERS } from './seed-entities.js';

const SEED_BUILDERS = ALL_SEED_BUILDERS;

const upsertBuilderLogo = async (
  prisma: PrismaClient,
  builder: (typeof SEED_BUILDERS)[number],
): Promise<void> => {
  await prisma.mediaAsset.upsert({
    where: { id: builder.logoId },
    create: {
      id: builder.logoId,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: demoLogoUrl(builder.id, builder.name),
      title: `${builder.name} logo`,
      altText: builder.name,
    },
    update: {
      type: MediaAssetType.image,
      fileUrl: demoLogoUrl(builder.id, builder.name),
      title: `${builder.name} logo`,
      altText: builder.name,
    },
  });
};

export const upsertSeedBuilders = async (prisma: PrismaClient): Promise<void> => {
  for (const builder of SEED_BUILDERS) {
    await upsertBuilderLogo(prisma, builder);
    await prisma.company.upsert({
      where: { id: builder.id },
      create: {
        id: builder.id,
        name: builder.name,
        description: `${builder.name} — residential developer in Yerevan.`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
        logoMediaId: builder.logoId,
      },
      update: {
        name: builder.name,
        description: `${builder.name} — residential developer in Yerevan.`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
        logoMediaId: builder.logoId,
      },
    });
    await prisma.mediaAsset.update({
      where: { id: builder.logoId },
      data: { ownerCompanyId: builder.id },
    });
  }

  await ensureOrphanBuilderDemoLogos(prisma);
};

/**
 * Assigns a demo logo to active builders that still have no logoMediaId.
 */
const ensureOrphanBuilderDemoLogos = async (prisma: PrismaClient): Promise<void> => {
  const orphans = await prisma.company.findMany({
    where: {
      type: CompanyType.builder,
      status: CompanyStatus.active,
      logoMediaId: null,
    },
    select: { id: true, name: true },
  });

  for (const orphan of orphans) {
    const logoId = `${SEED_ID_PREFIX}media_logo_orphan_${orphan.id}`;
    await prisma.mediaAsset.upsert({
      where: { id: logoId },
      create: {
        id: logoId,
        ownerCompanyId: orphan.id,
        type: MediaAssetType.image,
        fileUrl: toSeedMediaUrl(DEMO_ORPHAN_BUILDER_LOGO),
        title: `${orphan.name} logo`,
        altText: orphan.name,
      },
      update: {
        ownerCompanyId: orphan.id,
        type: MediaAssetType.image,
        fileUrl: toSeedMediaUrl(DEMO_ORPHAN_BUILDER_LOGO),
        title: `${orphan.name} logo`,
        altText: orphan.name,
      },
    });
    await prisma.company.update({
      where: { id: orphan.id },
      data: { logoMediaId: logoId },
    });
  }
};
