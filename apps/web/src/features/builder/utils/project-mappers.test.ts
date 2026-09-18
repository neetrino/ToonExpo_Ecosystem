import { describe, expect, it } from 'vitest';

import type { CreateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { toCreateProjectRequest } from '@/features/builder/utils/project-mappers';

const baseValues = (): CreateProjectFormValues => ({
  nameHy: 'Հյուսիսային',
  nameRu: '',
  nameEn: '',
  slug: 'northern',
  shortDescriptionHy: '',
  shortDescriptionRu: '',
  shortDescriptionEn: '',
  fullDescriptionHy: '',
  fullDescriptionRu: '',
  fullDescriptionEn: '',
  locationTextHy: '',
  locationTextRu: '',
  locationTextEn: '',
  address: '',
  city: '',
  districtHy: '',
  districtRu: '',
  districtEn: '',
  projectTypeHy: 'Բնակելի համալիր',
  projectTypeRu: '',
  projectTypeEn: 'Residential complex',
  constructionStatus: '',
  completionDate: '',
  coverMediaId: '',
  verified: false,
});

describe('toCreateProjectRequest', () => {
  it('stores projectType separately per language', () => {
    const request = toCreateProjectRequest(baseValues());

    expect(request.projectType).toBe('Բնակելի համալիր');
    expect(request.translations?.projectType).toEqual({
      hy: 'Բնակելի համալիր',
      en: 'Residential complex',
    });
    expect(request.translations?.projectType?.ru).toBeUndefined();
  });
});
