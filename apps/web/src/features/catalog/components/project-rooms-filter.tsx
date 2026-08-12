'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { PROJECT_ROOM_FILTER_VALUES } from '@/features/catalog/constants/projects';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

type ProjectRoomsFilterProps = {
  /** Active room counts from the URL; empty / undefined = Any (all). */
  rooms?: number[] | undefined;
  /** Optional height/padding overrides for compact toolbars. */
  controlClassName?: string | undefined;
};

/**
 * Multi-select rooms filter for the public projects list.
 * Empty selection means Any (all room counts). Form submits via hidden `rooms`.
 */
export const ProjectRoomsFilter = ({ rooms, controlClassName }: ProjectRoomsFilterProps) => {
  const t = useTranslations('Catalog');
  const roomsKey = rooms?.join(',') ?? '';
  const [values, setValues] = useState<string[]>(() =>
    roomsKey.length > 0 ? roomsKey.split(',') : [],
  );

  useEffect(() => {
    setValues(roomsKey.length > 0 ? roomsKey.split(',') : []);
  }, [roomsKey]);

  const options = useMemo(
    () =>
      PROJECT_ROOM_FILTER_VALUES.map((value) => ({
        value,
        label: value === '4' ? t('filters.roomsFourPlus') : value,
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink-secondary">{t('filters.rooms')}</span>
      <MultiListboxSelect
        id="project-filters-rooms"
        variant="field"
        size="full"
        values={values}
        options={options}
        allLabel={t('filters.any')}
        selectedCountLabel={(count) => t('filters.roomsSelectedCount', { count })}
        aria-label={t('filters.rooms')}
        className={controlClassName}
        onChange={setValues}
      />
      {values.length > 0 ? <input type="hidden" name="rooms" value={values.join(',')} /> : null}
    </div>
  );
};
