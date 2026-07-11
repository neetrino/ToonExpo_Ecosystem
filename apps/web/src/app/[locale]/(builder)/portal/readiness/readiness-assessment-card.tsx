import type { BuilderReadinessAssessment } from '@toonexpo/contracts';
import type { ReadinessStatus } from '@toonexpo/domain';

type ReadinessAssessmentCardProps = {
  assessment: BuilderReadinessAssessment;
  statusLabels: Record<ReadinessStatus, string>;
  categoryLabel: (key: string, fallback: string) => string;
  labels: {
    overallScore: string;
    status: string;
    recommendation: string;
    requiredActions: string;
    lastUpdated: string;
    companyTarget: string;
    projectTarget: string;
    categories: string;
    helpProviders: string;
  };
  formatDate: (date: Date) => string;
};

export function ReadinessAssessmentCard({
  assessment,
  statusLabels,
  categoryLabel,
  labels,
  formatDate,
}: ReadinessAssessmentCardProps) {
  const targetLabel =
    assessment.targetType === 'PROJECT'
      ? `${labels.projectTarget}: ${assessment.projectName ?? '—'}`
      : labels.companyTarget;

  return (
    <article className="portal-section">
      <header className="portal-section__header">
        <h3 className="portal-section__title">{targetLabel}</h3>
        <span className="portal-badge">{statusLabels[assessment.status]}</span>
      </header>

      <dl className="portal-stats">
        <div className="portal-stat">
          <dt className="portal-stat__label">{labels.overallScore}</dt>
          <dd className="portal-stat__value">{assessment.overallScore ?? '—'}</dd>
        </div>
        <div className="portal-stat">
          <dt className="portal-stat__label">{labels.status}</dt>
          <dd className="portal-stat__value">{statusLabels[assessment.status]}</dd>
        </div>
        <div className="portal-stat">
          <dt className="portal-stat__label">{labels.lastUpdated}</dt>
          <dd className="portal-stat__value">{formatDate(assessment.updatedAt)}</dd>
        </div>
      </dl>

      {assessment.recommendation ? (
        <div>
          <h4 className="portal-section__title">{labels.recommendation}</h4>
          <p>{assessment.recommendation}</p>
        </div>
      ) : null}

      {assessment.requiredActions ? (
        <div>
          <h4 className="portal-section__title">{labels.requiredActions}</h4>
          <p>{assessment.requiredActions}</p>
        </div>
      ) : null}

      <h4 className="portal-section__title">{labels.categories}</h4>
      <ul className="portal-list">
        {assessment.categoryScores.map((score) => (
          <li key={score.categoryId} className="portal-list__item">
            <div className="portal-page__heading">
              <strong>{categoryLabel(score.categoryKey, score.categoryName)}</strong>
              <span className="portal-badge">{statusLabels[score.status]}</span>
              <span>{score.score ?? '—'}</span>
            </div>
            {score.recommendation ? <p>{score.recommendation}</p> : null}
            {score.requiredActions ? <p>{score.requiredActions}</p> : null}
          </li>
        ))}
      </ul>
    </article>
  );
}
