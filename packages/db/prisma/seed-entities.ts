import {
  DEMO_COVER_BY_PROJECT,
  DEMO_LOGO_BY_BUILDER,
  SEED_BUILDERS,
  SEED_PROJECTS,
} from './seed-data.js';
import {
  buildExtraSeedProjects,
  DEMO_COVER_BY_PROJECT_EXTRA,
  DEMO_LOGO_BY_BUILDER_EXTRA,
  SEED_BUILDERS_EXTRA,
} from './seed-data-extra.js';

Object.assign(DEMO_COVER_BY_PROJECT, DEMO_COVER_BY_PROJECT_EXTRA);
Object.assign(DEMO_LOGO_BY_BUILDER, DEMO_LOGO_BY_BUILDER_EXTRA);

/** All seed builders including extra catalog volume. */
export const ALL_SEED_BUILDERS = [...SEED_BUILDERS, ...SEED_BUILDERS_EXTRA];

/** All published seed projects including extra catalog volume. */
export const ALL_SEED_PROJECTS = [...SEED_PROJECTS, ...buildExtraSeedProjects()];
