import type { ReactNode } from 'react';

type LocaleTemplateProps = {
  children: ReactNode;
};

/**
 * Remounts on each navigation so public pages enter with a short fade/slide.
 * Layout chrome (header) stays outside this template and does not jump.
 */
export default function LocaleTemplate({ children }: LocaleTemplateProps) {
  return <div className="page-enter">{children}</div>;
}
