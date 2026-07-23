import type { ProjectDetail } from '@toonexpo/contracts';

import { ProjectConstructionTimeline } from '@/features/catalog/components/project-construction-timeline';
import { ProjectDetailHero } from '@/features/catalog/components/project-detail-hero';
import { ProjectFloorPicker } from '@/features/catalog/components/project-floor-picker';
import { ProjectReserveCta } from '@/features/catalog/components/project-reserve-cta';

type ProjectDetailViewProps = {
  project: ProjectDetail;
};

/**
 * Public project detail layout — Figma frame `89:876`.
 */
export const ProjectDetailView = ({ project }: ProjectDetailViewProps) => (
  <>
    <ProjectDetailHero project={project} />
    <ProjectConstructionTimeline project={project} />
    <ProjectFloorPicker project={project} />
    <ProjectReserveCta projectId={project.id} projectName={project.name} />
  </>
);
