import type { ReactNode } from 'react';

type ProjectCatalogCollapsibleProps = {
  title: string;
  children: ReactNode;
};

/**
 * Always-open catalog section heading + body (About, Key facts, …).
 */
export const ProjectCatalogCollapsible = ({ title, children }: ProjectCatalogCollapsibleProps) => {
  return (
    <div>
      <h3 className="text-[13px] font-bold tracking-[0.18em] text-brand-secondary uppercase">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
};
