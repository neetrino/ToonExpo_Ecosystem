'use server';

import { provisionAccountSchema } from '@toonexpo/contracts';
import { revalidatePath } from 'next/cache';

import type { ProvisionActionState } from '@/lib/admin/action-state';
import { provisionAccount } from '@/lib/admin/provision';

function parseCompanyName(raw: FormDataEntryValue | null): string | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function provisionAccountAction(
  locale: string,
  _prevState: ProvisionActionState,
  formData: FormData,
): Promise<ProvisionActionState> {
  const parsed = provisionAccountSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    role: formData.get('role'),
    temporaryPassword: formData.get('temporaryPassword'),
    companyName: parseCompanyName(formData.get('companyName')),
  });

  if (!parsed.success) {
    return { errorKey: 'invalidInput' };
  }

  const result = await provisionAccount(parsed.data);
  if (!result.ok) {
    return { errorKey: result.error };
  }

  revalidatePath(`/${locale}/admin`);
  return { successKey: 'provisioned' };
}
