'use client';

import { useEffect, useRef } from 'react';
import { type Control, type Path, useWatch } from 'react-hook-form';

import { resolveProjectSlugFromNames } from '@/features/builder/utils/project-slug';

type ProjectSlugFormFields = {
  nameHy: string;
  nameRu: string;
  nameEn: string;
  slug: string;
};

type NameSnapshot = {
  nameHy: string;
  nameRu: string;
  nameEn: string;
};

type UseAutoProjectSlugArgs<T extends ProjectSlugFormFields> = {
  control: Control<T>;
  getSlug: () => string;
  setSlug: (slug: string) => void;
};

const namesEqual = (a: NameSnapshot, b: NameSnapshot): boolean =>
  a.nameHy === b.nameHy && a.nameRu === b.nameRu && a.nameEn === b.nameEn;

/**
 * Keeps `slug` in sync with project names until the user edits the slug field.
 * Compares against form defaultValues so Save/reset does not mark the form dirty.
 */
export const useAutoProjectSlug = <T extends ProjectSlugFormFields>({
  control,
  getSlug,
  setSlug,
}: UseAutoProjectSlugArgs<T>): { lockSlugAuto: () => void } => {
  const lockedRef = useRef(false);
  const getSlugRef = useRef(getSlug);
  const setSlugRef = useRef(setSlug);
  getSlugRef.current = getSlug;
  setSlugRef.current = setSlug;

  const nameHy = useWatch({ control, name: 'nameHy' as Path<T> }) as string | undefined;
  const nameRu = useWatch({ control, name: 'nameRu' as Path<T> }) as string | undefined;
  const nameEn = useWatch({ control, name: 'nameEn' as Path<T> }) as string | undefined;

  useEffect(() => {
    if (typeof nameHy !== 'string' || typeof nameRu !== 'string' || typeof nameEn !== 'string') {
      return;
    }

    const current: NameSnapshot = { nameHy, nameRu, nameEn };
    const defaults = control._defaultValues as Partial<ProjectSlugFormFields>;
    const baseline: NameSnapshot = {
      nameHy: defaults.nameHy ?? '',
      nameRu: defaults.nameRu ?? '',
      nameEn: defaults.nameEn ?? '',
    };

    if (lockedRef.current || namesEqual(current, baseline)) {
      return;
    }

    const next = resolveProjectSlugFromNames(current);
    if (next === getSlugRef.current()) {
      return;
    }

    setSlugRef.current(next);
  }, [control, nameEn, nameHy, nameRu]);

  return {
    lockSlugAuto: () => {
      lockedRef.current = true;
    },
  };
};
