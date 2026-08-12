import { cn } from '@/shared/ui/cn';

type GalleryThumbItem = {
  id: string;
  fileUrl: string;
};

type ApartmentGalleryThumbGridProps = {
  items: readonly GalleryThumbItem[];
  mainId: string | null;
  mainLabel: string;
  setMainLabel: string;
  removeLabel: string;
  onSelectMain: (id: string) => void;
  onRemove: (id: string) => void;
};

/**
 * Thumbnail grid with main checkbox + remove for apartment gallery editor.
 */
export const ApartmentGalleryThumbGrid = ({
  items,
  mainId,
  mainLabel,
  setMainLabel,
  removeLabel,
  onSelectMain,
  onRemove,
}: ApartmentGalleryThumbGridProps) => (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {items.map((item) => {
      const isMain = item.id === mainId;
      return (
        <li key={item.id} className="relative">
          <button
            type="button"
            className={cn(
              'relative block aspect-square w-full overflow-hidden rounded-md bg-surface',
              'ring-1 ring-header-border',
              isMain && 'ring-2 ring-brand-logo',
            )}
            onClick={() => onSelectMain(item.id)}
            aria-pressed={isMain}
            aria-label={isMain ? mainLabel : setMainLabel}
          >
            <img src={item.fileUrl} alt="" className="size-full object-cover" />
            {isMain ? (
              <span className="absolute inset-x-0 bottom-0 bg-brand-logo px-2 py-1 text-center text-[10px] font-bold tracking-wide text-ink uppercase">
                {mainLabel}
              </span>
            ) : null}
          </button>
          <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-secondary">
            <input
              type="checkbox"
              checked={isMain}
              onChange={() => onSelectMain(item.id)}
              className="size-3.5 accent-brand"
            />
            {isMain ? mainLabel : setMainLabel}
          </label>
          <button
            type="button"
            className="mt-1 text-[11px] font-medium text-danger hover:underline"
            onClick={() => onRemove(item.id)}
          >
            {removeLabel}
          </button>
        </li>
      );
    })}
  </ul>
);
