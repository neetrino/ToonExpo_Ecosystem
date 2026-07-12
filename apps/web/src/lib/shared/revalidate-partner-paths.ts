import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

export type PartnerPathParams = {
  partnerId?: string;
  partnerSlug?: string;
};

function revalidateLocalePartnerPaths(locale: string, params: PartnerPathParams): void {
  revalidatePath(`/${locale}/admin/partners`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/partners`);
  revalidatePath(`/${locale}/mortgage`);
  revalidatePath(`/${locale}/partner`);
  revalidatePath(`/${locale}/partner/profile`);
  revalidatePath(`/${locale}/partner/offers`);

  if (params.partnerId) {
    revalidatePath(`/${locale}/admin/partners/${params.partnerId}`);
  }
  if (params.partnerSlug) {
    revalidatePath(`/${locale}/partners/${params.partnerSlug}`);
  }
}

/** Revalidates admin, partner cabinet, and public partner/mortgage paths for every locale. */
export function revalidatePartnerPaths(params: PartnerPathParams): void {
  for (const locale of SUPPORTED_LOCALES) {
    revalidateLocalePartnerPaths(locale, params);
  }
}
