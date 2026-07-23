'use client';

import {
  SIDE_SHEET_CLOSE_BUTTON_TOP_PX,
  SIDE_SHEET_CLOSE_ICON_OFFSET_X_PX,
  SIDE_SHEET_CLOSE_ICON_SIZE_PX,
  SIDE_SHEET_CLOSE_ICON_STROKE_WIDTH,
  SIDE_SHEET_CLOSE_TAB_HEIGHT_PX,
  SIDE_SHEET_CLOSE_TAB_HOVER_SCALE,
  SIDE_SHEET_CLOSE_TAB_TRANSITION_MS,
  SIDE_SHEET_CLOSE_TAB_WIDTH_PX,
  SIDE_SHEET_CLOSE_TAB_Z_INDEX,
} from '@/shared/ui/side-sheet.constants';
import { cn } from '@/shared/ui/cn';
import styles from '@/shared/ui/drawer-close-tab.module.css';

type DrawerCloseTabEdge = 'start' | 'end';

type DrawerCloseTabProps = {
  edge: DrawerCloseTabEdge;
  onClose: () => void;
  closeLabel: string;
};

/**
 * Side-tab close control — tucks under drawer edge (MaMarie cart/admin sheet pattern).
 */
export const DrawerCloseTab = ({ edge, onClose, closeLabel }: DrawerCloseTabProps) => {
  const isStartEdge = edge === 'start';
  const tabRadiusPx = SIDE_SHEET_CLOSE_TAB_HEIGHT_PX / 2;
  const tabHalfWidthPx = SIDE_SHEET_CLOSE_TAB_WIDTH_PX / 2;
  const iconNudgePx = isStartEdge
    ? SIDE_SHEET_CLOSE_ICON_OFFSET_X_PX
    : -SIDE_SHEET_CLOSE_ICON_OFFSET_X_PX;

  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        isStartEdge ? styles['closeTabStart'] : styles['closeTabEnd'],
        'absolute flex items-center justify-center bg-brand text-on-brand',
      )}
      style={{
        top: SIDE_SHEET_CLOSE_BUTTON_TOP_PX,
        ...(isStartEdge ? { left: 0 } : { right: 0 }),
        zIndex: SIDE_SHEET_CLOSE_TAB_Z_INDEX,
        width: SIDE_SHEET_CLOSE_TAB_WIDTH_PX,
        height: SIDE_SHEET_CLOSE_TAB_HEIGHT_PX,
        borderRadius: tabRadiusPx,
        paddingRight: isStartEdge ? tabHalfWidthPx : undefined,
        paddingLeft: isStartEdge ? undefined : tabHalfWidthPx,
        ['--drawer-close-tab-hover-scale' as string]: SIDE_SHEET_CLOSE_TAB_HOVER_SCALE,
        ['--drawer-close-tab-transition-ms' as string]: `${SIDE_SHEET_CLOSE_TAB_TRANSITION_MS}ms`,
      }}
      aria-label={closeLabel}
    >
      <svg
        width={SIDE_SHEET_CLOSE_ICON_SIZE_PX}
        height={SIDE_SHEET_CLOSE_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={SIDE_SHEET_CLOSE_ICON_STROKE_WIDTH}
        aria-hidden
        style={{ transform: `translateX(${iconNudgePx}px)` }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};
