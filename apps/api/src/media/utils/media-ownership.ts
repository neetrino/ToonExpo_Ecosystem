import type { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";

/**
 * Ensures a media asset exists and belongs to the company when ownership is set.
 * Admin-owned assets (null ownerCompanyId) are allowed for any company scope.
 */
export const requireCompanyMediaAsset = async (
  prisma: PrismaService,
  mediaAssetId: string,
  companyId: string,
): Promise<void> => {
  const asset = await prisma.db.mediaAsset.findUnique({
    where: { id: mediaAssetId },
    select: { id: true, ownerCompanyId: true },
  });
  if (!asset) {
    throw entityNotFound("Media asset");
  }
  if (asset.ownerCompanyId != null && asset.ownerCompanyId !== companyId) {
    throw entityNotFound("Media asset");
  }
};

/**
 * Validates optional logo/cover media before persisting on a company record.
 */
export const resolveOptionalCompanyLogoMediaId = async (
  prisma: PrismaService,
  logoMediaId: string | null | undefined,
  companyId: string,
): Promise<string | null | undefined> => {
  if (logoMediaId === undefined) {
    return undefined;
  }
  if (logoMediaId === null) {
    return null;
  }
  await requireCompanyMediaAsset(prisma, logoMediaId, companyId);
  return logoMediaId;
};
