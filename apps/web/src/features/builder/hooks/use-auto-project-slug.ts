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

type UseAutoProjectSlugArgs<T extends ProjectSlugFormFields> = {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
};

/**
 * Keeps `slug` in sync with project names until the user edits the slug field.
 * Skips the initial mount so edit forms keep the existing slug until a name changes.
 */
export const useAutoProjectSlug = <T extends ProjectSlugFormFields>({
  control,
  setValue,
  getValues,
}: UseAutoProjectSlugArgs<T>): { lockSlugAuto: () => void } => {
  const lockedRef = useRef(false);
  const skipInitialSyncRef = useRef(true);

  const nameHy = useWatch({ control, name: 'nameHy' as Path<T> }) as string;
  const nameRu = useWatch({ control, name: 'nameRu' as Path<T> }) as string;
  const nameEn = useWatch({ control, name: 'nameEn' as Path<T> }) as string;

  useEffect(() => {
    if (lockedRef.current) {
      return;
    }
    if (skipInitialSyncRef.current) {
      skipInitialSyncRef.current = false;
      return;
    }

    const next = resolveProjectSlugFromNames({ nameEn, nameHy, nameRu });
    const current = getValues('slug' as Path<T>) as string;
    if (next === current) {
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
