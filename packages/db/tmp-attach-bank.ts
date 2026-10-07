import { createPrismaClient, type Prisma } from '@toonexpo/db';

const main = async (): Promise<void> => {
  const db = createPrismaClient({ connectionString: process.env.DATABASE_URL ?? '' });
  const project = await db.project.findUniqueOrThrow({
    where: { slug: 'sunday-tower' },
    select: { id: true },
  });
  const admin = await db.user.findFirstOrThrow({
    where: { accountType: 'platform_admin' },
    select: { id: true },
  });
  const names = ['INECOBANK', 'AMERIA BANK'];
  const templates = await db.bankPartnerOfferTemplate.findMany({
    where: { name: { in: names }, publicationStatus: 'published' },
  });
  const ordered = names
    .map((name) => templates.find((template) => template.name === name))
    .filter((template): template is (typeof templates)[number] => template != null);

  let sortOrder = 0;
  for (const template of ordered) {
    const existing = await db.projectBankPartnerOffer.findFirst({
      where: { projectId: project.id, templateId: template.id },
      select: { id: true },
    });
    if (existing) {
      sortOrder += 1;
      continue;
    }
    await db.projectBankPartnerOffer.create({
      data: {
        project: { connect: { id: project.id } },
        template: { connect: { id: template.id } },
        name: template.name,
        fields: template.fields as Prisma.InputJsonValue,
        sortOrder,
        createdBy: { connect: { id: admin.id } },
        ...(template.partnerCompanyId
          ? { partnerCompany: { connect: { id: template.partnerCompanyId } } }
          : {}),
      },
    });
    sortOrder += 1;
  }

  const attached = await db.projectBankPartnerOffer.findMany({
    where: { projectId: project.id },
    select: { name: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  });
  console.log(JSON.stringify(attached));
  await db.$disconnect();
};

void main();
