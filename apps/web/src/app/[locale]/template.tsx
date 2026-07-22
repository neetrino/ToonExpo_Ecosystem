import type { ReactNode } from 'react';

import { PageEnter } from '@/shared/ui/motion/page-enter';

type LocaleTemplateProps = {
  children: ReactNode;
};

/**
 * Remounts on navigation. Enter animation runs for real route changes only —
 * locale switches skip it so the page does not jump.
 */
export default function LocaleTemplate({ children }: LocaleTemplateProps) {
  return <PageEnter>{children}</PageEnter>;
}
