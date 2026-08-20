'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { PROJECT_ROOM_FILTER_VALUES } from '@/features/catalog/constants/projects';
import { cn } from '@/shared/ui/cn';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

/** Wider than the “Any” label so the control stays easy to tap. */
const ROOMS_CONTROL_MIN_WIDTH_CLASS = 'min-w-24';

type ProjectRoomsFilterProps = {
  /** Active room counts from the URL; empty / undefined = Any (all). */
  rooms?: number[] | undefined;
  /** Optional height/padding overrides for compact toolbars. */
  controlClassName?: string | undefined;
  /** Called when the selection changes so the parent can apply live. */
  onRoomsChange?: ((rooms: number[]) => void) | undefined;
};

/**
 * Multi-select rooms filter for the public projects list.
 * Empty selection means Any (all room counts).
 */
export const ProjectRoomsFilter = ({
  rooms,
  controlClassName,
  onRoomsChange,
}: ProjectRoomsFilterProps) => {
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
    <div className="flex w-fit max-w-full flex-col gap-1">
      <span className="text-xs font-medium text-ink-secondary">{t('filters.rooms')}</span>
      <MultiListboxSelect
        id="project-filters-rooms"
        variant="field"
        size="fit"
        values={values}
        options={options}
        allLabel={t('filters.any')}
        selectedCountLabel={(count) => t('filters.roomsSelectedCount', { count })}
        aria-label={t('filters.rooms')}
        className={cn(controlClassName, ROOMS_CONTROL_MIN_WIDTH_CLASS)}
        onChange={(next) => {
          setValues(next);
          onRoomsChange?.(
            next
              .map((item) => Number.parseInt(item, 10))
              .filter((item) => Number.isFinite(item)),
          );
        }}
      />
    </div>
  );
};
