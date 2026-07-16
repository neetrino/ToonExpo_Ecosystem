'use client';

import type { ProjectCompletenessKey } from '@/lib/projects/project-completeness';

type ProjectCompletenessBadgeProps = {
  missingKeys: ProjectCompletenessKey[];
  labels: {
    incomplete: string;
    missingCount: (count: number) => string;
    items: Record<ProjectCompletenessKey, string>;
  };
};

export function ProjectCompletenessBadge({ missingKeys, labels }: ProjectCompletenessBadgeProps) {
  if (missingKeys.length === 0) {
    return null;
  }

  const title = missingKeys.map((key) => labels.items[key]).join(', ');

  return (
    <span
      className="portal-badge portal-badge--draft"
      title={title}
      aria-label={`${labels.incomplete}: ${title}`}
    >
      {labels.incomplete} {labels.missingCount(missingKeys.length)}
    </span>
  );
}
