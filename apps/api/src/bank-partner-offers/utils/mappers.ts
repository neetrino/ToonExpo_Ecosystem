import type {
  BankPartnerOfferTemplateItem,
  ProjectBankPartnerOfferItem,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

import { parseStoredFinanceFields } from "./finance-fields.js";

const partnerSelect = {
  name: true,
  logoMedia: { select: { fileUrl: true } },
} satisfies Prisma.PartnerCompanySelect;

export const templateInclude = {
  partnerCompany: { select: partnerSelect },
} satisfies Prisma.BankPartnerOfferTemplateInclude;

export const projectOfferInclude = {
  partnerCompany: { select: partnerSelect },
} satisfies Prisma.ProjectBankPartnerOfferInclude;

type TemplateRow = Prisma.BankPartnerOfferTemplateGetPayload<{
  include: typeof templateInclude;
}>;

type ProjectOfferRow = Prisma.ProjectBankPartnerOfferGetPayload<{
  include: typeof projectOfferInclude;
}>;

export const toTemplateItem = (
  row: TemplateRow,
): BankPartnerOfferTemplateItem => ({
  id: row.id,
  partnerCompanyId: row.partnerCompanyId,
  partnerCompanyName: row.partnerCompany.name,
  partnerCompanyLogoUrl: row.partnerCompany.logoMedia?.fileUrl ?? null,
  name: row.name,
  fields: parseStoredFinanceFields(row.fields),
  publicationStatus: row.publicationStatus,
  sortOrder: row.sortOrder,
  createdByUserId: row.createdByUserId,
  updatedByUserId: row.updatedByUserId,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toProjectOfferItem = (
  row: ProjectOfferRow,
): ProjectBankPartnerOfferItem => ({
  id: row.id,
  projectId: row.projectId,
  templateId: row.templateId,
  partnerCompanyId: row.partnerCompanyId,
  partnerCompanyName: row.partnerCompany.name,
  partnerCompanyLogoUrl: row.partnerCompany.logoMedia?.fileUrl ?? null,
  name: row.name,
  fields: parseStoredFinanceFields(row.fields),
  sortOrder: row.sortOrder,
  createdByUserId: row.createdByUserId,
  updatedByUserId: row.updatedByUserId,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
