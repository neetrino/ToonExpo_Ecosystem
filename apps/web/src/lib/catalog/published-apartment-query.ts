import { publicApartmentDetailSchema, type PublicApartmentDetail } from '@toonexpo/contracts';

import { apiRequest, ApiClientError } from '@/lib/api';

const APARTMENT_ID_PATTERN = /^c[a-z0-9]{20,32}$/i;

/** Validates apartmentId shape before an API request. */
export function isValidApartmentId(apartmentId: string): boolean {
  return APARTMENT_ID_PATTERN.test(apartmentId);
}

/** Loads a published apartment from Nest and forwards a session cookie for protected prices. */
export async function getPublishedApartment(
  companySlug: string,
  projectSlug: string,
  apartmentId: string,
  cookie?: string,
): Promise<PublicApartmentDetail | null> {
  if (!isValidApartmentId(apartmentId)) {
    return null;
  }
  const path = [
    '/catalog/projects',
    encodeURIComponent(companySlug),
    encodeURIComponent(projectSlug),
    'apartments',
    encodeURIComponent(apartmentId),
  ].join('/');
  try {
    const raw = await apiRequest<unknown>(path, { cookie });
    return publicApartmentDetailSchema.parse(raw);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
