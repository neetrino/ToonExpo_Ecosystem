import { Skeleton } from '@/shared/ui/skeleton';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

/** One row of placeholders is enough feedback; a full page of them reads as noise. */
const SKELETON_CARD_COUNT = 3;
const SKELETON_ROW_COUNT = 6;

type AdminProjectsResultsSkeletonProps = {
  label: string;
  viewMode?: ViewMode | undefined;
};

const AdminProjectCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-[15px] bg-surface-elevated shadow-xs ring-1 ring-border">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col p-4 sm:p-5">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="mt-3 h-3.5 w-2/5" />
        <Skeleton className="mt-2 h-3.5 w-1/4" />
        <div className="mt-5 flex items-center gap-5 border-t border-border/70 pt-4">
          <Skeleton className="size-9 rounded-sm" />
          <Skeleton className="size-9 rounded-sm" />
          <Skeleton className="ml-auto size-10 rounded-[15px]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Placeholder shown while a new search term is still resolving, so stale rows
 * never pose as search hits.
 */
export const AdminProjectsResultsSkeleton = ({
  label,
  viewMode = VIEW_MODE_CARDS,
}: AdminProjectsResultsSkeletonProps) => {
  const isCards = viewMode === VIEW_MODE_CARDS;

  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {isCards ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <AdminProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-sm border border-border p-3">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      )}
    </div>
  );
};
