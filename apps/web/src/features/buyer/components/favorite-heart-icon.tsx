import { cn } from "@/shared/ui/cn";

type FavoriteHeartIconProps = {
  filled: boolean;
  className?: string | undefined;
};

/**
 * Outline / filled heart for favorite toggles.
 */
export const FavoriteHeartIcon = ({
  filled,
  className,
}: FavoriteHeartIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={cn("size-5", className)}
  >
    <path
      d="M12 20.5 10.55 19.2C5.4 14.63 2 11.55 2 7.75 2 4.92 4.22 2.75 7 2.75c1.74 0 3.41.9 4.3 2.34C12.19 3.65 13.86 2.75 15.6 2.75 18.38 2.75 20.6 4.92 20.6 7.75c0 3.8-3.4 6.88-8.55 11.45L12 20.5Z"
      className={cn(
        "transition-colors",
        filled
          ? "fill-brand stroke-brand"
          : "fill-transparent stroke-current",
      )}
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  </svg>
);
