import type { Prisma } from "@toonexpo/db";

export type BosProvisioningRecord = Prisma.BosProvisioningRequestGetPayload<object>;
export type CompanyRecord = Prisma.CompanyGetPayload<object>;
export type UserRecord = Prisma.UserGetPayload<object>;

export type ProvisionOutcome = {
  company: CompanyRecord;
  user: UserRecord;
  companyCreated: boolean;
  userCreated: boolean;
  memberCreated: boolean;
  partnerCreated: boolean;
  invitationSent: boolean;
};
