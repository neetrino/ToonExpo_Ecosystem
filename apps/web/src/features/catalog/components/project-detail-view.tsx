import type { ProjectDetail } from '@toonexpo/contracts';

import { ProjectCatalogSection } from '@/features/catalog/components/project-catalog-section';
import { ProjectConstructionTimeline } from '@/features/catalog/components/project-construction-timeline';
import { ProjectDetailHero } from '@/features/catalog/components/project-detail-hero';
import { ProjectReserveCta } from '@/features/catalog/components/project-reserve-cta';
import { ProjectInteractiveMapSection } from '@/features/visual-map/components/project-interactive-map-section';

type ProjectDetailViewProps = {
  project: ProjectDetail;
};

/**
 * Public project detail layout — Figma frame `89:876` + catalog facts block.
 */
export const ProjectDetailView = ({ project }: ProjectDetailViewProps) => (
  <>
    <ProjectDetailHero project={project} />
    <ProjectInteractiveMapSection projectId={project.id} projectSlug={project.slug} />
    <ProjectCatalogSection project={project} />
    <ProjectConstructionTimeline project={project} />
    <ProjectReserveCta projectId={project.id} projectName={project.name} />
  </>
);
