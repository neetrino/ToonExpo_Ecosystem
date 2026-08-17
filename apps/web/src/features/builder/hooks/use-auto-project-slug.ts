'use client';

import { useEffect, useRef } from 'react';
import {
  type Control,
  type Path,
  type UseFormGetValues,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';

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
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
};

const namesEqual = (a: NameSnapshot, b: NameSnapshot): boolean =>
  a.nameHy === b.nameHy && a.nameRu === b.nameRu && a.nameEn === b.nameEn;

/**
 * Keeps `slug` in sync with project names until the user edits the slug field.
 * Does not overwrite the slug until at least one name field changes from the
 * values present when the form mounted (safe for edit + React Strict Mode).
 */
export const useAutoProjectSlug = <T extends ProjectSlugFormFields>({
  control,
  setValue,
  getValues,
}: UseAutoProjectSlugArgs<T>): { lockSlugAuto: () => void } => {
  const lockedRef = useRef(false);
  const baselineRef = useRef<NameSnapshot | null>(null);

  const nameHy = useWatch({ control, name: 'nameHy' as Path<T> }) as string;
  const nameRu = useWatch({ control, name: 'nameRu' as Path<T> }) as string;
  const nameEn = useWatch({ control, name: 'nameEn' as Path<T> }) as string;

  useEffect(() => {
    const current: NameSnapshot = { nameHy, nameRu, nameEn };

    if (baselineRef.current === null) {
      baselineRef.current = current;
      return;
    }

    if (lockedRef.current || namesEqual(current, baselineRef.current)) {
      return;
    }

    const next = resolveProjectSlugFromNames(current);
    const previousSlug = getValues('slug' as Path<T>) as string;
    if (next === previousSlug) {
      return;
    }

    setValue('slug' as Path<T>, next as T[Path<T>], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [nameEn, nameHy, nameRu, getValues, setValue]);

  return {
    lockSlugAuto: () => {
      lockedRef.current = true;
    },
  };
};
