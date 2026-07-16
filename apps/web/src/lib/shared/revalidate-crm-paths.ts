import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

/** Revalidates builder CRM portal routes for every supported locale. */
export function revalidateCrmPortalPaths(): void {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}/portal`);
    revalidatePath(`/${locale}/portal/crm`);
  }
}
