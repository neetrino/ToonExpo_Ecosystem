import type { ReactNode } from 'react';

type LocaleTemplateProps = {
  children: ReactNode;
};

/**
 * Remounts on each navigation so pages enter with a short fade.
 * Must not apply `transform`/`filter` here — that would trap `fixed`/`sticky`
 * headers rendered by role portals (admin / account / builder / partner).
 */
export default function LocaleTemplate({ children }: LocaleTemplateProps) {
  return <div className="page-enter">{children}</div>;
}
