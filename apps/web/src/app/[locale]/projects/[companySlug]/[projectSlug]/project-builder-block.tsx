import { isHttpUrl } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';

type ProjectBuilderBlockProps = {
  companySlug: string;
  companyName: string;
  companyDescription: string | null;
  companyLogoUrl: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyWebsite: string | null;
  labels: {
    title: string;
    phone: string;
    email: string;
    website: string;
    noValue: string;
    viewProfile: string;
  };
};

export function ProjectBuilderBlock({
  companySlug,
  companyName,
  companyDescription,
  companyLogoUrl,
  companyPhone,
  companyEmail,
  companyWebsite,
  labels,
}: ProjectBuilderBlockProps) {
  const hasContacts = companyPhone || companyEmail || companyWebsite;
  const hasContent = companyDescription || companyLogoUrl || hasContacts;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="catalog-detail__builder" aria-labelledby="project-builder-title">
      <h2 id="project-builder-title" className="catalog-section-title">
        {labels.title}
      </h2>
      <div className="catalog-builder-block">
        {companyLogoUrl && isHttpUrl(companyLogoUrl) ? (
          <img src={companyLogoUrl} alt="" className="catalog-builder-block__logo" />
        ) : null}
        <div className="catalog-builder-block__body">
          <h3 className="catalog-builder-block__name">
            <Link href={`/builders/${companySlug}`} className="catalog-builder-block__link">
              {companyName}
            </Link>
          </h3>
          {companyDescription ? (
            <p className="catalog-builder-block__description">{companyDescription}</p>
          ) : null}
          <p className="catalog-builder-block__profile-link">
            <Link href={`/builders/${companySlug}`}>{labels.viewProfile}</Link>
          </p>
          {hasContacts ? (
            <dl className="catalog-builder-block__contacts">
              <div>
                <dt>{labels.phone}</dt>
                <dd>{companyPhone ?? labels.noValue}</dd>
              </div>
              <div>
                <dt>{labels.email}</dt>
                <dd>{companyEmail ?? labels.noValue}</dd>
              </div>
              <div>
                <dt>{labels.website}</dt>
                <dd>
                  {companyWebsite && isHttpUrl(companyWebsite) ? (
                    <a href={companyWebsite} className="catalog-builder-block__link">
                      {companyWebsite}
                    </a>
                  ) : (
                    labels.noValue
                  )}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
